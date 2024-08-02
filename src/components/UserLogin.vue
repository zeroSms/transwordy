<template>
  <div class="login">
    <h1>ユーザー登録</h1>
    <form @submit.prevent="registerUser">
      <div>
        <label for="username">ユーザー名:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">パスワード:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">登録</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'UserLogin',
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async registerUser() {
      try {
        const response = await fetch('http://localhost:3000/api/users', {
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
          throw new Error('ユーザー登録に失敗しました');
        }

        await response.json();
        alert('ユーザー登録が成功しました');
        // 必要に応じて他のアクションを実行
      } catch (error) {
        console.error(error);
        alert('エラーが発生しました');
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
</style>
