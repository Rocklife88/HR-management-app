<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cancel')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ employee ? 'Modifica Dipendente' : 'Nuovo Dipendente' }}
                </h3>
                
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <!-- Informazioni aziendali (obbligatorie) -->
                  <div class="sm:col-span-2">
                    <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                      <svg class="mr-2 h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      Assegnazione aziendale (campi obbligatori)
                    </h4>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Azienda *
                      <span class="text-red-500 text-xs ml-1">(obbligatorio)</span>
                    </label>
                    <select v-model="form.companyId" required class="input-field">
                      <option value="">Seleziona azienda</option>
                      <option v-for="company in companies" :key="company.id" :value="company.id">
                        {{ company.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Team *
                      <span class="text-red-500 text-xs ml-1">(obbligatorio)</span>
                    </label>
                    
                    <!-- Se non ci sono team per l'azienda selezionata -->
                    <div v-if="form.companyId && availableTeams.length === 0" class="space-y-3">
                      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div class="flex items-center">
                          <svg class="h-4 w-4 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span class="text-sm text-amber-800">Nessun team disponibile per questa azienda</span>
                        </div>
                      </div>
                      
                      <div class="flex space-x-3">
                        <select v-model="form.teamId" required class="input-field flex-1">
                          <option value="">Seleziona un'opzione</option>
                          <option value="external">🌐 Collaboratore Esterno</option>
                        </select>
                        
                        <button
                          type="button"
                          @click="openCreateTeamModal"
                          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                        >
                          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Crea Team
                        </button>
                      </div>
                    </div>
                    
                    <!-- Se ci sono team disponibili -->
                    <div v-else-if="form.companyId" class="space-y-2">
                      <select v-model="form.teamId" required class="input-field">
                        <option value="">Seleziona team</option>
                        <option value="external">🌐 Collaboratore Esterno</option>
                        <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                          {{ team.name }}
                        </option>
                      </select>
                      
                      <!-- Link per creare nuovo team quando ce ne sono già alcuni -->
                      <div class="flex justify-end">
                        <button
                          type="button"
                          @click="openCreateTeamModal"
                          class="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Crea nuovo team per {{ getCompanyName(form.companyId) }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- Se non è stata selezionata un'azienda -->
                    <div v-else>
                      <select disabled class="input-field bg-gray-100 cursor-not-allowed">
                        <option value="">Prima seleziona un'azienda</option>
                      </select>
                      <p class="text-xs text-gray-500 mt-1">
                        Seleziona prima un'azienda per vedere i team disponibili
                      </p>
                    </div>
                  </div>

                  <!-- Informazioni personali -->
                  <div class="sm:col-span-2 mt-4">
                    <h4 class="font-medium text-gray-900 mb-2">Informazioni personali</h4>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome *</label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      required
                      placeholder="es. Mario"
                      class="input-field"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Cognome *</label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      required
                      placeholder="es. Rossi"
                      class="input-field"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      v-model="form.email"
                      type="email"
                      required
                      placeholder="es. mario.rossi@azienda.com"
                      class="input-field"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Ruolo *</label>
                    <input
                      v-model="form.role"
                      type="text"
                      required
                      placeholder="es. Sviluppatore Frontend"
                      class="input-field"
                    />
                  </div>

                  <!-- Contratto -->
                  <div class="sm:col-span-2 mt-4">
                    <h4 class="font-medium text-gray-900 mb-2">Informazioni contrattuali</h4>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">CCNL</label>
                    <select v-model="form.ccnl" class="input-field">
                      <option value="">Seleziona CCNL</option>
                      <option value="CCNL Commercio">CCNL Commercio</option>
                      <option value="CCNL Metalmeccanici">CCNL Metalmeccanici</option>
                      <option value="CCNL Trasporti">CCNL Trasporti</option>
                      <option value="CCNL Terziario">CCNL Terziario</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Livello</label>
                    <select v-model="form.level" class="input-field">
                      <option value="">Seleziona livello</option>
                      <option value="1°">1°</option>
                      <option value="2°">2°</option>
                      <option value="3°">3°</option>
                      <option value="4°">4°</option>
                      <option value="5°">5°</option>
                      <option value="6°">6°</option>
                      <option value="7°">7°</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Data Assunzione *</label>
                    <input
                      v-model="form.hireDate"
                      type="date"
                      required
                      class="input-field"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo Contratto *</label>
                    <select v-model="form.contractType" required class="input-field">
                      <option value="Indeterminato">Indeterminato</option>
                      <option value="Determinato">Determinato</option>
                      <option value="Consulenza">Consulenza</option>
                      <option value="Stage">Stage</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Inizio Contratto *</label>
                    <input
                      v-model="form.contractStart"
                      type="date"
                      required
                      class="input-field"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Fine Contratto</label>
                    <input
                      v-model="form.contractEnd"
                      type="date"
                      :disabled="form.contractType === 'Indeterminato'"
                      class="input-field"
                      :class="{ 'bg-gray-100': form.contractType === 'Indeterminato' }"
                    />
                    <p v-if="form.contractType === 'Indeterminato'" class="text-xs text-gray-500 mt-1">
                      Non applicabile per contratti indeterminati
                    </p>
                  </div>

                  <!-- Scadenze e formazione -->
                  <div class="sm:col-span-2 mt-4">
                    <h4 class="font-medium text-gray-900 mb-2">Scadenze e formazione</h4>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Visita Medica</label>
                    <input
                      v-model="form.medicalVisit"
                      type="date"
                      class="input-field"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Corso Sicurezza</label>
                    <input
                      v-model="form.safetyTraining"
                      type="date"
                      class="input-field"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Residui Ferie (giorni)</label>
                    <input
                      v-model.number="form.vacationDays"
                      type="number"
                      min="0"
                      max="365"
                      class="input-field"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Stato Onboarding</label>
                    <select v-model="form.onboardingStatus" class="input-field">
                      <option value="Non iniziato">Non iniziato</option>
                      <option value="In corso">In corso</option>
                      <option value="Completato">Completato</option>
                    </select>
                  </div>

                  <!-- Checkbox -->
                  <div class="sm:col-span-2 mt-4">
                    <h4 class="font-medium text-gray-900 mb-2">Documentazione e kit</h4>
                  </div>

                  <div class="flex items-center">
                    <input
                      v-model="form.ndaSigned"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 block text-sm text-gray-900">
                      NDA firmato
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      v-model="form.kitReceived"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 block text-sm text-gray-900">
                      Kit ricevuto
                    </label>
                  </div>

                  <!-- Note -->
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Note</label>
                    <textarea
                      v-model="form.notes"
                      rows="3"
                      class="input-field"
                      placeholder="Note aggiuntive..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ employee ? 'Aggiorna' : 'Crea' }}
            </button>
            <button
              type="button"
              @click="$emit('cancel')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useHRStore } from '../stores/hr.js'
import { storeToRefs } from 'pinia'

// Usa lo store Pinia direttamente per avere sempre i dati aggiornati
const hrStore = useHRStore()
const { companies, teams } = storeToRefs(hrStore)

const props = defineProps({
  employee: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel', 'create-team'])

// Form data
const form = reactive({
  companyId: '',
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  ccnl: '',
  level: '',
  hireDate: '',
  contractStart: '',
  contractEnd: '',
  contractType: 'Indeterminato',
  medicalVisit: '',
  safetyTraining: '',
  vacationDays: 20,
  ndaSigned: false,
  kitReceived: false,
  notes: '',
  onboardingStatus: 'Non iniziato',
  teamId: '',
  photo: null
})

// Computed per filtrare i team in base all'azienda selezionata
const availableTeams = computed(() => {
  console.log('🔧 DEBUG availableTeams:', {
    formCompanyId: form.companyId,
    allTeams: teams.value,
    teamsForCompany: teams.value.filter(team => String(team.company_id) === String(form.companyId))
  })
  
  if (!form.companyId) return []
  // Converti entrambi i valori a string per il confronto
  const filtered = teams.value.filter(team => {
    const match = String(team.company_id) === String(form.companyId)
    console.log(`🔧 DEBUG team filter: ${team.name} (company_id: ${team.company_id}) vs form.companyId: ${form.companyId} = ${match}`)
    return match
  })
  
  console.log('🔧 DEBUG availableTeams result:', filtered)
  return filtered
})

// Helper per ottenere il nome dell'azienda
const getCompanyName = (companyId) => {
  console.log('🔧 DEBUG getCompanyName chiamata con:', companyId)
  console.log('🔧 DEBUG companies.value:', companies.value)
  
  if (!companyId) return 'N/A'
  
  const company = companies.value.find(c => {
    const match = String(c.id) === String(companyId)
    console.log(`🔧 DEBUG company check: ${c.name} (id: ${c.id}) vs ${companyId} = ${match}`)
    return match
  })
  
  console.log('🔧 DEBUG found company:', company)
  return company ? company.name : 'N/A'
}

// Funzione per aprire il modal di creazione team
const openCreateTeamModal = () => {
  console.log('🔧 DEBUG openCreateTeamModal chiamata!')
  console.log('🔧 DEBUG form.companyId:', form.companyId)
  console.log('🔧 DEBUG companyName:', getCompanyName(form.companyId))
  
  emit('create-team', {
    companyId: form.companyId,
    companyName: getCompanyName(form.companyId)
  })
  
  console.log('🔧 DEBUG create-team event emesso!')
}

// Auto-selezione azienda se ce n'è solo una
const autoSelectCompany = () => {
  console.log('🔍 autoSelectCompany chiamata:', {
    companiesLength: companies.value.length,
    companies: companies.value,
    currentCompanyId: form.companyId
  })
  
  if (companies.value.length === 1 && (!form.companyId || form.companyId === '')) {
    form.companyId = String(companies.value[0].id)
    console.log('✅ Auto-selezionata azienda:', companies.value[0].name)
  } else {
    console.log('❌ Auto-selezione non eseguita:', {
      hasCompanies: companies.value.length > 0,
      companiesCount: companies.value.length,
      hasCompanyId: !!form.companyId
    })
  }
}

// Watch for employee prop changes
watch(() => props.employee, (employee) => {
  if (employee) {
    Object.keys(form).forEach(key => {
      if (employee[key] !== undefined) {
        form[key] = String(employee[key]) // Converti tutto a string per consistenza
      }
    })
  } else {
    // Reset form for new employee
    Object.keys(form).forEach(key => {
      switch (key) {
        case 'contractType':
          form[key] = 'Indeterminato'
          break
        case 'vacationDays':
          form[key] = 20
          break
        case 'onboardingStatus':
          form[key] = 'Non iniziato'
          break
        case 'ndaSigned':
        case 'kitReceived':
          form[key] = false
          break
        default:
          form[key] = ''
      }
    })
    // Auto-seleziona azienda per nuovo dipendente con un piccolo delay
    setTimeout(() => {
      autoSelectCompany()
    }, 0)
  }
}, { immediate: true })

// Watch per auto-selezione quando cambiano le aziende disponibili
watch(() => companies.value, (newCompanies) => {
  console.log('🔄 Store companies changed:', newCompanies)
  autoSelectCompany()
}, { immediate: true })

// Watch per resettare il team quando cambia l'azienda
watch(() => form.companyId, () => {
  // Reset team selection when company changes
  form.teamId = ''
})

// Watch contract type to clear end date for permanent contracts
watch(() => form.contractType, (type) => {
  if (type === 'Indeterminato') {
    form.contractEnd = ''
  }
})

const handleSubmit = () => {
  // Validazione base
  if (!form.companyId) {
    alert('Seleziona un\'azienda')
    return
  }
  
  if (!form.teamId) {
    alert('Seleziona un team o specifica come collaboratore esterno')
    return
  }
  
  console.log('🔧 DEBUG handleSubmit form data:', form)
  
  const employeeData = { ...form }
  
  // Clean up data
  if (employeeData.contractType === 'Indeterminato') {
    employeeData.contractEnd = null
  }
  
  // Convert IDs to appropriate format
  if (employeeData.companyId) {
    employeeData.companyId = parseInt(employeeData.companyId)
  }
  
  if (employeeData.teamId && employeeData.teamId !== 'external') {
    employeeData.teamId = parseInt(employeeData.teamId)
  }
  
  console.log('🔧 DEBUG cleaned employeeData:', employeeData)
  
  emit('save', employeeData)
}

// ===== LIFECYCLE HOOKS =====
onMounted(() => {
  console.log('🔥 EmployeeModal MOUNTED!')
  console.log('🔧 DEBUG: Companies all\'avvio:', companies.value)
  autoSelectCompany()
})

onUnmounted(() => {
  console.log('💀 EmployeeModal UNMOUNTED!')
})
</script>

<style scoped>
.input-field {
  margin-top: 0.25rem;
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
