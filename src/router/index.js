import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/pages/Home'
import Topic from '@/pages/topic/Topic'
import User from '@/pages/User'
import Search from '@/pages/Search'
import New from '@/pages/New'
import Notifications from '@/pages/Notifications'
import Login from '@/pages/login/Login'
import Settings from '@/pages/settings/Settings'
import About from '@/pages/About'
import NotFound from '@/pages/NotFound'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      component: NotFound
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/topic/:id',
      component: Topic,
      props: route => ({
        id: route.params.id,
        reply: false
      })
    },
    {
      path: '/topic/:id/reply',
      component: Topic,
      props: route => ({
        id: route.params.id,
        reply: true
      })
    },
    {
      path: '/topic/:id/edit',
      component: New,
      props: route => ({
        id: route.params.id,
        isEdit: true
      })
    },
    {
      path: '/user/:id',
      component: User,
      props: true
    },
    {
      path: '/search',
      component: Search
    },
    {
      path: '/new',
      component: New
    },
    {
      path: '/notifications',
      component: Notifications
    },
    {
      path: '/login',
      component: Login,
      props: route => ({
        redirect: route.query.redirect ? decodeURIComponent(route.query.redirect) : ''
      })
    },
    {
      path: '/login/camera',
      component: Login,
      props: {
        camera: true
      }
    },
    {
      path: '/settings',
      component: Settings
    },
    {
      path: '/settings/tabs',
      component: Settings,
      props: {
        chooseTabs: true
      }
    },
    {
      path: '/about',
      component: About
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return {
      x: 0,
      y: 0
    }
  }
})
