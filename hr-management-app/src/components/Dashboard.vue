<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar - nascosta quando sistema è vuoto -->
    <div v-if="companies.length > 0" class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" :class="{ '-translate-x-full': !sidebarOpen }">
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
    <div :class="companies.length > 0 ? 'md:pl-64' : ''">
      <!-- Top Header -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <!-- Menu button solo quando ci sono aziende -->
        <button v-if="companies.length > 0" @click="sidebarOpen = true" class="md:hidden -m-2.5 p-2.5 text-gray-700">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div v-if="companies.length > 0" class="h-6 w-px bg-gray-200 md:hidden" />
        
        <!-- Header semplificato quando sistema è vuoto -->
        <div v-if="companies.length === 0" class="flex flex-1 items-center justify-center">
          <h1 class="text-xl font-bold text-gray-900">HR Management System</h1>
        </div>
        
        <!-- Header completo quando ci sono aziende -->
        <div v-else class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <!-- Company Selector -->
          <div class="flex items-center gap-x-2">
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
            
            <!-- Pulsante elimina azienda -->
            <button 
              v-if="selectedCompanyLocal"
              @click="deleteSelectedCompany"
              class="px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              title="Elimina azienda selezionata"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
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
                  <!-- Crea Azienda -->
                  <button @click="showCreateCompanyModal" class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Crea Nuova Azienda
                  </button>
                  
                  <div class="border-t border-gray-100"></div>
                  
                  <button @click="showCreateTeamModal" class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Crea Nuovo Team
                  </button>
                  
                  <!-- Aggiungi Dipendente - solo se c'è un'azienda selezionata -->
                  <button 
                    v-if="selectedCompanyLocal"
                    @click="addEmployeeToSelectedCompany" 
                    class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    Aggiungi Dipendente a {{ companies.find(c => c.id === selectedCompanyLocal)?.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Status indicator -->
            <div class="text-sm text-gray-600">{{ companies.length }} Aziend{{ companies.length === 1 ? 'a' : 'e' }}</div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="py-6">
        <div class="px-4 sm:px-6 lg:px-8">
          <!-- Schermata di Onboarding quando sistema è vuoto -->
          <div v-if="companies.length === 0" class="min-h-[60vh] flex items-center justify-center">
            <div class="text-center max-w-md mx-auto">
              <!-- Icon -->
              <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
                <svg class="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <!-- Welcome Message -->
              <h2 class="text-2xl font-bold text-gray-900 mb-3">
                Benvenuto HR Specialist! 👋
              </h2>
              <p class="text-gray-600 mb-8 leading-relaxed">
                Inizia creando la tua prima azienda per sbloccare tutte le funzionalità del sistema di gestione HR.
              </p>
              
              <!-- CTA Button -->
              <button 
                @click="showCreateCompanyModal"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crea Nuova Azienda
              </button>
              
              <!-- Features Preview -->
              <div class="mt-12 grid grid-cols-1 gap-4 text-sm text-gray-500">
                <div class="flex items-center justify-center">
                  <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Gestione dipendenti completa
                </div>
                <div class="flex items-center justify-center">
                  <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Organizzazione per team
                </div>
                <div class="flex items-center justify-center">
                  <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Meeting e calendario HR
                </div>
              </div>
            </div>
          </div>
          
          <!-- Contenuto normale quando ci sono aziende -->
          <div v-else>
            <router-view />
          </div>
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
      :company="selectedCompanyForEdit"
      @save="handleSaveCompany"
      @cancel="closeCompanyModal"
    />

    <!-- Team Modal -->
    <TeamModal
      v-if="showTeamModal"
      :team="selectedTeamForEdit"
      @save="handleSaveTeam"
      @cancel="closeTeamModal"
    />

    <!-- Employee Modal -->
    <EmployeeModal
      v-if="showEmployeeModal"
      :employee="selectedEmployeeForEdit"
      @save="handleSaveEmployee"
      @cancel="closeEmployeeModal"
      @create-team="handleCreateTeamFromEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHRStore } from '../stores/hr.js'
import { storeToRefs } from 'pinia'
import CompanyModal from './CompanyModal.vue'
import TeamModal from './TeamModal.vue'
import EmployeeModal from './EmployeeModal.vue'

// Icons (simplified inline SVG components)
const UsersIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 919 0z" /></svg>`
}

const UserGroupIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`
}

const CalendarIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
}

const BuildingOfficeIcon = {
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`
}

