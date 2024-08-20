import { createRouter, createWebHistory } from 'vue-router';
import UserRegistration from '../components/UserRegistration.vue'; // ユーザー登録画面
import UserLogin from '../components/UserLogin.vue'; // ログイン画面
import TranslationPage from '../components/TranslationPage.vue'; // 翻訳ページ
import OutputCSV from '../components/OutputCSV.vue'; // CSV出力ページ
import NotFound from '../components/NotFound.vue'; // 404 ページ

const routes = [
  {
    path: '/registration',
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
  },
  {
    path: '/outputCsv',
    name: 'OutputCSV',
    component: OutputCSV // CSV出力ページのコンポーネント
  },
  {
    path: '/:pathMatch(.*)*', // すべてのパスをキャッチする
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
