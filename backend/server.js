// backend/server.js

// 必要なモジュールをインポート
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// データベースファイルのパスを指定
const dbPath = path.join(__dirname, 'data', 'translation.db');

// データベース接続を取得する関数
async function getDbConnection() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

const openDb = () => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
};

const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
      db.close();
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
};


// Expressアプリケーションを作成
const app = express();
const port = process.env.PORT || 3000;

// JSON解析用ミドルウェア
app.use(express.json());

// CORS設定
const cors = require('cors');
app.use(cors());

// JSONデータファイルへのパス
const dataPath = path.join(__dirname, 'data');

const bcrypt = require('bcrypt');
const saltRounds = 10; // ハッシュ化の強度

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

    await runQuery('INSERT INTO users (username, password, created_at, updated_at) VALUES (?, ?, ?, ?)', 
      [newUser.username, newUser.password, now, now]);

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('データの追加に失敗しました。');
  }
});

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
    console.error('Error reading idioms/words data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// SQLite データベースから例文データを取得するエンドポイント
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await getQuery('SELECT * FROM sentences');
    res.json(sentences);
  } catch (error) {
    console.error('Error reading sentences data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 例文内のイディオムと単語データを取得するエンドポイント
app.get('/api/sentence_words', async (req, res) => {
  try {
    // SQLiteデータベースからデータを取得
    const sentenceWords = await getQuery('SELECT * FROM sentence_words');
    res.json(sentenceWords);
  } catch (error) {
    console.error('Error reading sentence_words data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー学習データの取得エンドポイント
app.get('/api/user_learning_data', async (req, res) => {
  try {
    // SQLiteデータベースからデータを取得
    const userLearningData = await getQuery('SELECT * FROM user_learning_data');
    res.json(userLearningData);
  } catch (error) {
    console.error('Error reading user_learning_data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー進捗データの取得エンドポイント
app.get('/api/user_progress', async (req, res) => {
  try {
    // SQLiteデータベースからデータを取得
    const userProgress = await getQuery('SELECT * FROM user_progress');
    res.json(userProgress);
  } catch (error) {
    console.error('Error reading user_progress:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

app.post('/api/save-translation', async (req, res) => {
  try {
    const { idiomsWords, sentences, sentenceWords } = req.body;

    if (!Array.isArray(idiomsWords) || !Array.isArray(sentences) || !Array.isArray(sentenceWords)) {
      return res.status(400).send('Invalid data format');
    }

    const validateItem = (item, requiredFields) => {
      return requiredFields.every(field => item.hasOwnProperty(field));
    };

    const idiomsWordsValid = idiomsWords.every(item => validateItem(item, ['text', 'type', 'meaning_ja', 'created_at', 'updated_at']));
    const sentencesValid = sentences.every(sentence => validateItem(sentence, ['text', 'translation_ja', 'created_at', 'updated_at']));
    const sentenceWordsValid = sentenceWords.every(item => validateItem(item, ['sentence_id', 'idiom_word_id', 'created_at', 'updated_at']));

    if (!idiomsWordsValid || !sentencesValid || !sentenceWordsValid) {
      return res.status(400).send('Data format is incorrect');
    }

    const db = await getDbConnection();

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        Promise.all([
          ...idiomsWords.map(item => db.run(
            'INSERT INTO idioms_words (text, type, meaning_ja, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [item.text, item.type, item.meaning_ja, item.created_at, item.updated_at]
          )),
          ...sentences.map(sentence => db.run(
            'INSERT INTO sentences (text, translation_ja, created_at, updated_at) VALUES (?, ?, ?, ?)',
            [sentence.text, sentence.translation_ja, sentence.created_at, sentence.updated_at]
          )),
          ...sentenceWords.map(item => db.run(
            'INSERT INTO sentence_words (sentence_id, idiom_word_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
            [item.sentence_id, item.idiom_word_id, item.created_at, item.updated_at]
          ))
        ])
        .then(() => {
          db.run('COMMIT');
          res.status(200).json({ message: 'データが正常に保存されました' });
        })
        .catch(dbError => {
          db.run('ROLLBACK');
          console.error('Error saving to database:', dbError.message);
          res.status(500).send('データベースへの保存に失敗しました。');
        });

      } finally {
        db.close();
      }
    });

  } catch (error) {
    console.error('Error saving translation data:', error.message);
    res.status(500).send('データの保存に失敗しました。');
  }
});

// 例: イディオム/単語データ保存エンドポイント
app.post('/api/idioms_words', async (req, res) => {
  try {
    const idiomsWords = req.body;

    if (!Array.isArray(idiomsWords) || idiomsWords.some(item => !item.text || !item.type || !item.meaning_ja)) {
      return res.status(400).send('Invalid data format');
    }

    const now = new Date().toISOString();
    idiomsWords.forEach(item => {
      item.created_at = now;
      item.updated_at = now;
    });

    const db = await getDbConnection();

    await db.run('BEGIN TRANSACTION');

    try {
      await Promise.all(
        idiomsWords.map(item => db.run(
          'INSERT INTO idioms_words (text, type, meaning_ja, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [item.text, item.type, item.meaning_ja, item.created_at, item.updated_at]
        ))
      );

      await db.run('COMMIT');

      res.status(200).json({ message: 'データが正常に保存されました' });
    } catch (dbError) {
      await db.run('ROLLBACK');
      console.error('Error saving to database:', dbError);
      res.status(500).send('データベースへの保存に失敗しました。');
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error saving idioms/words data:', error);
    res.status(500).send('データの保存に失敗しました。');
  }
});


// 例文内のイディオム/単語データ保存エンドポイント
app.post('/api/sentence_words', async (req, res) => {
  try {
    const sentenceWords = req.body;

    if (!Array.isArray(sentenceWords) || sentenceWords.some(item => !item.sentence_id || !item.idiom_word_id)) {
      return res.status(400).send('Invalid data format');
    }

    const now = new Date().toISOString();
    sentenceWords.forEach(item => {
      item.created_at = now;
      item.updated_at = now;
    });

    const db = await getDbConnection();

    await db.run('BEGIN TRANSACTION');

    try {
      await Promise.all(
        sentenceWords.map(item => db.run(
          'INSERT INTO sentence_words (sentence_id, idiom_word_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [item.sentence_id, item.idiom_word_id, item.created_at, item.updated_at]
        ))
      );

      await db.run('COMMIT');

      res.status(200).json({ message: 'データが正常に保存されました' });
    } catch (dbError) {
      await db.run('ROLLBACK');
      console.error('Error saving to database:', dbError);
      res.status(500).send('データベースへの保存に失敗しました。');
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error saving sentence_words data:', error);
    res.status(500).send('データの保存に失敗しました。');
  }
});

// 例文データ保存エンドポイント
app.post('/api/sentences', async (req, res) => {
  try {
    const sentences = req.body;

    if (!Array.isArray(sentences) || sentences.some(sentence => !sentence.text || !sentence.translation_ja)) {
      return res.status(400).send('Invalid data format');
    }

    const now = new Date().toISOString();
    sentences.forEach(sentence => {
      sentence.created_at = now;
      sentence.updated_at = now;
    });

    const db = await getDbConnection();

    await db.run('BEGIN TRANSACTION');

    try {
      await Promise.all(
        sentences.map(sentence => db.run(
          'INSERT INTO sentences (text, translation_ja, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [sentence.text, sentence.translation_ja, sentence.created_at, sentence.updated_at]
        ))
      );

      await db.run('COMMIT');

      res.status(200).json({ message: 'データが正常に保存されました' });
    } catch (dbError) {
      await db.run('ROLLBACK');
      console.error('Error saving to database:', dbError);
      res.status(500).send('データベースへの保存に失敗しました。');
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error saving sentences data:', error);
    res.status(500).send('データの保存に失敗しました。');
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーはポート ${port} で動作しています`);
});
