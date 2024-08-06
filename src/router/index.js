// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import UserRegistration from '../components/UserRegistration.vue'; // ユーザー登録画面
import UserLogin from '../components/UserLogin.vue'; // ログイン画面
import TranslationPage from '../components/TranslationPage.vue'; // 翻訳ページ（仮）

const routes = [
  {
    path: '/',
    name: 'UserRegistration',
    component: UserRegistration
  },
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLogin
  },
  {
    path: '/translation',
    name: 'TranslationPage',
    component: TranslationPage // 翻訳ページのコンポーネント
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
