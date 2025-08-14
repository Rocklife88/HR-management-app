<template>
  <!-- Loading State -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    <span class="ml-2 text-gray-600">Caricamento...</span>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">Errore nel caricamento</h3>
        <p class="mt-2 text-sm text-red-700">{{ error }}</p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">
          Dipendenti
          <span v-if="selectedCompany" class="text-lg text-gray-600 font-normal">
            - {{ getSelectedCompanyName() }}
          </span>
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          <span v-if="selectedCompany">
            Dipendenti dell'azienda {{ getSelectedCompanyName() }} ({{ enrichedEmployees.length }})
          </span>
          <span v-else>
            Lista completa dei dipendenti di tutte le aziende ({{ enrichedEmployees.length }})
          </span>
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
        <!-- Toggle vista -->
        <div class="inline-flex rounded-md shadow-sm mb-4 sm:mb-0" role="group">
          <button
            @click="viewMode = 'table'"
            :class="[
              'px-4 py-2 text-sm font-medium border rounded-l-lg',
              viewMode === 'table' 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >
            📋 Tabella
          </button>
          <button
            @click="viewMode = 'hierarchical'"
            :class="[
              'px-4 py-2 text-sm font-medium border-t border-r border-b rounded-r-lg',
              viewMode === 'hierarchical' 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >
            🏗️ Per Team
          </button>
        </div>
        
        <button @click="addEmployeeGeneral" class="btn-primary">
          Aggiungi Dipendente
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Cerca</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nome dipendente..."
            class="input-field"
          />
        </div>

        <!-- Company Filter - solo se non c'è una selezione specifica -->
        <div v-if="!selectedCompany">
          <label class="block text-sm font-medium text-gray-700">Azienda</label>
          <select v-model="filters.company" class="input-field">
            <option value="">Tutte le aziende</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <!-- Team Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Team</label>
          <select v-model="filters.team" class="input-field">
            <option value="">Tutti i team</option>
            <option v-for="team in availableTeamsForFilter" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Stato Onboarding</label>
          <select v-model="filters.onboardingStatus" class="input-field">
            <option value="">Tutti</option>
            <option value="Completato">Completato</option>
            <option value="In corso">In corso</option>
            <option value="Da fare">Da fare</option>
          </select>
        </div>

        <!-- Contract Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Tipo Contratto</label>
          <select v-model="filters.contractType" class="input-field">
            <option value="">Tutti</option>
            <option value="Determinato">Determinato</option>
            <option value="Indeterminato">Indeterminato</option>
          </select>
        </div>
      </div>

      <!-- Alert Filters -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          @click="filters.contractExpiring = !filters.contractExpiring"
          :class="['px-3 py-1 rounded-full text-xs font-medium', filters.contractExpiring ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700']"
        >
          Contratti in scadenza (30gg)
        </button>
        <button
          @click="filters.medicalExpiring = !filters.medicalExpiring"
          :class="['px-3 py-1 rounded-full text-xs font-medium', filters.medicalExpiring ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700']"
        >
          Visite mediche in scadenza
        </button>
        <button
          @click="filters.safetyExpiring = !filters.safetyExpiring"
          :class="['px-3 py-1 rounded-full text-xs font-medium', filters.safetyExpiring ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700']"
        >
          Corsi sicurezza in scadenza
        </button>
        <button
          @click="filters.lowVacation = !filters.lowVacation"
          :class="['px-3 py-1 rounded-full text-xs font-medium', filters.lowVacation ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700']"
        >
          Ferie sotto soglia
        </button>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ filteredEmployees.length }} di {{ enrichedEmployees.length }} dipendenti
          <span v-if="selectedCompany">per {{ getSelectedCompanyName() }}</span>
        </div>
        <div class="flex gap-2">
          <button @click="exportData" class="btn-secondary">
            Esporta Excel
          </button>
          <button @click="showImportModal = true" class="btn-secondary">
            Importa JSON
          </button>
        </div>
      </div>
    </div>

    <!-- Table - Vista normale -->
    <div v-if="viewMode === 'table'" class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th @click="sortBy('name')" class="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100">
                Nome
                <span v-if="sortKey === 'name'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <!-- Mostra colonna Azienda solo se non c'è una selezione specifica -->
              <th v-if="!selectedCompany" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azienda
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruolo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th @click="sortBy('contractEnd')" class="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100">
                Contratto
                <span v-if="sortKey === 'contractEnd'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scadenze
              </th>
              <th @click="sortBy('onboardingStatus')" class="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100">
                Onboarding
                <span v-if="sortKey === 'onboardingStatus'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in sortedEmployees" :key="employee.id" class="hover:bg-gray-50">
              <!-- Nome con Avatar -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ getInitials(employee.firstName, employee.lastName) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ employee.firstName }} {{ employee.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Azienda - solo se non c'è una selezione specifica -->
              <td v-if="!selectedCompany" class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getCompanyName(employee.company_id) }}</div>
              </td>
              
              <!-- Ruolo -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ employee.role }}</div>
                <div class="text-sm text-gray-500">{{ employee.ccnl }} - {{ employee.level }}</div>
              </td>
              
              <!-- Team -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  v-if="employee.team"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: employee.team.color + '20', color: employee.team.color }"
                >
                  {{ employee.team.name }}
                </span>
              </td>
              
              <!-- Contratto -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ employee.contractType }}</div>
                <div class="text-sm text-gray-500">
                  {{ employee.contractEnd ? formatDate(employee.contractEnd) : 'Indeterminato' }}
                </div>
              </td>
              
              <!-- Scadenze -->
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <div v-for="status in employee.statuses" :key="status.type">
                    <span 
                      :class="['status-badge', getStatusClass(status.severity)]"
                    >
                      {{ status.message }}
                    </span>
                  </div>
                </div>
              </td>
              
              <!-- Onboarding -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['status-badge', getOnboardingClass(employee.onboardingStatus)]">
                  {{ employee.onboardingStatus }}
                </span>
                <div class="text-xs text-gray-500 mt-1">
                  <div>NDA: {{ employee.ndaSigned ? '✓' : '✗' }}</div>
                  <div>Kit: {{ employee.kitReceived ? '✓' : '✗' }}</div>
                  <div>Ferie: {{ employee.vacationDays }}gg</div>
                </div>
              </td>
              
              <!-- Azioni -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="editEmployee(employee)" class="text-primary-600 hover:text-primary-900">
                    Modifica
                  </button>
                  <button @click="deleteEmployeeConfirm(employee)" class="text-red-600 hover:text-red-900">
                    Elimina
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista Gerarchica per Team -->
    <div v-else-if="viewMode === 'hierarchical'" class="space-y-6">
      <div v-for="teamGroup in employeesByTeam" :key="teamGroup.teamId" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Header del Team -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div 
                v-if="teamGroup.team"
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                :style="{ backgroundColor: teamGroup.team.color || '#6B7280' }"
              >
                {{ teamGroup.teamName.charAt(0) }}
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold mr-3">
                ?
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ teamGroup.teamName }}</h3>
                <p class="text-sm text-gray-500">
                  {{ teamGroup.employees.length }} dipendent{{ teamGroup.employees.length === 1 ? 'e' : 'i' }}
                  <span v-if="teamGroup.team && teamGroup.team.supervisor"> • Supervisore: {{ teamGroup.team.supervisor }}</span>
                </p>
              </div>
            </div>
            <div class="text-sm text-gray-400">
              {{ teamGroup.team ? teamGroup.team.description : 'Dipendenti non assegnati a nessun team' }}
            </div>
          </div>
        </div>

        <!-- Dipendenti del Team -->
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="employee in teamGroup.employees" :key="employee.id" class="hover:bg-gray-50">
                <!-- Nome con Avatar -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <span class="text-xs font-medium text-white">
                        {{ getInitials(employee.firstName, employee.lastName) }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ employee.firstName }} {{ employee.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">{{ employee.email }}</div>
                    </div>
                  </div>
                </td>
                
                <!-- Azienda (solo se non c'è selezione specifica) -->
                <td v-if="!selectedCompany" class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getCompanyName(employee.company_id) }}</div>
                </td>
                
                <!-- Ruolo -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ employee.role }}</div>
                  <div class="text-sm text-gray-500">{{ employee.ccnl }} - {{ employee.level }}</div>
                </td>
                
                <!-- Contratto -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ employee.contractType }}</div>
                  <div class="text-sm text-gray-500">
                    {{ employee.contractEnd ? formatDate(employee.contractEnd) : 'Indeterminato' }}
                  </div>
                </td>
                
                <!-- Scadenze -->
                <td class="px-6 py-4">
                  <div class="space-y-1">
                    <div v-for="status in employee.statuses" :key="status.type">
                      <span 
                        :class="['status-badge', getStatusClass(status.severity)]"
                      >
                        {{ status.message }}
                      </span>
                    </div>
                  </div>
                </td>
                
                <!-- Onboarding -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['status-badge', getOnboardingClass(employee.onboardingStatus)]">
                    {{ employee.onboardingStatus }}
                  </span>
                  <div class="text-xs text-gray-500 mt-1">
                    <div>NDA: {{ employee.ndaSigned ? '✓' : '✗' }}</div>
                    <div>Kit: {{ employee.kitReceived ? '✓' : '✗' }}</div>
                    <div>Ferie: {{ employee.vacationDays }}gg</div>
                  </div>
                </td>
                
                <!-- Azioni -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button @click="editEmployee(employee)" class="text-primary-600 hover:text-primary-900">
                      Modifica
                    </button>
                    <button @click="deleteEmployeeConfirm(employee)" class="text-red-600 hover:text-red-900">
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <EmployeeModal
      v-if="showAddModal || showEditModal"
      :employee="selectedEmployee"
      @save="handleSaveEmployee"
      @cancel="closeModals"
      @create-team="handleCreateTeamFromEmployee"
    />

    <!-- Team Modal (creazione da dipendente) -->
    <TeamModal
      v-if="showCreateTeamModal"
      :company-id="teamCreationData.companyId"
      @save="handleSaveTeamFromEmployee"
      @cancel="showCreateTeamModal = false"
    />

    <!-- Import Modal -->
    <ImportModal
      v-if="showImportModal"
      @import="handleImport"
      @cancel="showImportModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHRStore } from '../stores/hr.js'
