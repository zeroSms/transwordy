// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '../components/UserLogin.vue'; // 修正済み

const routes = [
  {
    path: '/',
    name: 'UserLogin',
    component: UserLogin
  }
  // 他のルートもここに追加
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
