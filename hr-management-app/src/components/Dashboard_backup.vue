<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" :class="{ '-translate-x-full': !sidebarOpen }">
      <div class="flex items-center justify-between h-16 px-4 border-b">
        <h1 class="text-xl font-bold text-gray-900">HR Management</h1>
        <button @click="sidebarOpen = false" class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav class="mt-5 px-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="$route.path === item.href ? 'bg-primary-100 text-primary-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <component :is="item.icon" class="mr-3 h-6 w-6 flex-shrink-0" :class="$route.path === item.href ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'" />
          {{ item.name }}
        </router-link>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="md:pl-64">
      <!-- Top Header -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button @click="sidebarOpen = true" class="md:hidden -m-2.5 p-2.5 text-gray-700">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div class="h-6 w-px bg-gray-200 md:hidden" />
        
        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <!-- Company Selector -->
          <div class="flex items-center">
            <select 
              v-model="selectedCompanyLocal" 
              @change="handleCompanyChange"
              class="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tutte le aziende</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
          </div>
          <div class="relative flex flex-1"></div>
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <!-- Quick Actions Dropdown -->
            <div class="relative">
              <button 
                @click="quickActionsOpen = !quickActionsOpen"
                class="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Azioni Rapide
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div v-if="quickActionsOpen" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1">
                  <button @click="showCreateCompanyModal" class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Crea Nuova Azienda
                  </button>
                  <button @click="showCreateTeamModal" class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Crea Nuovo Team
                  </button>
                  <div class="border-t border-gray-100"></div>
                  
                  <!-- Aggiungi Dipendente Submenu -->
                  <div class="relative">
                    <button 
                      @click="toggleEmployeeSubmenu" 
                      class="group flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div class="flex items-center">
                        <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                        Aggiungi Dipendente
                      </div>
                      <svg class="h-4 w-4 transform transition-transform" :class="{ 'rotate-180': employeeSubmenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <!-- Employee Submenu -->
                    <div v-if="employeeSubmenuOpen" class="bg-gray-50 border-l-2 border-primary-200">
                      <div v-if="companies.length === 0" class="px-8 py-2 text-xs text-gray-500">
                        Nessuna azienda disponibile
                      </div>
                      <button 
                        v-for="company in companies" 
                        :key="company.id"
                        @click="addEmployeeToCompany(company)"
                        class="flex items-center px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 w-full text-left"
                      >
                        <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ company.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- User menu temporaneamente disabilitato -->
            <div class="text-sm text-gray-600">Debug Mode - No Auth</div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="py-6">
        <div class="px-4 sm:px-6 lg:px-8">          
          <router-view />
        </div>
      </main>
    </div>

    <!-- Mobile sidebar backdrop -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"></div>
    
    <!-- Quick Actions backdrop -->
    <div v-if="quickActionsOpen" @click="quickActionsOpen = false" class="fixed inset-0 z-30"></div>

    <!-- Company Modal -->
    <CompanyModal
      v-if="showCompanyModal"
      :company="selectedCompany"
      @save="handleSaveCompany"
      @cancel="closeCompanyModal"
    />

    <!-- Team Modal -->
    <TeamModal
      v-if="showTeamModal"
      :team="selectedTeam"
      :companies="companies"
      :employees="employees"
      @save="handleSaveTeam"
      @cancel="closeTeamModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Temporaneamente rimossi i composables per debug
// import { useAuth } from '../composables/useAuth'
import { useHR } from '../composables/useHRClean'
import CompanyModal from './CompanyModal.vue'
import TeamModal from './TeamModal.vue'

// Icons (simplified inline SVG components)
const UsersIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>`
}

const UserGroupIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`
}

const CalendarIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
}

const router = useRouter()
// Temporaneamente commentato per debug
// const { currentUser, logout } = useAuth()
const { 
  loadData, 
  companies, 
  employees,
  selectedCompany, 
  setSelectedCompany,
  addCompany,
  updateCompany,
  addTeam,
  updateTeam
} = useHR()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const quickActionsOpen = ref(false)
const employeeSubmenuOpen = ref(false)

// Local reactive reference for the select
const selectedCompanyLocal = ref('')

// Modal states
const showCompanyModal = ref(false)
const showTeamModal = ref(false)
const selectedCompanyForEdit = ref(null)
const selectedTeamForEdit = ref(null)

const navigation = [
  { name: 'Dipendenti', href: '/dashboard/employees', icon: UsersIcon },
  { name: 'Team', href: '/dashboard/teams', icon: UserGroupIcon },
  { name: 'Meeting HR', href: '/dashboard/meetings', icon: CalendarIcon },
]

const userInitials = computed(() => {
  // Temporaneamente hardcoded per debug
  return 'DM'
})

const handleLogout = () => {
  console.log('Logout clicked - debug mode')
  // logout()
  // router.push('/login')
}

const handleCompanyChange = () => {
  setSelectedCompany(selectedCompanyLocal.value || null)
}

// Quick Actions functions
const showCreateCompanyModal = () => {
  selectedCompanyForEdit.value = null
  showCompanyModal.value = true
  quickActionsOpen.value = false
}

const showCreateTeamModal = () => {
  selectedTeamForEdit.value = null
  showTeamModal.value = true
  quickActionsOpen.value = false
}

const toggleEmployeeSubmenu = () => {
  employeeSubmenuOpen.value = !employeeSubmenuOpen.value
}

const addEmployeeToCompany = (company) => {
  // Imposta l'azienda selezionata
  setSelectedCompany(company.id)
  selectedCompanyLocal.value = company.id
  
  // Naviga alla pagina dipendenti
  router.push('/dashboard/employees')
  
  // Chiudi i menu
  employeeSubmenuOpen.value = false
  quickActionsOpen.value = false
  
  // Opzionale: aprire direttamente il modal dipendente
  // Questo può essere implementato tramite query params o store
  setTimeout(() => {
    // Trigger per aprire il modal dipendente nella pagina
    const event = new CustomEvent('openEmployeeModal', { 
      detail: { companyId: company.id } 
    })
    window.dispatchEvent(event)
  }, 100)
}

const goToEmployees = () => {
  router.push('/dashboard/employees')
  quickActionsOpen.value = false
}

// Company Modal functions
const handleSaveCompany = (companyData) => {
  if (selectedCompanyForEdit.value?.id) {
    updateCompany(selectedCompanyForEdit.value.id, companyData)
  } else {
    addCompany(companyData)
  }
  closeCompanyModal()
}

const closeCompanyModal = () => {
  showCompanyModal.value = false
  selectedCompanyForEdit.value = null
}

// Team Modal functions
const handleSaveTeam = (teamData) => {
  if (selectedTeamForEdit.value?.id) {
    updateTeam(selectedTeamForEdit.value.id, teamData)
  } else {
    addTeam(teamData)
  }
  closeTeamModal()
}

const closeTeamModal = () => {
  showTeamModal.value = false
  selectedTeamForEdit.value = null
}

onMounted(() => {
  console.log('Dashboard mounted!')
  
  // Test del caricamento dati
  loadData()
  
  // Chiudi il menu utente quando si clicca fuori
  const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
      userMenuOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  
  // Cleanup
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