import { storeToRefs } from 'pinia'

// Import modal components
import EmployeeModal from './EmployeeModal.vue'
import ImportModal from './ImportModal.vue'
import TeamModal from './TeamModal.vue'

// Usa lo store Pinia
const hrStore = useHRStore()

// Destrutturazione reattiva delle proprietà reattive
const {
  companies,
  employees,
  teams,
  selectedCompany,
  loading,
  error,
  filteredEmployees: storeFilteredEmployees
} = storeToRefs(hrStore)

// Destrutturazione delle azioni
const {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  addTeam,
  loadData
} = hrStore

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showImportModal = ref(false)
const showCreateTeamModal = ref(false)
const selectedEmployee = ref(null)
const teamCreationData = ref({ companyId: null, companyName: '' })

// Funzione per aprire il modal di aggiunta dipendente
const addEmployeeGeneral = () => {
  console.log('🔵 addEmployeeGeneral chiamata')
  console.log('🔍 Companies disponibili:', companies.value)
  console.log('🔍 Companies length:', companies.value.length)
  
  // Se c'è solo un'azienda, pre-seleziona automaticamente
  if (companies.value.length === 1) {
    const company = companies.value[0]
    console.log('🎯 Auto-selezionando azienda:', company.name)
    // Pre-imposta l'azienda nel selectedEmployee per passarla al modal
    selectedEmployee.value = {
      companyId: company.id
    }
  } else {
    selectedEmployee.value = null
  }
  
  showAddModal.value = true
}

