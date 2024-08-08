const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'translation.db');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // users テーブルの作成
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)
  `);

  // idioms_words テーブルの作成
  db.run(`
    CREATE TABLE IF NOT EXISTS idioms_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      type TEXT,
      meaning_ja TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      count INTEGER DEFAULT 1,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_idioms_words_text ON idioms_words (text)
  `);

  // sentences テーブルの作成
  db.run(`
    CREATE TABLE IF NOT EXISTS sentences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      translation_ja TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      count INTEGER DEFAULT 1,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sentences_text ON sentences (text)
  `);

  // sentence_words テーブルの作成
  db.run(`
    CREATE TABLE IF NOT EXISTS sentence_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sentence_id INTEGER NOT NULL,
      idiom_word_id INTEGER NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      user_id INTEGER,
      FOREIGN KEY (sentence_id) REFERENCES sentences(id),
      FOREIGN KEY (idiom_word_id) REFERENCES idioms_words(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sentence_words_sentence_id ON sentence_words (sentence_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sentence_words_idiom_word_id ON sentence_words (idiom_word_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sentence_words_user_id ON sentence_words (user_id)
  `);
});

db.close();
