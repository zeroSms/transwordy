<template>
  <div id="app">
    <nav>
      <router-link to="/registration">ユーザー登録</router-link>
      <router-link to="/login">ログイン</router-link>
      <router-link to="/translation">翻訳ページ</router-link>
      <router-link to="/outputCsv">CSV 出力</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
nav {
  display: flex;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 10px;
}

nav a {
  margin: 0 15px;
  text-decoration: none;
  color: #42b983;
  font-weight: bold;
}

nav a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
  }
}
</style>
