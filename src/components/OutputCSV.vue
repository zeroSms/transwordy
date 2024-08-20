<template>
  <div>
    <h1>イディオム/単語一覧</h1>
    <button @click="fetchIdiomsWords">データを取得</button>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <table v-if="idiomsWords.length">
      <thead>
        <tr>
          <th>イディオム/単語</th>
          <th>意味（日本語）</th>
          <th>文</th>
          <th>翻訳（日本語）</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in idiomsWords" :key="index">
          <td>{{ item.idiom_word }}</td>
          <td>{{ item.meaning_ja }}</td>
          <td>{{ item.sentence }}</td>
          <td>{{ item.translation_ja }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'OutputCSV',
  data() {
    return {
      idiomsWords: [], // APIから取得するデータを格納するためのデータプロパティ
      errorMessage: '', // エラーメッセージ用のデータプロパティ
    };
  },
  methods: {
    async fetchIdiomsWords() {
      this.errorMessage = ''; // エラーメッセージのリセット

      try {
        // ローカルストレージからユーザーIDを取得
        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
          throw new Error('ユーザーIDが設定されていません。');
        }

        const response = await fetch(`http://localhost:3000/api/idioms_words?user_id=${user_id}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'データの取得に失敗しました');
        }

        // レスポンスデータをJSONとしてパース
        const data = await response.json();
        this.idiomsWords = data; // 取得したデータをデータプロパティに設定

      } catch (error) {
        this.errorMessage = error.message || 'エラーが発生しました'; // エラーメッセージの設定
      }
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
</style>
