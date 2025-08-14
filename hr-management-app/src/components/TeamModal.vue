<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cancel')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ team ? 'Modifica Team' : 'Nuovo Team' }}
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome Team *</label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      placeholder="es. Team Sviluppo"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Azienda *</label>
                    <select v-model="form.companyId" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Seleziona azienda</option>
                      <option v-for="company in companies" :key="company.id" :value="company.id">
                        {{ company.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Supervisore</label>
                    <input
                      v-model="form.supervisor"
                      type="text"
                      placeholder="es. Mario Rossi"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p class="mt-1 text-sm text-gray-500">Nome e cognome del supervisore del team</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Descrizione</label>
                    <textarea
                      v-model="form.description"
                      rows="3"
                      placeholder="es. Team dedicato allo sviluppo dei prodotti digitali"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Budget Annuale (€)</label>
                    <input
                      v-model.number="form.budget"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="es. 150000"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Data Creazione</label>
                      <input
                        v-model="form.createdDate"
                        type="date"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Stato</label>
                      <select v-model="form.status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                        <option value="Attivo">Attivo</option>
                        <option value="In Pausa">In Pausa</option>
                        <option value="Archiviato">Archiviato</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ team ? 'Aggiorna' : 'Crea Team' }}
            </button>
            <button
              type="button"
              @click="$emit('cancel')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
import { reactive, computed, watch } from 'vue'
import { useHRStore } from '../stores/hr.js'
import { storeToRefs } from 'pinia'

// Usa lo store Pinia direttamente
const hrStore = useHRStore()
const { companies, employees } = storeToRefs(hrStore)

const props = defineProps({
  team: {
    type: Object,
    default: null
  },
  companyId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

// Form data
const form = reactive({
  name: '',
  companyId: null,
  supervisor: '',
  description: '',
  budget: null,
  createdDate: new Date().toISOString().split('T')[0],
  status: 'Attivo'
})

// Watch for team prop changes
watch(() => props.team, (team) => {
  console.log('🔧 DEBUG TeamModal: team prop changed:', team)
  console.log('🔧 DEBUG TeamModal: companyId prop:', props.companyId)
  
  if (team) {
    Object.keys(form).forEach(key => {
      if (team[key] !== undefined) {
        form[key] = team[key]
      }
    })
  } else {
    // Reset form for new team
    Object.keys(form).forEach(key => {
      switch (key) {
        case 'createdDate':
          form[key] = new Date().toISOString().split('T')[0]
          break
        case 'status':
          form[key] = 'Attivo'
          break
        case 'companyId':
          // Se è stato passato companyId come prop, usalo
          form[key] = props.companyId ? parseInt(props.companyId) : null
          break
        case 'budget':
          form[key] = null
          break
        default:
          form[key] = ''
      }
    })
  }
}, { immediate: true })

const handleSubmit = () => {
  const teamData = { ...form }
  
  // Convert company ID to number
  if (teamData.companyId) teamData.companyId = parseInt(teamData.companyId)
  
  console.log('🚀 TeamModal - Invio dati team:', teamData)
  
  emit('save', teamData)
}
</script>