const router = useRouter()

// Usa lo store Pinia
const hrStore = useHRStore()

// Destrutturazione reattiva delle proprietà reattive
const { 
  companies, 
  employees,
  teams,
  selectedCompany,
  loading,
  error
} = storeToRefs(hrStore)

// Destrutturazione delle azioni (non hanno bisogno di storeToRefs)
const {
  loadData,
  setSelectedCompany,
  addCompany,
  updateCompany,
  deleteCompany,
  addTeam,
  updateTeam,
  deleteTeam,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  clearAllData
} = hrStore

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const quickActionsOpen = ref(false)

// Local reactive reference for the select
const selectedCompanyLocal = ref('')

// Modal states
const showCompanyModal = ref(false)
const showTeamModal = ref(false)
const showEmployeeModal = ref(false)
const selectedCompanyForEdit = ref(null)
const selectedTeamForEdit = ref(null)
const selectedEmployeeForEdit = ref(null)

const navigation = [
  { name: 'Aziende', href: '/dashboard/companies', icon: BuildingOfficeIcon },
  { name: 'Dipendenti', href: '/dashboard/employees', icon: UsersIcon },
  { name: 'Team', href: '/dashboard/teams', icon: UserGroupIcon },
  { name: 'Meeting HR', href: '/dashboard/meetings', icon: CalendarIcon },
]

const handleCompanyChange = () => {
  setSelectedCompany(selectedCompanyLocal.value || null)
}

