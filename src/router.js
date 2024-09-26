/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Menu from './components/Menu.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;