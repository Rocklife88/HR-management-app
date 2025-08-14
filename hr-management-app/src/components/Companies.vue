<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Aziende</h1>
        <p class="mt-2 text-sm text-gray-700">
          Gestisci le aziende del sistema HR
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="showCreateCompanyModal" class="btn-primary">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuova Azienda
        </button>
      </div>
    </div>

    <!-- Companies Grid -->
    <div v-if="companies.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Nessuna azienda</h3>
      <p class="mt-1 text-sm text-gray-500">Inizia creando la tua prima azienda.</p>
      <div class="mt-6">
        <button @click="showCreateCompanyModal" class="btn-primary">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuova Azienda
        </button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="company in companies" :key="company.id" class="card hover:shadow-lg transition-shadow">
        <div class="card-body">
          <!-- Company Header -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">{{ company.name }}</h3>
              <p v-if="company.description" class="mt-1 text-sm text-gray-500">{{ company.description }}</p>
            </div>
            
            <!-- Actions Dropdown -->
            <div class="relative">
              <button 
                @click="toggleDropdown(company.id)"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div 
                v-if="openDropdown === company.id" 
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <div class="py-1">
                  <button 
                    @click="editCompany(company)"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifica
                  </button>
                  
                  <button 
                    @click="selectCompany(company)"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Seleziona
                  </button>
                  
                  <div class="border-t border-gray-100"></div>
                  
                  <button 
                    @click="deleteCompany(company)"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Company Stats -->
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ getTeamsCount(company.id) }}</div>
              <div class="text-xs text-blue-600">Team</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ getEmployeesCount(company.id) }}</div>
              <div class="text-xs text-green-600">Dipendenti</div>
            </div>
          </div>

          <!-- Company Info -->
          <div class="mt-4 space-y-2 text-sm text-gray-500">
            <div v-if="company.industry" class="flex items-center">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {{ company.industry }}
            </div>
            <div v-if="company.location" class="flex items-center">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ company.location }}
            </div>
            <div class="flex items-center">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Creata {{ formatDate(company.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Modal -->
    <CompanyModal
      v-if="showCompanyModal"
      :company="selectedCompanyForEdit"
      @save="handleSaveCompany"
      @cancel="closeCompanyModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHR } from '../composables/useHRClean'
import { useRouter } from 'vue-router'
import CompanyModal from './CompanyModal.vue'

const router = useRouter()

const { 
  companies, 
  teams,
  employees,
  selectedCompany,
  setSelectedCompany,
  addCompany,
  updateCompany,
  deleteCompany: deleteCompanyAction
} = useHR()

// Modal state
const showCompanyModal = ref(false)
const selectedCompanyForEdit = ref(null)
const openDropdown = ref(null)

// Functions
const showCreateCompanyModal = () => {
  selectedCompanyForEdit.value = null
  showCompanyModal.value = true
}

const editCompany = (company) => {
  selectedCompanyForEdit.value = company
  showCompanyModal.value = true
  openDropdown.value = null
}

const selectCompany = (company) => {
  setSelectedCompany(company.id)
  openDropdown.value = null
  // Naviga ai dipendenti
  router.push('/dashboard/employees')
}

const deleteCompany = (company) => {
  if (confirm(`Sei sicuro di voler eliminare l'azienda "${company.name}"?\n\nVerranno eliminati anche:\n- Tutti i team associati\n- Tutti i dipendenti associati\n\nQuesta azione non può essere annullata.`)) {
    deleteCompanyAction(company.id)
  }
  openDropdown.value = null
}

const toggleDropdown = (companyId) => {
  openDropdown.value = openDropdown.value === companyId ? null : companyId
}

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

// Computed
const getTeamsCount = (companyId) => {
  return teams.value.filter(team => team.companyId === companyId).length
}

const getEmployeesCount = (companyId) => {
  return employees.value.filter(employee => employee.companyId === companyId).length
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('it-IT')
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
      openDropdown.value = null
    }
  }
  document.addEventListener('click', handleClickOutside)
  
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
