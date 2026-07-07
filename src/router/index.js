import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNavHistoryStore } from '../stores/navHistory'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/home.vue'
import Profile from '@/views/profile.vue'
import Users from '@/views/users.vue'
import Customers from '@/views/customers.vue'
import CustomersByStatus from '@/views/CustomersByStatus.vue'
import Archive from '@/views/archive.vue'
import PreviewPage from '@/views/PreviewPage.vue'
import ThemeCustomizer from '@/views/ThemeCustomizer.vue'
import WaitingRoom from '@/views/WaitingRoom.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
      },
      {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true },
      },
      {
        path: '/users',
        name: 'users',
        component: Users,
        meta: { requiresAuth: true },
      },
      {
        path: '/customers',
        name: 'customers',
        component: Customers,
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/status/:code',
        name: 'customers-status',
        component: CustomersByStatus,
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/create',
        name: 'customer-create',
        component: () => import('@/views/CustomerCreate.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customer/:id',
        name: 'customer',
        component: () => import('@/components/customers/CustomerView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/archive',
        name: 'archive',
        component: Archive,
        meta: { requiresAuth: true },
      },
      {
        path: '/permissions/:id',
        name: 'PermissionsEdit',
        component: () => import('@/views/permissions.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/theme',
        name: 'ThemeCustomizer',
        component: ThemeCustomizer,
        meta: { requiresAuth: true },
      },
      {
        path: '/admin-settings',
        name: 'AdminSettings',
        component: () => import('@/views/AdminSettings.vue'),
        meta: { requiresAuth: true, roles: ['RAHBAR', 'ADMIN'] },
      }
    ]
  },
  {
    path: '/preview',
    name: 'preview',
    component: PreviewPage,
  },
  {
    path: '/waiting-room',
    name: 'waiting-room',
    component: WaitingRoom,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  } else if (to.meta.guestOnly && isAuthenticated) {
    return '/'
  } else if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    return '/'
  }
  return true
})

router.afterEach(() => {
  useNavHistoryStore().track()
})

export default router
