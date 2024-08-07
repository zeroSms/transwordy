// backend/server.js

// 必要なモジュールをインポート
const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

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

// 既存のデータを読み込む関数
const readCsvData = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    // ファイルパスの組み立て
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => {
        console.error(`Error reading CSV file ${fileName}:`, err);
        reject(new Error('データの読み込みに失敗しました'));
      });
  });
};

// CSVファイルにデータを追記する関数
async function writeCsvData(filename, newData, headers) {
  const filePath = path.join(__dirname, 'data', filename);

  try {
    let existingData = [];
    if (fs.existsSync(filePath)) {
      // 既存のデータがある場合は読み込む
      existingData = await readCsvData(filePath);
    }

    // 既存のデータに新しいデータを追加
    const updatedData = [...existingData, ...newData];

    // CSVファイルにデータを書き込む
    stringify(updatedData, { header: true, columns: headers }, (err, output) => {
      if (err) {
        console.error(`Error writing CSV file ${filename}:`, err);
        throw new Error('データの書き込みに失敗しました');
      }
      fs.writeFileSync(filePath, output);
    });
  } catch (err) {
    console.error(`Error processing CSV file ${filename}:`, err);
    throw new Error('データの処理に失敗しました');
  }
}


const bcrypt = require('bcrypt');
const saltRounds = 10; // ハッシュ化の強度

// ユーザー登録エンドポイント
app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;

    // パスワードが提供されているか確認
    if (!newUser.password) {
      return res.status(400).json({ error: 'パスワードが提供されていません' });
    }

    const users = await readCsvData('users.csv');

    // ユーザー名の重複チェック
    if (users.some(user => user.username === newUser.username)) {
      return res.status(400).json({ error: 'このユーザー名は既に使用されています' });
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hashedPassword;

    // ID を設定
    const newId = users.length ? parseInt(users[users.length - 1].id) + 1 : 1;
    newUser.id = newId;

    // 日時を追加
    newUser.created_at = new Date().toISOString();
    newUser.updated_at = new Date().toISOString();

    // ユーザー情報を追加
    users.push(newUser);

    // データを CSV ファイルに書き込む
    await writeCsvData('users.csv', users, ['id', 'username', 'password', 'created_at', 'updated_at']);

    // レスポンスを送信
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error); // エラーログ
    res.status(500).send('データの追加に失敗しました。');
  }
});

// ログインエンドポイント
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readCsvData('users.csv');

    // ユーザーを検索
    const user = users.find(u => u.username === username);

    console.log(user.password);
    console.log(username, password);

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({ message: 'ログイン成功' });
    } else {
      res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }
  } catch (error) {
    console.error('Error during login:', error); // エラーログ
    res.status(500).send('ログイン処理に失敗しました。');
  }
});