// Filters
const filters = ref({
  search: '',
  company: '',
  team: '',
  onboardingStatus: '',
  contractType: '',
  contractExpiring: false,
  medicalExpiring: false,
  safetyExpiring: false,
  lowVacation: false
})

// Sorting
const sortKey = ref('name')
const sortDirection = ref('asc')

// View mode
const viewMode = ref('table') // 'table' o 'hierarchical'

// Utility functions
const daysDiff = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
}

const getEmployeeStatus = (employee) => {
  const today = new Date().toISOString().split('T')[0]
  const statuses = []

  // Contratto in scadenza entro 30 giorni
  if (employee.contractEnd) {
    const daysToEnd = daysDiff(today, employee.contractEnd)
    if (daysToEnd <= 30 && daysToEnd >= 0) {
      statuses.push({ type: 'contract-expiring', severity: 'error', message: `Contratto scade in ${daysToEnd} giorni` })
    }
  }

  // Visita medica scaduta o in scadenza
  if (employee.medicalVisit) {
    const medicalDays = daysDiff(today, employee.medicalVisit)
    if (medicalDays < 0) {
      statuses.push({ type: 'medical-expired', severity: 'warning', message: 'Visita medica scaduta' })
    } else if (medicalDays <= 30) {
      statuses.push({ type: 'medical-expiring', severity: 'warning', message: `Visita medica scade in ${medicalDays} giorni` })
    }
  }

  // Corso sicurezza scaduto o in scadenza
  if (employee.safetyTraining) {
    const safetyDays = daysDiff(today, employee.safetyTraining)
    if (safetyDays < 0) {
      statuses.push({ type: 'safety-expired', severity: 'info', message: 'Corso sicurezza scaduto' })
    } else if (safetyDays <= 30) {
      statuses.push({ type: 'safety-expiring', severity: 'info', message: `Corso sicurezza scade in ${safetyDays} giorni` })
    }
  }

  // Residui ferie sotto soglia (< 5 giorni)
  if (employee.vacationDays < 5) {
    statuses.push({ type: 'low-vacation', severity: 'info', message: `Solo ${employee.vacationDays} giorni di ferie residui` })
  }

  // Onboarding non completato
  if (employee.onboardingStatus !== 'Completato') {
    statuses.push({ type: 'onboarding-incomplete', severity: 'warning', message: `Onboarding: ${employee.onboardingStatus}` })
  }

  return statuses
}

