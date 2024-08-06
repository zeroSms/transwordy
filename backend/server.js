// backend/server.js

// 必要なモジュールをインポート
const express = require('express');
const fs = require('fs');
const path = require('path');

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

// ファイルからデータを読み込むヘルパー関数
const readData = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dataPath, fileName), 'utf8', (err, data) => {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};

// ファイルにデータを書き込むヘルパー関数
const writeData = (fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(dataPath, fileName), JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to file ${fileName}:`, err); // エラーログを追加
        return reject(err);
      }
      resolve();
    });
  });
};

// ユーザー登録エンドポイント
app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;
    const users = await readData('users.json');

    // ユーザー名の重複チェック
    if (users.some(user => user.username === newUser.username)) {
      return res.status(400).json({ error: 'このユーザー名は既に使用されています' });
    }

    newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
    newUser.created_at = new Date();
    newUser.updated_at = new Date();
    users.push(newUser);
    await writeData('users.json', users);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send('データの追加に失敗しました。');
  }
});

// ログインエンドポイント
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readData('users.json');

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.status(200).json({ message: 'ログイン成功' });
    } else {
      res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }
  } catch (error) {
    res.status(500).send('ログイン処理に失敗しました。');
  }
});


// イディオム/単語データの取得エンドポイント
app.get('/api/idioms_words', async (req, res) => {
  try {
    const idiomsWords = await readData('idioms_words.json');
    res.json(idiomsWords);
  } catch (error) {
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 例文データの取得エンドポイント
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await readData('sentences.json');
    res.json(sentences);
  } catch (error) {
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 例文内のイディオムと単語データの取得エンドポイント
app.get('/api/sentence_words', async (req, res) => {
  try {
    const sentenceWords = await readData('sentence_words.json');
    res.json(sentenceWords);
  } catch (error) {
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー学習データの取得エンドポイント
app.get('/api/user_learning_data', async (req, res) => {
  try {
    const userLearningData = await readData('user_learning_data.json');
    res.json(userLearningData);
  } catch (error) {
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー進捗データの取得エンドポイント
app.get('/api/user_progress', async (req, res) => {
  try {
    const userProgress = await readData('user_progress.json');
    res.json(userProgress);
  } catch (error) {
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 翻訳データ保存エンドポイント
app.post('/api/save-translation', async (req, res) => {
  try {
    console.log('Received data:', req.body); // デバッグ用ログ

    const { idiomsWords, sentences, sentenceWords } = req.body;

    if (!Array.isArray(idiomsWords) || !Array.isArray(sentences) || !Array.isArray(sentenceWords)) {
      return res.status(400).send('Invalid data format');
    }

    // 日時を追加
    idiomsWords.forEach(item => {
      item.created_at = new Date().toISOString();
      item.updated_at = new Date().toISOString();
    });
    sentences.forEach(sentence => {
      sentence.created_at = new Date().toISOString();
      sentence.updated_at = new Date().toISOString();
    });
    sentenceWords.forEach(item => {
      item.created_at = new Date().toISOString();
      item.updated_at = new Date().toISOString();
    });

    await Promise.all([
      writeData('idioms_words.json', idiomsWords),
      writeData('sentences.json', sentences),
      writeData('sentence_words.json', sentenceWords),
    ]);

    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    console.error('Error saving translation data:', error); // エラーログ
    res.status(500).send('データの保存に失敗しました。');
  }
});

// イディオム/単語データを保存するエンドポイント
app.post('/api/idioms_words', async (req, res) => {
  try {
    const idiomsWords = req.body;
    // 日時を追加
    idiomsWords.forEach(item => {
      item.created_at = new Date().toISOString();
      item.updated_at = new Date().toISOString();
    });
    await writeData('idioms_words.json', idiomsWords);
    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    res.status(500).send('データの保存に失敗しました。');
  }
});

// 例文内のイディオム/単語データを保存するエンドポイント
app.post('/api/sentence_words', async (req, res) => {
  try {
    const sentenceWords = req.body;
    // 日時を追加
    sentenceWords.forEach(item => {
      item.created_at = new Date().toISOString();
      item.updated_at = new Date().toISOString();
    });
    await writeData('sentence_words.json', sentenceWords);
    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    res.status(500).send('データの保存に失敗しました。');
  }
});

// 例文データを保存するエンドポイント
app.post('/api/sentences', async (req, res) => {
  try {
    const sentences = req.body;
    // 日時を追加
    sentences.forEach(sentence => {
      sentence.created_at = new Date().toISOString();
      sentence.updated_at = new Date().toISOString();
    });
    await writeData('sentences.json', sentences);
    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    res.status(500).send('データの保存に失敗しました。');
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーはポート ${port} で動作しています`);
});
