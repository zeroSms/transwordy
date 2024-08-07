<template>
  <div class="app-container">
    <div class="translation-area">
      <div class="input-area">
        <div class="language-selector">
          <select v-model="sourceLang">
            <option value="en">英語</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <textarea v-model="text" placeholder="テキストを入力または貼り付け" @input="autoTranslate"></textarea>
        <div class="word-count">{{ wordCount }} 文字</div>
      </div>
      <div class="output-area">
        <div class="language-selector">
          <select v-model="targetLang">
            <option value="ja">日本語</option>
            <option value="en">英語</option>
          </select>
        </div>
        <div class="translation-result" v-if="translation && translation.sentences">
          <div v-for="sentence in translation.sentences" :key="sentence.id">
            {{ sentence.translation_ja }}
          </div>
        </div>
        <div class="translation-result" v-else></div>
      </div>
    </div>
    <div class="idiom-word-section" v-if="translation && translation.idiomsWords">
      <h3>重要な表現とワード</h3>
      <div class="idiom-word-list">
        <div v-for="word in translation.idiomsWords" :key="word.id" class="idiom-word-item">
          <span class="original">{{ word.text }}</span>
          <span class="type">{{ word.type }}</span>
          <span class="translation">{{ word.meaning_ja }}</span>
        </div>
      </div>
    </div>
    <div class="idiom-word-section" v-else>
      <h3>重要な表現とワード</h3>
    </div>
  </div>
</template>



<style scoped>
/* 全体のスタイル */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f2f5;
  color: #333;
  margin: 0;
  padding: 0;
}