// Computed properties
const availableTeamsForFilter = computed(() => {
  // Se c'è un'azienda selezionata nel dashboard, mostra solo i suoi team
  if (selectedCompany.value) {
    return teams.value.filter(team => team.company_id === selectedCompany.value)
  }
  // Se c'è un filtro azienda locale, mostra solo i team di quella azienda
  if (filters.value.company) {
    return teams.value.filter(team => team.company_id === parseInt(filters.value.company))
  }
  // Altrimenti mostra tutti i team
  return teams.value
})

const enrichedEmployees = computed(() => {
  // Se c'è un'azienda selezionata, usa i dipendenti filtrati dallo store
  // Altrimenti mostra tutti i dipendenti
  const employeesToShow = selectedCompany.value ? storeFilteredEmployees.value : employees.value
  
  console.log('🔧 DEBUG: enrichedEmployees computed:', {
    selectedCompany: selectedCompany.value,
    employeesToShow: employeesToShow.length,
    teams: teams.value.length
  })
  
  return employeesToShow.map(employee => {
    const teamId = employee.teamId || employee.team_id
    const team = teams.value.find(t => t.id === teamId)
    
    const enriched = {
      ...employee,
      team,
      statuses: getEmployeeStatus(employee)
    }
    
    console.log(`🔧 DEBUG: Enriching ${employee.firstName} ${employee.lastName}:`, {
      teamId,
      foundTeam: team,
      enriched
    })
    
    return enriched
  })
})

const filteredEmployees = computed(() => {
  let result = enrichedEmployees.value

  // Text search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(emp => 
      emp.firstName.toLowerCase().includes(search) ||
      emp.lastName.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search)
    )
  }

  // Company filter (solo quando non c'è una selezione specifica)
  if (!selectedCompany.value && filters.value.company) {
    result = result.filter(emp => emp.company_id === parseInt(filters.value.company))
  }

  // Team filter
  if (filters.value.team) {
    result = result.filter(emp => emp.team_id === parseInt(filters.value.team))
  }

  // Onboarding status filter
  if (filters.value.onboardingStatus) {
    result = result.filter(emp => emp.onboardingStatus === filters.value.onboardingStatus)
  }

  // Contract type filter
  if (filters.value.contractType) {
    result = result.filter(emp => emp.contractType === filters.value.contractType)
  }

  // Alert filters
  if (filters.value.contractExpiring) {
    result = result.filter(emp => 
      emp.statuses.some(status => status.type === 'contract-expiring')
    )
  }

  if (filters.value.medicalExpiring) {
    result = result.filter(emp => 
      emp.statuses.some(status => status.type.includes('medical'))
    )
  }

  if (filters.value.safetyExpiring) {
    result = result.filter(emp => 
      emp.statuses.some(status => status.type.includes('safety'))
    )
  }

  if (filters.value.lowVacation) {
    result = result.filter(emp => 
      emp.statuses.some(status => status.type === 'low-vacation')
    )
  }

  return result
})

