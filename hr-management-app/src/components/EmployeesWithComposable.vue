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
          Gestione Dipendenti
          <span v-if="selectedCompany" class="text-lg text-primary-600 font-normal">
            - {{ getCompanyName(selectedCompany) }}
          </span>
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          Totale: {{ filteredEmployees.length }} dipendenti
          <span v-if="selectedCompany" class="text-primary-600">
            (filtrati per {{ getCompanyName(selectedCompany) }})
          </span>
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
        <button @click="exportEmployees" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Esporta
        </button>
        <button @click="showAddModal = true" class="btn-primary">
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Aggiungi Dipendente
        </button>
      </div>
    </div>

    <!-- Filters and View Options -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ricerca</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nome, email, ruolo..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <!-- Team Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <select v-model="selectedTeam" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti i team</option>
            <option v-for="team in filteredTeamsByCompany" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
        </div>
        
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stato Onboarding</label>
          <select v-model="selectedStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti gli stati</option>
            <option value="Completato">Completato</option>
            <option value="In corso">In corso</option>
            <option value="Non iniziato">Non iniziato</option>
          </select>
        </div>
        
        <!-- Contract Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo Contratto</label>
          <select v-model="selectedContractType" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option value="">Tutti i tipi</option>
            <option value="Indeterminato">Indeterminato</option>
            <option value="Determinato">Determinato</option>
            <option value="Consulenza">Consulenza</option>
            <option value="Stage">Stage</option>
          </select>
        </div>
      </div>
      
      <!-- View Options -->
      <div class="flex items-center justify-between border-t border-gray-200 pt-4">
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input v-model="groupByTeam" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
            <span class="ml-2 text-sm text-gray-700">Raggruppa per team</span>
          </label>
          <label class="flex items-center">
            <input v-model="showExpiringContracts" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
            <span class="ml-2 text-sm text-gray-700">Solo contratti in scadenza</span>
          </label>
        </div>
        <div class="text-sm text-gray-500">
          Mostrando {{ filteredEmployees.length }} di {{ employees.length }} dipendenti
        </div>
      </div>
    </div>

    <!-- Employees Table/Cards -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <!-- Table View (when not grouped) -->
      <div v-if="!groupByTeam" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dipendente
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team & Ruolo
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contratto
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Onboarding
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Azioni</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in filteredEmployees" :key="employee.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700">
                        {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ employee.firstName }} {{ employee.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getTeamName(employee.teamId) }}</div>
                <div class="text-sm text-gray-500">{{ employee.role }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ employee.contractType }}</div>
                <div class="text-sm text-gray-500">
                  Dal {{ formatDate(employee.contractStart) }}
                  <span v-if="employee.contractEnd">al {{ formatDate(employee.contractEnd) }}</span>
                </div>
                <div v-if="isContractExpiring(employee)" class="text-xs text-red-600 font-medium">
                  ⚠️ In scadenza
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="space-y-1">
                  <div class="flex items-center">
                    <span class="h-2 w-2 rounded-full mr-2" :class="employee.ndaSigned ? 'bg-green-400' : 'bg-red-400'"></span>
                    NDA {{ employee.ndaSigned ? 'Firmato' : 'Non firmato' }}
                  </div>
                  <div class="flex items-center">
                    <span class="h-2 w-2 rounded-full mr-2" :class="employee.kitReceived ? 'bg-green-400' : 'bg-red-400'"></span>
                    Kit {{ employee.kitReceived ? 'Consegnato' : 'Non consegnato' }}
                  </div>
                  <div class="text-xs">{{ employee.vacationDays }} gg ferie</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(employee.onboardingStatus)">
                  {{ employee.onboardingStatus }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button @click="editEmployee(employee)" class="text-primary-600 hover:text-primary-900">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteEmployeeConfirm(employee)" class="text-red-600 hover:text-red-900">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredEmployees.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m16 8l-2-2m-4 4l-2-2M8 8l-2 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nessun dipendente trovato</h3>
          <p class="mt-1 text-sm text-gray-500">Prova a modificare i filtri di ricerca.</p>
        </div>
      </div>

      <!-- Grouped View (when grouped by team) -->
      <div v-else>
        <div v-for="(teamEmployees, teamId) in groupedEmployees" :key="teamId" class="border-b border-gray-200 last:border-b-0">
          <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              {{ getTeamName(parseInt(teamId)) || 'Senza Team' }}
              <span class="ml-2 text-sm font-normal text-gray-500">({{ teamEmployees.length }} dipendenti)</span>
            </h3>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-for="employee in teamEmployees" :key="employee.id" class="px-6 py-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700">
                        {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ employee.firstName }} {{ employee.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ employee.email }} • {{ employee.role }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusColor(employee.onboardingStatus)">
                    {{ employee.onboardingStatus }}
                  </span>
                  <div class="text-sm text-gray-500">{{ employee.contractType }}</div>
                  <div class="flex items-center space-x-2">
                    <button @click="editEmployee(employee)" class="text-primary-600 hover:text-primary-900">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <EmployeeModal
      v-if="showAddModal || showEditModal"
      :employee="selectedEmployee"
      :teams="filteredTeamsByCompany"
      @save="handleSaveEmployee"
      @cancel="closeModals"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Elimina Dipendente</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Sei sicuro di voler eliminare {{ employeeToDelete?.firstName }} {{ employeeToDelete?.lastName }}? 
                    Questa azione non può essere annullata.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmDelete" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Elimina
            </button>
            <button @click="cancelDelete" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHR } from '../composables/useHRTest'
import EmployeeModal from './EmployeeModal.vue'

