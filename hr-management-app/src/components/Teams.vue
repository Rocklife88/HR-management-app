<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">
          Team
          <span v-if="selectedCompany" class="text-lg text-gray-600 font-normal">
            - {{ getSelectedCompanyName() }}
          </span>
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          <span v-if="selectedCompany">
            Team dell'azienda {{ getSelectedCompanyName() }} ({{ displayedTeams.length }})
          </span>
          <span v-else>
            Gestisci i team e assegna i referenti ({{ displayedTeams.length }})
          </span>
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="showAddModal = true" class="btn-primary">
          Crea Team
        </button>
      </div>
    </div>

    <!-- Teams Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="team in displayedTeams"
        :key="team.id"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <!-- Team Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                :style="{ backgroundColor: team.color }"
              >
                {{ team.name.charAt(0) }}
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-gray-900">{{ team.name }}</h3>
                <p class="text-sm text-gray-500">{{ team.description }}</p>
                <!-- Mostra azienda solo se non c'è una selezione specifica -->
                <p v-if="!selectedCompany" class="text-xs text-gray-400 mt-1">
                  📋 {{ getCompanyName(team.company_id) }}
                </p>
              </div>
            </div>
            <div class="flex space-x-1">
              <button @click="editTeam(team)" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="deleteTeamConfirm(team)" class="text-gray-400 hover:text-red-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Supervisore -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Supervisore</h4>
            <div v-if="team.supervisor" class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span class="text-xs font-medium text-white">
                  {{ getInitials(team.supervisor.split(' ')[0] || 'N', team.supervisor.split(' ')[1] || 'A') }}
                </span>
              </div>
              <div class="ml-2">
                <div class="text-sm font-medium text-gray-900">
                  {{ team.supervisor }}
                </div>
                <div class="text-xs text-gray-500">Supervisore del team</div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">Nessun supervisore assegnato</div>
          </div>

          <!-- Team Members -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Membri del team</h4>
            <div class="space-y-1">
              <div
                v-for="member in getTeamMembers(team.id)"
                :key="member.id"
                class="flex items-center text-sm"
              >
                <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                  <span class="text-xs font-medium text-gray-700">
                    {{ getInitials(member.firstName, member.lastName) }}
                  </span>
                </div>
                <span class="text-gray-900">{{ member.firstName }} {{ member.lastName }}</span>
                <span class="text-gray-500 ml-1">({{ member.role }})</span>
              </div>
              <div v-if="getTeamMembers(team.id).length === 0" class="text-sm text-gray-400 italic">
                Nessun membro assegnato
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between text-sm text-gray-600">
              <span>{{ getTeamMembers(team.id).length }} membri</span>
              <span>{{ getTeamActiveContracts(team.id) }} contratti attivi</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="teams.length === 0" class="col-span-3">
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nessun team</h3>
          <p class="mt-1 text-sm text-gray-500">Inizia creando il primo team per organizzare i tuoi dipendenti.</p>
          <div class="mt-6">
            <button @click="showAddModal = true" class="btn-primary">
              Crea il primo team
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Modal -->
    <TeamModal
      v-if="showAddModal || showEditModal"
      :team="selectedTeam"
      @save="handleSaveTeam"
      @cancel="closeModals"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHRStore } from '../stores/hr.js'
import { storeToRefs } from 'pinia'

// We'll need to create TeamModal
import TeamModal from './TeamModal.vue'

// Usa lo store Pinia
const hrStore = useHRStore()

// Destrutturazione reattiva delle proprietà reattive
const {
  companies,
  teams,
  employees,
  selectedCompany,
  filteredTeams: storeFilteredTeams
} = storeToRefs(hrStore)

// Destrutturazione delle azioni
const {
  addTeam,
  updateTeam,
  deleteTeam
} = hrStore

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedTeam = ref(null)

// Computed per i team da visualizzare
const displayedTeams = computed(() => {
  // Se c'è un'azienda selezionata, usa i team filtrati dallo store
  return selectedCompany.value ? storeFilteredTeams.value : teams.value
})

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

// Methods
const getInitials = (firstName, lastName) => {
  return (firstName[0] + lastName[0]).toUpperCase()
}

const getTeamMembers = (teamId) => {
  return employees.value.filter(emp => emp.team_id === teamId)
}

const getTeamActiveContracts = (teamId) => {
  const members = getTeamMembers(teamId)
  const today = new Date().toISOString().split('T')[0]
  
  return members.filter(member => {
    if (member.contractType === 'Indeterminato') return true
    if (!member.contractEnd) return true
    return member.contractEnd > today
  }).length
}

const editTeam = (team) => {
  selectedTeam.value = { ...team }
  showEditModal.value = true
}

const deleteTeamConfirm = (team) => {
  const memberCount = getTeamMembers(team.id).length
  
  let message = `Sei sicuro di voler eliminare il team "${team.name}"?`
  if (memberCount > 0) {
    message += `\n\nAttenzione: ci sono ${memberCount} dipendenti assegnati a questo team. Verranno rimossi dal team.`
  }
  
  if (confirm(message)) {
    deleteTeam(team.id)
  }
}

const handleSaveTeam = async (teamData) => {
  try {
    if (selectedTeam.value?.id) {
      await updateTeam(selectedTeam.value.id, teamData)
      console.log('✅ Team aggiornato con successo')
    } else {
      await addTeam(teamData)
      console.log('✅ Team creato con successo')
    }
    closeModals()
  } catch (err) {
    console.error('❌ Errore nel salvataggio team:', err)
    alert('Errore nel salvataggio: ' + err.message)
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedTeam.value = null
}
</script>