const sortedEmployees = computed(() => {
  const sorted = [...filteredEmployees.value]
  
  sorted.sort((a, b) => {
    let aVal, bVal
    
    switch (sortKey.value) {
      case 'name':
        aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
        bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
        break
      case 'contractEnd':
        aVal = a.contractEnd || '9999-12-31'
        bVal = b.contractEnd || '9999-12-31'
        break
      case 'onboardingStatus':
        aVal = a.onboardingStatus
        bVal = b.onboardingStatus
        break
      default:
        aVal = a[sortKey.value]
        bVal = b[sortKey.value]
    }
    
    if (sortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
  
  return sorted
})

// Raggruppa dipendenti per team per vista gerarchica
const employeesByTeam = computed(() => {
  const grouped = {}
  
  console.log('🔧 DEBUG: employeesByTeam computed chiamata')
  console.log('🔧 DEBUG: sortedEmployees.value:', sortedEmployees.value.length, 'dipendenti')
  
  sortedEmployees.value.forEach(employee => {
    const teamId = employee.teamId || employee.team_id || 'no-team'
    const teamName = employee.team ? employee.team.name : 'Senza Team'
    
    console.log(`🔧 DEBUG: Dipendente ${employee.firstName} ${employee.lastName}:`, {
      teamId: employee.teamId || employee.team_id,
      teamName,
      team: employee.team,
      employeeObject: employee
    })
    
    if (!grouped[teamId]) {
      grouped[teamId] = {
        teamId,
        teamName,
        team: employee.team,
        employees: []
      }
    }
    
    grouped[teamId].employees.push(employee)
  })
  
  // Ordina i gruppi di team
  const result = Object.values(grouped).sort((a, b) => {
    // Prima i team con nome, poi "Senza Team"
    if (a.teamId === 'no-team') return 1
    if (b.teamId === 'no-team') return -1
    return a.teamName.localeCompare(b.teamName)
  })
  
  console.log('🔧 DEBUG: employeesByTeam result:', result)
  return result
})

// Methods
const getInitials = (firstName, lastName) => {
  return (firstName[0] + lastName[0]).toUpperCase()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const getStatusClass = (severity) => {
  switch (severity) {
    case 'error': return 'status-expired'
    case 'warning': return 'status-warning'
    case 'info': return 'status-info'
    default: return 'status-info'
  }
}

const getOnboardingClass = (status) => {
  switch (status) {
    case 'Completato': return 'status-success'
    case 'In corso': return 'status-warning'
    case 'Da fare': return 'status-expired'
    default: return 'status-info'
  }
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

const editEmployee = (employee) => {
  selectedEmployee.value = { ...employee }
  showEditModal.value = true
}

const deleteEmployeeConfirm = (employee) => {
  if (confirm(`Sei sicuro di voler eliminare ${employee.firstName} ${employee.lastName}?`)) {
    deleteEmployee(employee.id)
  }
}

const handleSaveEmployee = async (employeeData) => {
  console.log('🎯 handleSaveEmployee INIZIATO!')
  console.log('🔧 DEBUG: employeeData ricevuto:', JSON.stringify(employeeData, null, 2))
  console.log('🔧 DEBUG: selectedEmployee.value:', selectedEmployee.value)
  
  try {
    console.log('🔧 DEBUG: handleSaveEmployee chiamata con:', employeeData)
    
    if (selectedEmployee.value?.id) {
      console.log('🔧 DEBUG: Aggiornamento dipendente esistente:', selectedEmployee.value.id)
      await updateEmployee(selectedEmployee.value.id, employeeData)
    } else {
      console.log('🔧 DEBUG: Creazione nuovo dipendente')
      console.log('🔧 DEBUG: Chiamando addEmployee...')
      const newEmployee = await addEmployee(employeeData)
      console.log('✅ Nuovo dipendente creato:', newEmployee)
    }
    console.log('🔧 DEBUG: Chiudendo modali...')
    closeModals()
    console.log('✅ handleSaveEmployee COMPLETATO!')
  } catch (error) {
    console.error('❌ Errore nel salvataggio dipendente:', error)
    console.error('❌ Stack trace:', error.stack)
    // Mostra un alert all'utente
    alert(`Errore nel salvataggio: ${error.message}`)
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showCreateTeamModal.value = false
  selectedEmployee.value = null
  teamCreationData.value = { companyId: null, companyName: '' }
}

// Gestione creazione team dal modal dipendente
const handleCreateTeamFromEmployee = (data) => {
  console.log('🎯🎯🎯 handleCreateTeamFromEmployee CHIAMATA!')
  console.log('🔧 DEBUG: handleCreateTeamFromEmployee chiamata con:', data)
  console.log('🔧 DEBUG: typeof data:', typeof data)
  console.log('🔧 DEBUG: data keys:', Object.keys(data || {}))
  console.log('🔧 DEBUG: Aprendo TeamModal con companyId:', data.companyId)
  teamCreationData.value = data
  showCreateTeamModal.value = true
  console.log('🔧 DEBUG: showCreateTeamModal impostato a:', showCreateTeamModal.value)
  console.log('🔧 DEBUG: teamCreationData.value:', teamCreationData.value)
}

const handleSaveTeamFromEmployee = async (teamData) => {
  console.log('🎯 handleSaveTeamFromEmployee INIZIATO!')
  console.log('🔧 DEBUG: teamData ricevuto:', JSON.stringify(teamData, null, 2))
  console.log('🔧 DEBUG: teamCreationData.value:', teamCreationData.value)
  
  try {
    console.log('🔧 DEBUG: handleSaveTeamFromEmployee chiamata con:', teamData)
    
    // Aggiungi l'ID dell'azienda ai dati del team
    const teamDataWithCompany = {
      ...teamData,
      companyId: teamCreationData.value.companyId
    }
    
    console.log('🔧 DEBUG: Creazione team con dati:', teamDataWithCompany)
    console.log('🔧 DEBUG: Chiamando addTeam...')
    const newTeam = await addTeam(teamDataWithCompany)
    console.log('✅ Team creato con successo:', newTeam)
    
    showCreateTeamModal.value = false
    teamCreationData.value = { companyId: null, companyName: '' }
    
    // Il team sarà automaticamente disponibile nel dropdown dell'EmployeeModal
    // grazie alla reattività di Pinia
  } catch (error) {
    console.error('❌ Errore nella creazione del team:', error)
    alert(`Errore nella creazione del team: ${error.message}`)
  }
}

const exportData = () => {
  // TODO: Implementare export to Excel
  console.log('Export non ancora implementato')
  alert('Funzione di export in arrivo!')
}

const handleImport = (jsonData) => {
  // TODO: Implementare import from JSON
  console.log('Import non ancora implementato')
  showImportModal.value = false
  alert('Funzione di import in arrivo!')
}

// Helper per ottenere il nome dell'azienda selezionata
const getSelectedCompanyName = () => {
  if (!selectedCompany.value) return ''
  const company = companies.value.find(c => c.id === selectedCompany.value)
  return company ? company.name : 'Azienda sconosciuta'
}

// Helper per ottenere il nome dell'azienda dato l'ID
const getCompanyName = (companyId) => {
  const company = companies.value.find(c => c.id === companyId)
  return company ? company.name : 'N/A'
}

onMounted(async () => {
  console.log('Employees component mounted!')
  
  // Carica i dati
  await loadData()
  
  console.log('Employees data:', employees.value)
  console.log('Teams data:', teams.value)
  console.log('Companies data:', companies.value)
  console.log('Loading state:', loading.value)
  console.log('Error state:', error.value)
  
  // Listener per aprire automaticamente il modal quando si arriva dalla dashboard
  const handleOpenEmployeeModal = (event) => {
    console.log('Opening employee modal from dashboard:', event.detail)
    showAddModal.value = true
  }
  
  window.addEventListener('openEmployeeModal', handleOpenEmployeeModal)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('openEmployeeModal', handleOpenEmployeeModal)
  })
})
</script>