const deleteSelectedCompany = async () => {
  if (!selectedCompanyLocal.value) return
  
  const company = companies.value.find(c => c.id === selectedCompanyLocal.value)
  if (!company) return
  
  if (confirm(`Sei sicuro di voler eliminare l'azienda "${company.name}"? Questa azione eliminerà anche tutti i team e dipendenti associati.`)) {
    try {
      await deleteCompany(selectedCompanyLocal.value)
      selectedCompanyLocal.value = ''
      setSelectedCompany(null)
      alert('Azienda eliminata con successo!')
    } catch (err) {
      alert('Errore nell\'eliminazione: ' + err.message)
    }
  }
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

const addEmployeeToSelectedCompany = () => {
  if (!selectedCompanyLocal.value) return
  
  const company = companies.value.find(c => c.id === selectedCompanyLocal.value)
  if (!company) return
  
  // Apri il modal dipendente con l'azienda pre-selezionata
  selectedEmployeeForEdit.value = {
    companyId: company.id
  }
  showEmployeeModal.value = true
  quickActionsOpen.value = false
}

const addEmployeeToCompany = (company) => {
  // Imposta l'azienda selezionata
  setSelectedCompany(company.id)
  selectedCompanyLocal.value = company.id
  
  // Apri il modal dipendente con l'azienda pre-selezionata
  selectedEmployeeForEdit.value = {
    companyId: company.id
  }
  showEmployeeModal.value = true
  
  // Chiudi i menu
  quickActionsOpen.value = false
}

const addEmployeeGeneral = () => {
  // Se c'è solo un'azienda, pre-selezionala
  if (companies.value.length === 1) {
    const company = companies.value[0]
    setSelectedCompany(company.id)
    selectedCompanyLocal.value = company.id
    selectedEmployeeForEdit.value = {
      companyId: company.id
    }
  } else {
    // Se ci sono più aziende, lascia che l'utente scelga
    selectedEmployeeForEdit.value = null
  }
  
  showEmployeeModal.value = true
  
  // Chiudi i menu
  quickActionsOpen.value = false
}

// Company Modal functions
const handleSaveCompany = (companyData) => {
  let newCompany
  if (selectedCompanyForEdit.value?.id) {
    updateCompany(selectedCompanyForEdit.value.id, companyData)
    newCompany = companies.value.find(c => c.id === selectedCompanyForEdit.value.id)
  } else {
    newCompany = addCompany(companyData)
    // Seleziona automaticamente la nuova azienda creata
    setSelectedCompany(newCompany.id)
    selectedCompanyLocal.value = newCompany.id
  }
  closeCompanyModal()
}

const closeCompanyModal = () => {
  showCompanyModal.value = false
  selectedCompanyForEdit.value = null
}

const handleDeleteCompany = async (company) => {
  if (confirm(`Sei sicuro di voler eliminare l'azienda "${company.name}"?\nVerranno eliminati anche tutti i team e dipendenti associati.`)) {
    try {
      await deleteCompany(company.id)
    } catch (err) {
      alert('Errore nell\'eliminazione: ' + err.message)
    }
  }
}

// Team Modal functions
const handleSaveTeam = async (teamData) => {
  try {
    if (selectedTeamForEdit.value?.id) {
      await updateTeam(selectedTeamForEdit.value.id, teamData)
    } else {
      await addTeam(teamData)
    }
    closeTeamModal()
    
    // Se stiamo creando un team dall'employee modal, riapri l'employee modal
    if (window.tempEmployeeData !== undefined) {
      setTimeout(() => {
        selectedEmployeeForEdit.value = window.tempEmployeeData
        showEmployeeModal.value = true
        window.tempEmployeeData = undefined
      }, 100)
    }
  } catch (err) {
    alert('Errore nel salvataggio team: ' + err.message)
  }
}

const closeTeamModal = () => {
  showTeamModal.value = false
  selectedTeamForEdit.value = null
}

const handleDeleteTeam = async (team) => {
  if (confirm(`Sei sicuro di voler eliminare il team "${team.name}"?\nI dipendenti del team non verranno eliminati ma dovranno essere riassegnati.`)) {
    try {
      await deleteTeam(team.id)
    } catch (err) {
      alert('Errore nell\'eliminazione team: ' + err.message)
    }
  }
}

// Employee Modal functions
const handleSaveEmployee = async (employeeData) => {
  try {
    if (selectedEmployeeForEdit.value?.id) {
      await updateEmployee(selectedEmployeeForEdit.value.id, employeeData)
    } else {
      await addEmployee(employeeData)
    }
    closeEmployeeModal()
  } catch (err) {
    alert('Errore nel salvataggio dipendente: ' + err.message)
  }
}

const closeEmployeeModal = () => {
  showEmployeeModal.value = false
  selectedEmployeeForEdit.value = null
}

const handleDeleteEmployee = (employee) => {
  if (confirm(`Sei sicuro di voler eliminare il dipendente "${employee.firstName} ${employee.lastName}"?`)) {
    deleteEmployee(employee.id)
  }
}

const handleCreateTeamFromEmployee = (teamData) => {
  // Chiudi l'employee modal temporaneamente
  const currentEmployeeData = selectedEmployeeForEdit.value
  closeEmployeeModal()
  
  // Preimposta l'azienda nel team modal
  selectedTeamForEdit.value = {
    companyId: teamData.companyId
  }
  showTeamModal.value = true
  
  // Salva i dati dell'employee per riaprire il modal dopo
  window.tempEmployeeData = currentEmployeeData
}

onMounted(async () => {
  console.log('🚀 Dashboard mounted - Sistema HR con Supabase!')
  
  try {
    // Carica dati dal database
    await loadData()
    
    console.log('📊 Dati caricati nel Dashboard:', {
      companies: companies.value,
      teams: teams.value,
      employees: employees.value
    })
  } catch (err) {
    console.error('❌ Errore nel caricamento Dashboard:', err)
  }
  
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
