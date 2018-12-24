import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/pages/Home'
import Topic from '@/pages/Topic'
import User from '@/pages/User'
import Search from '@/pages/Search'
import New from '@/pages/New'
import Notifications from '@/pages/Notifications'
import Login from '@/pages/Login'
import Settings from '@/pages/Settings'
import About from '@/pages/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/topic/:id',
      component: Topic,
      props: true
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
      path: '/account',
      component: User,
      props: {
        id: null,
        isAccount: true
      }
    },
    {
      path: '/login',
      component: Login,
      props: route => ({
        redirect: route.query.redirect ? decodeURIComponent(route.query.redirect) : false
      })
    },
    {
      path: '/settings',
      component: Settings
    },
    {
      path: '/about',
      component: About
    }
  ]
})
