// 必要なモジュールをインポート
const express = require('express');
const fs = require('fs');
const path = require('path');

// Expressアプリケーションを作成
const app = express();
const port = process.env.PORT || 3000;

// JSON解析用ミドルウェア
app.use(express.json());

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
      if (err) return reject(err);
      resolve();
    });
  });
};

// ユーザーデータの取得エンドポイント
app.get('/api/users', async (req, res) => {
  try {
    const users = await readData('users.json');
    res.json(users);
  } catch (error) {
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー追加エンドポイント
app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;
    const users = await readData('users.json');
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

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーはポート ${port} で動作しています`);
});
