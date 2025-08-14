<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Meeting HR</h1>
        <p class="mt-2 text-sm text-gray-700">
          Gestisci appuntamenti e note per dipendenti e team
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="showAddModal = true" class="btn-primary">
          Nuovo Meeting
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Tipo</label>
          <select v-model="filters.type" class="input-field">
            <option value="">Tutti i tipi</option>
            <option value="individual">Individuale</option>
            <option value="team">Team</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Stato</label>
          <select v-model="filters.status" class="input-field">
            <option value="">Tutti gli stati</option>
            <option value="scheduled">Programmato</option>
            <option value="completed">Completato</option>
            <option value="cancelled">Annullato</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mese</label>
          <input
            v-model="filters.month"
            type="month"
            class="input-field"
          />
        </div>
      </div>
    </div>

    <!-- Calendar View Toggle -->
    <div class="flex justify-between items-center">
      <div class="text-sm text-gray-500">
        Mostrando {{ filteredMeetings.length }} meeting
      </div>
      <div class="flex space-x-2">
        <button
          @click="viewMode = 'list'"
          :class="['px-3 py-1 rounded text-sm font-medium', viewMode === 'list' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-700']"
        >
          Lista
        </button>
        <button
          @click="viewMode = 'calendar'"
          :class="['px-3 py-1 rounded text-sm font-medium', viewMode === 'calendar' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-700']"
        >
          Calendario
        </button>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li
          v-for="meeting in filteredMeetings"
          :key="meeting.id"
          class="hover:bg-gray-50"
        >
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div
                    :class="['w-3 h-3 rounded-full', getStatusColor(meeting.status)]"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-3">
                    <h3 class="text-sm font-medium text-gray-900 truncate">
                      {{ meeting.title }}
                    </h3>
                    <span
                      :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                               meeting.type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800']"
                    >
                      {{ meeting.type === 'individual' ? 'Individuale' : 'Team' }}
                    </span>
                  </div>
                  <div class="mt-1 flex items-center text-sm text-gray-500">
                    <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDateTime(meeting.dateTime) }}
                    
                    <svg class="flex-shrink-0 ml-6 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ getParticipantNames(meeting) }}
                  </div>
                  
                  <div v-if="meeting.notes" class="mt-2 text-sm text-gray-600">
                    {{ meeting.notes.length > 100 ? meeting.notes.substring(0, 100) + '...' : meeting.notes }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="editMeeting(meeting)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteMeetingConfirm(meeting)"
                  class="text-gray-400 hover:text-red-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- Empty State -->
      <div v-if="filteredMeetings.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nessun meeting</h3>
        <p class="mt-1 text-sm text-gray-500">Inizia programmando il primo meeting HR.</p>
        <div class="mt-6">
          <button @click="showAddModal = true" class="btn-primary">
            Programma meeting
          </button>
        </div>
      </div>
    </div>

    <!-- Simple Calendar View -->
    <div v-else class="bg-white shadow rounded-lg p-6">
      <div class="text-center text-sm text-gray-500 py-8">
        <p>Vista calendario semplificata</p>
        <p class="mt-2">Meeting programmati per il mese corrente:</p>
        
        <div class="mt-4 space-y-2">
          <div
            v-for="meeting in upcomingMeetings"
            :key="meeting.id"
            class="flex justify-between items-center p-3 bg-gray-50 rounded"
          >
            <div>
              <div class="font-medium">{{ meeting.title }}</div>
              <div class="text-xs text-gray-500">{{ formatDateTime(meeting.dateTime) }}</div>
            </div>
            <span :class="['px-2 py-1 rounded text-xs', getStatusColor(meeting.status)]">
              {{ getStatusLabel(meeting.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Meeting Modal -->
    <MeetingModal
      v-if="showAddModal || showEditModal"
      :meeting="selectedMeeting"
      :employees="employees"
      :teams="teams"
      @save="handleSaveMeeting"
      @cancel="closeModals"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHR } from '../composables/useHR'

// We'll need to create MeetingModal
import MeetingModal from './MeetingModal.vue'

const {
  meetings,
  employees,
  teams,
  addMeeting,
  updateMeeting,
  deleteMeeting
} = useHR()

// State
const viewMode = ref('list')
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedMeeting = ref(null)

// Filters
const filters = ref({
  type: '',
  status: '',
  month: new Date().toISOString().substr(0, 7) // Current month
})

// Computed
const filteredMeetings = computed(() => {
  let result = meetings.value

  if (filters.value.type) {
    result = result.filter(m => m.type === filters.value.type)
  }

  if (filters.value.status) {
    result = result.filter(m => m.status === filters.value.status)
  }

  if (filters.value.month) {
    result = result.filter(m => m.dateTime.startsWith(filters.value.month))
  }

  return result.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
})

const upcomingMeetings = computed(() => {
  const now = new Date()
  return meetings.value
    .filter(m => new Date(m.dateTime) >= now)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 5)
})

// Methods
const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'scheduled': return 'Programmato'
    case 'completed': return 'Completato'
    case 'cancelled': return 'Annullato'
    default: return 'Sconosciuto'
  }
}

const getParticipantNames = (meeting) => {
  if (meeting.type === 'team') {
    const team = teams.value.find(t => t.id === meeting.teamId)
    return team ? team.name : 'Team non trovato'
  } else {
    const employee = employees.value.find(e => e.id === meeting.employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Dipendente non trovato'
  }
}

const editMeeting = (meeting) => {
  selectedMeeting.value = { ...meeting }
  showEditModal.value = true
}

const deleteMeetingConfirm = (meeting) => {
  if (confirm(`Sei sicuro di voler eliminare il meeting "${meeting.title}"?`)) {
    deleteMeeting(meeting.id)
  }
}

const handleSaveMeeting = (meetingData) => {
  if (selectedMeeting.value?.id) {
    updateMeeting(selectedMeeting.value.id, meetingData)
  } else {
    addMeeting(meetingData)
  }
  closeModals()
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedMeeting.value = null
}
</script>
