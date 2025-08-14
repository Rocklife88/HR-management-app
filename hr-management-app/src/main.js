import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { useAuth } from './composables/useAuth'

// Import components
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Companies from './components/Companies.vue'
import Employees from './components/EmployeesWithComposable.vue'
import Teams from './components/Teams.vue'
import Meetings from './components/Meetings.vue'

// Router configuration
const routes = [
  { path: '/', redirect: '/dashboard/employees' },
  { path: '/login', component: Login },
  { 
    path: '/dashboard', 
    component: Dashboard,
    children: [
      { path: '', redirect: 'employees' },
      { path: 'companies', component: Companies },
      { path: 'employees', component: Employees },
      { path: 'teams', component: Teams },
      { path: 'meetings', component: Meetings },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Auth guard temporaneamente disabilitato per debug
/*
router.beforeEach(async (to, from, next) => {
  const { checkAuth, isAuthenticated } = useAuth()
  
  // Check authentication status
  checkAuth()
  
  // Wait a moment for reactive updates
  await new Promise(resolve => setTimeout(resolve, 10))
  
  console.log('Navigation to:', to.path, 'Authenticated:', isAuthenticated.value)
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    console.log('Redirecting to login - not authenticated')
    next('/login')
  } else if (to.path === '/login' && isAuthenticated.value) {
    console.log('Redirecting to dashboard - already authenticated')
    next('/dashboard')
  } else {
    console.log('Allowing navigation')
    next()
  }
})
*/

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
