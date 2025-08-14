import { ref, computed } from 'vue'

const currentUser = ref(null)
const isAuthenticated = computed(() => !!currentUser.value)

export function useAuth() {
  const login = async (username, password) => {
    try {
      // Carica gli utenti dal JSON
      const response = await fetch('/employees.json')
      const data = await response.json()
      
      // Verifica le credenziali
      const user = data.users.find(u => u.username === username && u.password === password)
      
      if (user) {
        currentUser.value = {
          username: user.username,
          role: user.role,
          name: user.name
        }
        
        // Salva in localStorage per persistenza
        localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const checkAuth = () => {
    const stored = localStorage.getItem('currentUser')
    console.log('Checking auth, stored data:', stored)
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored)
        console.log('Auth restored, user:', currentUser.value)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('currentUser')
      }
    } else {
      console.log('No stored auth data found')
    }
  }

  // Inizializza l'autenticazione al caricamento
  if (typeof window !== 'undefined') {
    checkAuth()
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}
