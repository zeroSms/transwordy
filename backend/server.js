// 必要なモジュールをインポート
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

// データベースファイルのパスを指定
const dbPath = path.join(__dirname, 'data', 'translation.db');

// データベース接続を取得する関数
const getDbConnection = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    getDbConnection().then(db => {
      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
        db.close();
      });
    }).catch(reject);
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    getDbConnection().then(db => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        db.close();
      });
    }).catch(reject);
  });
};

const retryLimit = 5;  // 再試行回数の制限
const retryDelay = 100;  // 再試行間の遅延 (ミリ秒)

const runQueryWithRetry = async (query, params = [], retries = retryLimit) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await runQuery(query, params);
    } catch (error) {
      if (error.code === 'SQLITE_BUSY') {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
};

const getQueryWithRetry = async (query, params = [], retries = retryLimit) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await getQuery(query, params);
    } catch (error) {
      if (error.code === 'SQLITE_BUSY') {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
};

// Expressアプリケーションを作成
const app = express();
const port = process.env.PORT || 3000;

// JSON解析用ミドルウェア
app.use(express.json());
app.use(cors());

const saltRounds = 10; // ハッシュ化の強度

// ユーザー登録エンドポイント
app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;

    if (!newUser.password) {
      return res.status(400).json({ error: 'パスワードが提供されていません' });
    }

    const users = await getQuery('SELECT * FROM users WHERE username = ?', [newUser.username]);

    if (users.length > 0) {
      return res.status(400).json({ error: 'このユーザー名は既に使用されています' });
    }

    const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hashedPassword;

    const now = new Date().toISOString();

    await runQuery('INSERT INTO users (username, password, created_at, updated_at) VALUES (?, ?, ?, ?)', [newUser.username, newUser.password, now, now]);

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('データの追加に失敗しました。');
  }
});

// ログインエンドポイント
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await getQuery('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    const user = users[0];
    if (await bcrypt.compare(password, user.password)) {
      res.status(200).json({ message: 'ログイン成功' });
    } else {
      res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('ログイン処理に失敗しました。');
  }
});

// SQLite データベースからイディオム/単語データを取得するエンドポイント
app.get('/api/idioms_words', async (req, res) => {
  try {
    const idiomsWords = await getQuery('SELECT * FROM idioms_words');
    res.json(idiomsWords);
  } catch (error) {
    console.error('Error reading idioms/words data:', error);
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// SQLite データベースから例文データを取得するエンドポイント
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await getQuery('SELECT * FROM sentences');
    res.json(sentences);
  } catch (error) {
    console.error('Error reading sentences data:', error);
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 例文内のイディオムと単語データを取得するエンドポイント
app.get('/api/sentence_words', async (req, res) => {
  try {
    const sentenceWords = await getQuery('SELECT * FROM sentence_words');
    res.json(sentenceWords);
  } catch (error) {
    console.error('Error reading sentence_words data:', error);
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー学習データの取得エンドポイント
app.get('/api/user_learning_data', async (req, res) => {
  try {
    const userLearningData = await getQuery('SELECT * FROM user_learning_data');
    res.json(userLearningData);
  } catch (error) {
    console.error('Error reading user_learning_data:', error);
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー進捗データの取得エンドポイント
app.get('/api/user_progress', async (req, res) => {
  try {
    const userProgress = await getQuery('SELECT * FROM user_progress');
    res.json(userProgress);
  } catch (error) {
    console.error('Error reading user_progress:', error);
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 翻訳データの保存エンドポイント
app.post('/api/save-translation', async (req, res) => {
  try {
    const { idiomsWords, sentences, sentenceWords } = req.body;

    if (!Array.isArray(idiomsWords) || !Array.isArray(sentences) || !Array.isArray(sentenceWords)) {
      return res.status(400).send('Invalid data format');
    }

    const validateItem = (item, requiredFields) => {
      return requiredFields.every(field => item.hasOwnProperty(field));
    };

    const idiomsWordsValid = idiomsWords.every(item => validateItem(item, ['text', 'type', 'meaning_ja']));
    const sentencesValid = sentences.every(sentence => validateItem(sentence, ['text', 'translation_ja']));
    const sentenceWordsValid = sentenceWords.every(item => validateItem(item, ['sentence_id', 'idiom_word_id']));

    if (!idiomsWordsValid || !sentencesValid || !sentenceWordsValid) {
      return res.status(400).send('Data format is incorrect');
    }

    const db = await getDbConnection();
    const now = new Date().toISOString();

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      Promise.all([
        ...idiomsWords.map(async item => {
          const existingItem = await getQueryWithRetry('SELECT * FROM idioms_words WHERE text = ? AND type = ?', [item.text, item.type]);
          if (existingItem.length > 0) {
            await runQueryWithRetry('UPDATE idioms_words SET count = count + 1, updated_at = ? WHERE id = ?', [now, existingItem[0].id]);
          } else {
            await runQueryWithRetry(
              'INSERT INTO idioms_words (text, type, meaning_ja, created_at, updated_at, count) VALUES (?, ?, ?, ?, ?, ?)',
              [item.text, item.type, item.meaning_ja, now, now, 1]
            );
          }
        }),
        ...sentences.map(async sentence => {
          const existingSentence = await getQueryWithRetry('SELECT * FROM sentences WHERE text = ?', [sentence.text]);
          if (existingSentence.length > 0) {
            await runQueryWithRetry('UPDATE sentences SET count = count + 1, updated_at = ? WHERE id = ?', [now, existingSentence[0].id]);
          } else {
            await runQueryWithRetry(
              'INSERT INTO sentences (text, translation_ja, created_at, updated_at, count) VALUES (?, ?, ?, ?, ?)',
              [sentence.text, sentence.translation_ja, now, now, 1]
            );
          }
        }),
        ...sentenceWords.map(async item => {
          const existingPair = await getQueryWithRetry('SELECT * FROM sentence_words WHERE sentence_id = ? AND idiom_word_id = ?', [item.sentence_id, item.idiom_word_id]);
          if (existingPair.length > 0) {
            await runQueryWithRetry('UPDATE sentence_words SET updated_at = ? WHERE sentence_id = ? AND idiom_word_id = ?', [now, item.sentence_id, item.idiom_word_id]);
          } else {
            await runQueryWithRetry(
              'INSERT INTO sentence_words (sentence_id, idiom_word_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
              [item.sentence_id, item.idiom_word_id, now, now]
            );
          }
        })
      ]).then(() => {
        db.run('COMMIT');
        res.status(201).send('Translation data saved successfully');
      }).catch(error => {
        db.run('ROLLBACK');
        console.error('Error saving translation data:', error);
        res.status(500).send('Error saving translation data');
      }).finally(() => {
        db.close();
      });
    });
  } catch (error) {
    console.error('Error saving translation data:', error);
    res.status(500).send('Translation data saving failed');
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーはポート ${port} で動作しています`);
});
