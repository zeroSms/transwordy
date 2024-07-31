<template>
    <div>
        <h1>翻訳アプリ</h1>
        <textarea v-model="text" placeholder="翻訳したいテキストを入力" rows="4"></textarea>
        <select v-model="targetLang">
            <option value="ja">日本語</option>
            <option value="en">英語</option>
            <!-- 他の言語オプションも追加可能 -->
        </select>
        <button @click="translateText">翻訳</button>
        <div v-if="translation">
            <h2>翻訳結果</h2>
            <pre>{{ JSON.stringify(translation, null, 2) }}</pre>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            text: '',
            targetLang: 'ja',
            translation: null
        };
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

                // パースを試み、エラーをキャッチして処理
                try {
                    this.translation = JSON.parse(response.data.choices[0].message.content);
                } catch (parseError) {
                    console.error("Error parsing translation result:", parseError);
                    this.translation = response.data.choices[0].message.content;
                }

            } catch (error) {
                console.error("Error during translation:", error);
            }
        }
    }
};
</script>
