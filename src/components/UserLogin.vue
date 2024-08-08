<template>
  <div class="login">
    <h1>ログイン</h1>
    <form @submit.prevent="loginUser">
      <div>
        <label for="username">ユーザー名:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">パスワード:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">ログイン</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'UserLogin',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '' // エラーメッセージ用のデータプロパティ
    };
  },
  methods: {
    async loginUser() {
      this.errorMessage = ''; // エラーメッセージのリセット

      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'ログインに失敗しました');
        }

        await response.json();
        this.$router.push('/translation'); // 翻訳ページに遷移
      } catch (error) {
        this.errorMessage = error.message || 'エラーが発生しました'; // エラーメッセージの設定
      }
    }
  }
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.login h1 {
  text-align: center;
}

.login form div {
  margin-bottom: 1rem;
}

.login label {
  display: block;
  margin-bottom: 0.5rem;
}

.login input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

.login button {
  width: 100%;
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  text-align: center;
}
</style>