// イディオム/単語データの取得エンドポイント
app.get('/api/idioms_words', async (req, res) => {
  try {
    const idiomsWords = await readCsvData('idioms_words.csv'); // CSV 形式の場合
    res.json(idiomsWords);
  } catch (error) {
    console.error('Error reading idioms/words data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 例文データの取得エンドポイント
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await readCsvData('sentences.csv'); // CSV 形式の場合
    res.json(sentences);
  } catch (error) {
    console.error('Error reading sentences data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 例文内のイディオムと単語データの取得エンドポイント
app.get('/api/sentence_words', async (req, res) => {
  try {
    const sentenceWords = await readCsvData('sentence_words.csv'); // CSV 形式の場合
    res.json(sentenceWords);
  } catch (error) {
    console.error('Error reading sentence_words data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー学習データの取得エンドポイント
app.get('/api/user_learning_data', async (req, res) => {
  try {
    const userLearningData = await readCsvData('user_learning_data.csv'); // CSV 形式の場合
    res.json(userLearningData);
  } catch (error) {
    console.error('Error reading user_learning_data:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// ユーザー進捗データの取得エンドポイント
app.get('/api/user_progress', async (req, res) => {
  try {
    const userProgress = await readCsvData('user_progress.csv'); // CSV 形式の場合
    res.json(userProgress);
  } catch (error) {
    console.error('Error reading user_progress:', error); // エラーログ
    res.status(500).send('データの読み込みに失敗しました。');
  }
});

// 翻訳データ保存エンドポイント
app.post('/api/save-translation', async (req, res) => {
  try {
    const { idiomsWords, sentences, sentenceWords } = req.body;
    console.log('Received idiomsWords:', idiomsWords); // デバッグ用ログ
    console.log('Received sentences:', sentences); // デバッグ用ログ
    console.log('Received sentenceWords:', sentenceWords); // デバッグ用ログ

    if (!Array.isArray(idiomsWords) || !Array.isArray(sentences) || !Array.isArray(sentenceWords)) {
      return res.status(400).send('Invalid data format');
    }

    // データの整合性チェック
    const validateItem = (item, requiredFields) => {
      return requiredFields.every(field => item.hasOwnProperty(field));
    };

    const idiomsWordsValid = idiomsWords.every(item => validateItem(item, ['id', 'text', 'type', 'meaning_ja', 'created_at', 'updated_at']));
    const sentencesValid = sentences.every(sentence => validateItem(sentence, ['id', 'text', 'translation_ja', 'created_at', 'updated_at']));
    const sentenceWordsValid = sentenceWords.every(item => validateItem(item, ['id', 'sentence_id', 'idiom_word_id', 'created_at', 'updated_at']));

    if (!idiomsWordsValid || !sentencesValid || !sentenceWordsValid) {
      return res.status(400).send('Data format is incorrect');
    }

    // CSVファイルにデータを保存
    try {
      await Promise.all([
        writeCsvData('idioms_words.csv', idiomsWords, ['id', 'text', 'type', 'meaning_ja', 'created_at', 'updated_at']),
        writeCsvData('sentences.csv', sentences, ['id', 'text', 'translation_ja', 'created_at', 'updated_at']),
        writeCsvData('sentence_words.csv', sentenceWords, ['id', 'sentence_id', 'idiom_word_id', 'created_at', 'updated_at'])
      ]);
    } catch (writeError) {
      console.error('Error writing CSV files:', writeError);
      return res.status(500).send('Failed to save data to CSV files.');
    }

    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    console.error('Error saving translation data:', error);
    res.status(500).send('データの保存に失敗しました。');
  }
});


// 例: イディオム/単語データ保存エンドポイント
app.post('/api/idioms_words', async (req, res) => {
  try {
    const idiomsWords = req.body;

    // データのバリデーション
    if (!Array.isArray(idiomsWords) || idiomsWords.some(item => !item.id || !item.text || !item.type || !item.pos || !item.meaning_ja)) {
      return res.status(400).send('Invalid data format');
    }

    const now = new Date().toISOString();
    idiomsWords.forEach(item => {
      item.created_at = now;
      item.updated_at = now;
    });

    // CSVファイルにデータを保存
    await writeCsvData('idioms_words.csv', idiomsWords, ['id', 'text', 'type', 'pos', 'meaning_ja', 'created_at', 'updated_at']);

    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    console.error('Error saving idioms/words data:', error); // エラーログ
    res.status(500).send('データの保存に失敗しました。');
  }
});

// 例文内のイディオム/単語データ保存エンドポイント
app.post('/api/sentence_words', async (req, res) => {
  try {
    const sentenceWords = req.body;

    // データのバリデーション
    if (!Array.isArray(sentenceWords) || sentenceWords.some(item => !item.id || !item.sentence_id || !item.idiom_word_id)) {
      return res.status(400).send('Invalid data format');
    }

    const now = new Date().toISOString();
    sentenceWords.forEach(item => {
      item.created_at = now;
      item.updated_at = now;
    });

    // CSVファイルにデータを保存
    await writeCsvData('sentence_words.csv', sentenceWords, ['id', 'sentence_id', 'idiom_word_id', 'created_at', 'updated_at']);

    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    console.error('Error saving sentence_words data:', error); // エラーログ
    res.status(500).send('データの保存に失敗しました。');
  }
});

// 例文データ保存エンドポイント
app.post('/api/sentences', async (req, res) => {
  try {
    const sentences = req.body;

    // データのバリデーション
    if (!Array.isArray(sentences) || sentences.some(sentence => !sentence.id || !sentence.text || !sentence.translation_ja)) {
      return res.status(400).send('Invalid data format');
    }

    const now = new Date().toISOString();
    sentences.forEach(sentence => {
      sentence.created_at = now;
      sentence.updated_at = now;
    });

    // CSVファイルにデータを保存
    await writeCsvData('sentences.csv', sentences, ['id', 'text', 'translation_ja', 'created_at', 'updated_at']);

    res.status(200).json({ message: 'データが正常に保存されました' });
  } catch (error) {
    console.error('Error saving sentences data:', error); // エラーログ
    res.status(500).send('データの保存に失敗しました。');
  }
});


// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーはポート ${port} で動作しています`);
});
