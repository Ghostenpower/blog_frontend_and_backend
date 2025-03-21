import { createRouter, createWebHistory } from 'vue-router'
import Home from '../view/home.vue'
import Projects from '../view/projects.vue'
import ProjectDetail from '../view/ProjectDetail.vue'
import Articles from '../view/articles.vue'
import About from '../view/about.vue'
import MomentDetail from '../view/MomentDetail.vue'
import Chat from '../view/Chat.vue'
import Main from '../view/main.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Main,
      children: [
        {
          path: '',
          name: 'Home',
          component: Home,
          meta: { transition: 'fade' }
        },
        {
          path: 'projects',
          name: 'Projects',
          component: Projects,
          meta: { transition: 'fade' }
        },
        {
          path: 'project/:id',
          name: 'ProjectDetail',
          component: ProjectDetail,
          meta: { transition: 'fade' }
        },
        {
          path: 'articles',
          name: 'Articles',
          component: Articles,
          meta: { transition: 'fade' }
        },
        {
          path: 'about',
          name: 'About',
          component: About,
          meta: { transition: 'fade' }
        },
        {
          path: 'moment/:id',
          name: 'MomentDetail',
          component: MomentDetail,
          meta: { transition: 'fade' }
        },
        {
          path: 'chat',
          name: 'Chat',
          component: Chat,
          meta: { transition: 'fade' }
        }
      ]
    }
  ]
})

export default router
