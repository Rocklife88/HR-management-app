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
                  {{ meeting ? 'Modifica Meeting' : 'Nuovo Meeting' }}
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Titolo</label>
                    <input
                      v-model="form.title"
                      type="text"
                      required
                      class="input-field"
                      placeholder="es. One-on-One mensile"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo Meeting</label>
                    <select v-model="form.type" required class="input-field" @change="clearParticipants">
                      <option value="">Seleziona tipo</option>
                      <option value="individual">Individuale (con dipendente)</option>
                      <option value="team">Team (con gruppo)</option>
                    </select>
                  </div>

                  <!-- Participant Selection based on type -->
                  <div v-if="form.type === 'individual'">
                    <label class="block text-sm font-medium text-gray-700">Dipendente</label>
                    <select v-model="form.employeeId" required class="input-field">
                      <option value="">Seleziona dipendente</option>
                      <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                        {{ employee.firstName }} {{ employee.lastName }} - {{ employee.role }}
                      </option>
                    </select>
                  </div>

                  <div v-if="form.type === 'team'">
                    <label class="block text-sm font-medium text-gray-700">Team</label>
                    <select v-model="form.teamId" required class="input-field">
                      <option value="">Seleziona team</option>
                      <option v-for="team in teams" :key="team.id" :value="team.id">
                        {{ team.name }} ({{ getTeamMemberCount(team.id) }} membri)
                      </option>
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Data</label>
                      <input
                        v-model="form.date"
                        type="date"
                        required
                        class="input-field"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Ora</label>
                      <input
                        v-model="form.time"
                        type="time"
                        required
                        class="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Durata (minuti)</label>
                    <select v-model="form.duration" class="input-field">
                      <option value="30">30 minuti</option>
                      <option value="60">1 ora</option>
                      <option value="90">1.5 ore</option>
                      <option value="120">2 ore</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Stato</label>
                    <select v-model="form.status" required class="input-field">
                      <option value="scheduled">Programmato</option>
                      <option value="completed">Completato</option>
                      <option value="cancelled">Annullato</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Argomenti/Obiettivi</label>
                    <textarea
                      v-model="form.agenda"
                      rows="3"
                      class="input-field"
                      placeholder="Punti da discutere, obiettivi del meeting..."
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Note</label>
                    <textarea
                      v-model="form.notes"
                      rows="4"
                      class="input-field"
                      placeholder="Note del meeting, feedback, azioni da intraprendere..."
                    ></textarea>
                  </div>

                  <!-- Meeting Summary -->
                  <div v-if="form.title && form.type" class="border-t pt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Riepilogo</label>
                    <div class="bg-gray-50 p-3 rounded text-sm">
                      <div><strong>{{ form.title }}</strong></div>
                      <div class="text-gray-600 mt-1">
                        {{ form.type === 'individual' ? 'Meeting individuale' : 'Meeting di team' }}
                        {{ form.date && form.time ? ` - ${formatDate(form.date)} alle ${form.time}` : '' }}
                      </div>
                      <div v-if="form.duration" class="text-gray-600">
                        Durata: {{ form.duration }} minuti
                      </div>
                      <div v-if="getParticipantPreview()" class="text-gray-600">
                        Con: {{ getParticipantPreview() }}
                      </div>
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
              {{ meeting ? 'Aggiorna' : 'Crea' }}
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
import { reactive, watch, computed } from 'vue'

const props = defineProps({
  meeting: {
    type: Object,
    default: null
  },
  employees: {
    type: Array,
    default: () => []
  },
  teams: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

// Form data
const form = reactive({
  title: '',
  type: '',
  employeeId: null,
  teamId: null,
  date: '',
  time: '',
  duration: '60',
  status: 'scheduled',
  agenda: '',
  notes: ''
})

// Watch for meeting prop changes
watch(() => props.meeting, (meeting) => {
  if (meeting) {
    form.title = meeting.title || ''
    form.type = meeting.type || ''
    form.employeeId = meeting.employeeId || null
    form.teamId = meeting.teamId || null
    form.duration = meeting.duration || '60'
    form.status = meeting.status || 'scheduled'
    form.agenda = meeting.agenda || ''
    form.notes = meeting.notes || ''
    
    // Parse dateTime if exists
    if (meeting.dateTime) {
      const dateTime = new Date(meeting.dateTime)
      form.date = dateTime.toISOString().split('T')[0]
      form.time = dateTime.toTimeString().substr(0, 5)
    }
  } else {
    // Reset form for new meeting
    Object.keys(form).forEach(key => {
      switch (key) {
        case 'duration':
          form[key] = '60'
          break
        case 'status':
          form[key] = 'scheduled'
          break
        case 'employeeId':
        case 'teamId':
          form[key] = null
          break
        case 'date':
          // Set default to today
          form[key] = new Date().toISOString().split('T')[0]
          break
        case 'time':
          // Set default to current hour
          const now = new Date()
          form[key] = `${now.getHours().toString().padStart(2, '0')}:00`
          break
        default:
          form[key] = ''
      }
    })
  }
}, { immediate: true })

// Methods
const clearParticipants = () => {
  form.employeeId = null
  form.teamId = null
}

const getTeamMemberCount = (teamId) => {
  return props.employees.filter(emp => emp.teamId === teamId).length
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT')
}

const getParticipantPreview = () => {
  if (form.type === 'individual' && form.employeeId) {
    const employee = props.employees.find(e => e.id === parseInt(form.employeeId))
    return employee ? `${employee.firstName} ${employee.lastName}` : ''
  } else if (form.type === 'team' && form.teamId) {
    const team = props.teams.find(t => t.id === parseInt(form.teamId))
    return team ? team.name : ''
  }
  return ''
}

const handleSubmit = () => {
  const meetingData = { ...form }
  
  // Combine date and time into dateTime
  if (meetingData.date && meetingData.time) {
    meetingData.dateTime = `${meetingData.date}T${meetingData.time}:00`
  }
  
  // Clean up unused fields
  delete meetingData.date
  delete meetingData.time
  
  // Convert IDs to numbers
  if (meetingData.employeeId) {
    meetingData.employeeId = parseInt(meetingData.employeeId)
  }
  if (meetingData.teamId) {
    meetingData.teamId = parseInt(meetingData.teamId)
  }
  
  // Convert duration to number
  meetingData.duration = parseInt(meetingData.duration)
  
  emit('save', meetingData)
}
</script>
