import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

try {
  // ルーターをアプリケーションに追加
  app.use(router);

  // アプリケーションをマウント
  app.mount('#app');

  // コンソールログで確認
  console.log('App mounted and router initialized');
} catch (error) {
  console.error('Error during app initialization:', error);
}