/* コンテナ */
.app-container {
  max-width: 900px;
  margin: 2em auto;
  padding: 2em;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* ヘッダー */
h1 {
  text-align: center;
  color: #444;
  font-size: 2em;
  margin-bottom: 1em;
}

/* 翻訳エリア */
.translation-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-area,
.output-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.language-selector {
  margin-bottom: 10px;
}

textarea,
.translation-result {
  background-color: #fff;
  width: 100%;
  height: 300px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  overflow-y: auto;
}

.translation-result {
  text-align: left;
  /* 追加 */
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* 重要な表現とワードセクション */
.idiom-word-section {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

/* センテンスタイトル */
.idiom-word-section h3 {
  font-size: 1.2em;
  margin: 10px 0;
  /* 上下の余白をやや小さく設定 */
  color: #333;
}

/* センテンスごとのセクション */
.sentence-section {
  margin-bottom: 20px;
}

/* センテンス番号のタイトル */
.sentence-section h4 {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 10px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
  text-align: left;
}

/* 重要な表現とワードのリスト */
.idiom-word-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 各アイテムのスタイル */
.idiom-word-item {
  background-color: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  flex: 1 1 200px;
  /* 横幅が200pxになるように設定 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 元のテキストのスタイル */
.idiom-word-item .original {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

/* 品詞のスタイル */
.idiom-word-item .type {
  color: #666;
  font-size: 12px;
  margin-bottom: 5px;
}

/* 翻訳のスタイル */
.idiom-word-item .translation {
  color: #007bff;
}

/* メディアクエリ（レスポンシブデザイン） */
@media (max-width: 768px) {
  .translation-area {
    flex-direction: column;
  }
}
</style>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      text: '',
      sourceLang: 'en',
      targetLang: 'ja',
      translation: null
    };
  },
  computed: {
    wordCount() {
      return this.text.length;
    }
  },
  methods: {
    async translateText() {
      const systemInstructions = `
        Convert the following English text to JSON in the specified format.

        **JSON format**:
        {
          "sentences": [
            {
              "sentence": "[Sentence1]",
              "ja": "[Japanese translation of Sentence1]",
              "idiom/word": {
                "[Idiom/Word1]": {"type": "[POS]", "ja": "[Japanese translation of Idiom/Word1]"},
                "[Idiom/Word2]": {"type": "[POS]", "ja": "[Japanese translation of Idiom/Word2]"}
                // Add more idioms/words as needed
              }
            }
            // Add more sentences as needed
          ]
        }
        Instructions:
        1. Split the input English text into sentences.
        2. Provide the Japanese translation for each sentence.
        3. Extract important idioms/words from each sentence and provide their POS and Japanese translation.
        4. Classify parts of speech into the following 11 categories: noun, pronoun, verb, adjective, adverb, auxiliary verb, preposition, article, interjection, conjunction, idiom.
        5. Use the base form of words unless there is a special usage.

        **Example**:
        **Text**: I was feeling a bit under the weather yesterday, so I decided to stay home. I rested and drank some hot tea, which helped me feel better.

        **JSON format**:
        {
          "sentences": [
            {
              "sentence": "I was feeling a bit under the weather yesterday, so I decided to stay home.",
              "ja": "私は昨日少し体調が悪かったので、家にいることに決めました。",
              "idiom/word": {
                "under the weather": {
                  "type": "idiom",
                  "ja": "体調が悪い"
                },
                "decide": {
                  "type": "verb",
                  "ja": "決める"
                },
                "home": {
                  "type": "noun",
                  "ja": "家"
                }
              }
            },
            {
              "sentence": "I rested and drank some hot tea, which helped me feel better.",
              "ja": "私は休んで、熱いお茶を飲みました。それが私を気分良くさせました。",
              "idiom/word": {
                "rest": {
                  "type": "verb",
                  "ja": "休む"
                },
                "drink": {
                  "type": "verb",
                  "ja": "飲む"
                },
                "hot tea": {
                  "type": "noun",
                  "ja": "熱いお茶"
                },
                "feel better": {
                  "type": "idiom",
                  "ja": "気分が良くなる"
                }
              }
            }
          ]
        }
      `;


      const prompt = `**英文**: ${this.text}`;

      try {

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4o-mini-2024-07-18",
          messages: [
            { role: "system", content: systemInstructions },
            { role: "user", content: prompt }
          ],
          max_tokens: 5616,
          temperature: 0,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VUE_APP_OPENAI_API_KEY}`
          }
        });

        console.log("API Response:", response.data);
        try {
          const rawData = JSON.parse(response.data.choices[0].message.content);
          const { sentences } = rawData;

          // idiomsWords と sentenceWords を生成
          let idiomsWords = [];
          let sentencesList = [];
          let sentenceWords = [];

          // ユニークなID生成のためのカウンタ
          let idiomWordId = 1;
          let sentenceId = 1;

          sentences.forEach((sentenceObj) => {
            if (sentenceObj['idiom/word'] && typeof sentenceObj['idiom/word'] === 'object') {
              let now = new Date().toISOString(); // 現在の日時を取得

              // idiomsWords の生成
              let idiomWords = Object.keys(sentenceObj['idiom/word']).map(key => ({
                id: idiomWordId++, // ユニークなIDを生成
                text: key,
                type: sentenceObj['idiom/word'][key].type,
                pos: sentenceObj['idiom/word'][key].pos, // pos フィールドが必要な場合
                meaning_ja: sentenceObj['idiom/word'][key].ja,
                created_at: now,
                updated_at: now
              }));
              idiomsWords = idiomsWords.concat(idiomWords);

              // sentencesList の生成
              let sentenceEntry = {
                id: sentenceId++, // ユニークなIDを生成
                text: sentenceObj.sentence, // 元のデータから取得
                translation_ja: sentenceObj.ja, // 日本語訳
                created_at: now,
                updated_at: now
              };
              sentencesList.push(sentenceEntry);

              // sentenceWords の生成
              let sentenceWordEntries = idiomWords.map(iw => ({
                id: idiomWordId++, // ユニークなIDを生成
                sentence_id: sentenceEntry.id,
                idiom_word_id: iw.id,
                created_at: now,
                updated_at: now
              }));
              sentenceWords = sentenceWords.concat(sentenceWordEntries);
            } else {
              console.warn('Invalid idiom/word format in sentence:', sentenceObj);
            }
          });

          console.log("Generated idiomsWords:", idiomsWords);
          console.log("Generated sentencesList:", sentencesList);
          console.log("Generated sentenceWords:", sentenceWords);

          // 新しい translation オブジェクト
          this.translation = {
            idiomsWords,
            sentences: sentencesList,
            sentenceWords
          };

          await this.saveTranslationData(this.translation);
        } catch (parseError) {
          console.error("Error parsing translation result:", parseError);
          this.translation = { error: 'データのパースに失敗しました', originalContent: response.data.choices[0].message.content };
        }

      } catch (error) {
        console.error("Error during translation:", error);
      }
    },
    async saveTranslationData(translation) {
      console.log("Saving translation data:", translation);
      try {
        const response = await axios.post('http://localhost:3000/api/save-translation', translation, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Translation data saved successfully:', response.data);
      } catch (error) {
        // 詳細なエラーメッセージを表示
        if (error.response) {
          console.error('Error saving translation data:', error.response.data);
        } else {
          console.error('Error saving translation data:', error.message);
        }
      }
    },
    autoTranslate() {
      if (this.text.trim().length > 0) {
        this.translateText();
      } else {
        this.translation = null;
      }
    }
  }
};

</script>