const {
  employees,
  teams,
  loading,
  error,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  exportToExcel,
  companies,
  selectedCompany,
  filteredEmployeesByCompany,
  filteredTeamsByCompany,
  getCompanyName
} = useHR()

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedEmployee = ref(null)
const employeeToDelete = ref(null)

// Filter states
const searchQuery = ref('')
const selectedTeam = ref('')
const selectedStatus = ref('')
const selectedContractType = ref('')
const groupByTeam = ref(false)
const showExpiringContracts = ref(false)

// Utility functions
const getTeamName = (teamId) => {
  // Use filtered teams by company instead of all teams
  const team = filteredTeamsByCompany.value.find(t => t.id === teamId)
  return team ? team.name : 'N/A'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('it-IT')
}

const isContractExpiring = (employee) => {
  if (!employee.contractEnd) return false
  const endDate = new Date(employee.contractEnd)
  const today = new Date()
  const threeMonthsFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000))
  return endDate <= threeMonthsFromNow && endDate >= today
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Completato':
      return 'bg-green-100 text-green-800'
    case 'In corso':
      return 'bg-yellow-100 text-yellow-800'
    case 'Non iniziato':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Computed properties for filtering
const filteredEmployees = computed(() => {
  // Start with employees filtered by company
  let filtered = [...filteredEmployeesByCompany.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(emp => 
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query)
    )
  }

  // Team filter (also filter teams by company)
  if (selectedTeam.value) {
    filtered = filtered.filter(emp => emp.teamId === parseInt(selectedTeam.value))
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(emp => emp.onboardingStatus === selectedStatus.value)
  }

  // Contract type filter
  if (selectedContractType.value) {
    filtered = filtered.filter(emp => emp.contractType === selectedContractType.value)
  }

  // Expiring contracts filter
  if (showExpiringContracts.value) {
    filtered = filtered.filter(emp => isContractExpiring(emp))
  }

  return filtered
})

const groupedEmployees = computed(() => {
  if (!groupByTeam.value) return {}
  
  return filteredEmployees.value.reduce((groups, employee) => {
    const teamId = employee.teamId || 'unassigned'
    if (!groups[teamId]) {
      groups[teamId] = []
    }
    groups[teamId].push(employee)
    return groups
  }, {})
})

// Modal functions
const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedEmployee.value = null
}

const handleSaveEmployee = (employeeData) => {
  console.log('Saving employee:', employeeData)
  
  // Map modal fields to expected employee structure
  const mappedData = {
    firstName: employeeData.firstName,
    lastName: employeeData.lastName,
    email: employeeData.email,
    role: employeeData.role,
    teamId: employeeData.teamId ? parseInt(employeeData.teamId) : null,
    companyId: selectedCompany.value || 1, // Assign to selected company or default to Move Solutions
    contractType: employeeData.contractType,
    contractStart: employeeData.contractStart || employeeData.hireDate, // Use contractStart or fallback to hireDate
    contractEnd: employeeData.contractType === 'Indeterminato' ? null : employeeData.contractEnd,
    onboardingStatus: employeeData.onboardingStatus || 'Non iniziato',
    ndaSigned: employeeData.ndaSigned || false,
    kitReceived: employeeData.kitReceived || false,
    vacationDays: employeeData.vacationDays || 0,
    // Additional fields from modal
    ccnl: employeeData.ccnl,
    level: employeeData.level,
    hireDate: employeeData.hireDate,
    medicalVisit: employeeData.medicalVisit,
    safetyTraining: employeeData.safetyTraining,
    notes: employeeData.notes
  }
  
  if (selectedEmployee.value?.id) {
    // Update existing employee
    const index = employees.value.findIndex(emp => emp.id === selectedEmployee.value.id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...mappedData }
      console.log('Employee updated:', employees.value[index])
    }
  } else {
    // Add new employee
    const newEmployee = {
      ...mappedData,
      id: Math.max(0, ...employees.value.map(e => e.id)) + 1,
    }
    console.log('Adding new employee to company:', getCompanyName(newEmployee.companyId), newEmployee)
    employees.value.push(newEmployee)
    console.log('Employees array after push:', employees.value.length, 'employees')
  }
  closeModals()
}

const editEmployee = (employee) => {
  selectedEmployee.value = { ...employee }
  showEditModal.value = true
}

const deleteEmployeeConfirm = (employee) => {
  employeeToDelete.value = employee
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (employeeToDelete.value) {
    const index = employees.value.findIndex(emp => emp.id === employeeToDelete.value.id)
    if (index !== -1) {
      employees.value.splice(index, 1)
    }
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  employeeToDelete.value = null
}

const exportEmployees = () => {
  const exportData = filteredEmployees.value.map(emp => ({
    Nome: `${emp.firstName} ${emp.lastName}`,
    Email: emp.email,
    Ruolo: emp.role,
    Team: getTeamName(emp.teamId),
    'Tipo Contratto': emp.contractType,
    'Data Inizio': formatDate(emp.contractStart),
    'Data Fine': formatDate(emp.contractEnd),
    'Stato Onboarding': emp.onboardingStatus,
    'NDA Firmato': emp.ndaSigned ? 'Sì' : 'No',
    'Kit Ricevuto': emp.kitReceived ? 'Sì' : 'No',
    'Giorni Ferie': emp.vacationDays
  }))
  
  // For now, just log the export data
  console.log('Exporting employees:', exportData)
  alert(`Esportazione di ${exportData.length} dipendenti (funzionalità demo)`)
}

onMounted(() => {
  console.log('Advanced Employees component mounted!')
})
</script>
