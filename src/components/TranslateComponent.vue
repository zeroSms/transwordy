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
        <textarea
          v-model="text"
          placeholder="テキストを入力または貼り付け"
          @input="autoTranslate"
        ></textarea>
        <div class="word-count">{{ wordCount }} 文字</div>
      </div>
      <div class="output-area">
        <div class="language-selector">
          <select v-model="targetLang">
            <option value="ja">日本語</option>
            <option value="en">英語</option>
          </select>
        </div>
        <div class="translation-result" v-if="translation">
          <div v-for="(sentence, index) in translation.sentences" :key="index">
            {{ sentence.ja }}
          </div>
        </div>
      </div>
    </div>
    <div class="idiom-word-section" v-if="translation">
      <h3>重要な表現とワード</h3>
      <div class="idiom-word-list">
        <div v-for="(sentence, sentenceIndex) in translation.sentences" :key="sentenceIndex">
          <div v-for="(word, key) in sentence['idiom/word']" :key="key" class="idiom-word-item">
            <span class="original">{{ key }}</span>
            <span class="type">{{ word.type }}</span>
            <span class="translation">{{ word.ja }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TranslationApp.js"></script>
<style src="./TranslationApp.css" scoped></style>
