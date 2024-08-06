// src/components/UserRegistration.vue

<template>
  <div class="registration">
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
  name: 'UserRegistration',
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
          const error = await response.json();
          throw new Error(error.error || 'ユーザー登録に失敗しました');
        }

        await response.json();
        this.$router.push('/translation'); // 翻訳ページに遷移
      } catch (error) {
        console.error(error);
        alert(error.message || 'エラーが発生しました');
      }
    }
  }
};
</script>

<style scoped>
.user-registration {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.user-registration h1 {
  text-align: center;
}

.user-registration form div {
  margin-bottom: 1rem;
}

.user-registration label {
  display: block;
  margin-bottom: 0.5rem;
}

.user-registration input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

.user-registration button {
  width: 100%;
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.user-registration button:hover {
  background-color: #0056b3;
}
</style>
