import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

const employees = ref([])
const teams = ref([])
const meetings = ref([])
const loading = ref(false)
const error = ref(null)

export function useHR() {
  // Carica i dati dal JSON
  const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch('/employees.json')
      const data = await response.json()
      
      employees.value = data.employees || []
      teams.value = data.teams || []
      meetings.value = data.meetings || []
      
      // Carica i dati salvati localmente se esistono
      const storedEmployees = localStorage.getItem('hr_employees')
      const storedTeams = localStorage.getItem('hr_teams')
      const storedMeetings = localStorage.getItem('hr_meetings')
      
      if (storedEmployees) {
        employees.value = JSON.parse(storedEmployees)
      }
      if (storedTeams) {
        teams.value = JSON.parse(storedTeams)
      }
      if (storedMeetings) {
        meetings.value = JSON.parse(storedMeetings)
      }
      
    } catch (err) {
      error.value = 'Errore nel caricamento dei dati'
      console.error('Data loading error:', err)
    } finally {
      loading.value = false
    }
  }

  // Salva i dati localmente
  const saveData = () => {
    localStorage.setItem('hr_employees', JSON.stringify(employees.value))
    localStorage.setItem('hr_teams', JSON.stringify(teams.value))
    localStorage.setItem('hr_meetings', JSON.stringify(meetings.value))
  }

  // Utility per calcolare giorni di differenza
  const daysDiff = (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
  }

  // Filtri per identificare situazioni critiche
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

  // Computed per dipendenti con filtri
  const filteredEmployees = computed(() => {
    return employees.value.map(employee => ({
      ...employee,
      statuses: getEmployeeStatus(employee),
      team: teams.value.find(t => t.id === employee.teamId)
    }))
  })

  // CRUD Operations per Dipendenti
  const addEmployee = (employee) => {
    const newEmployee = {
      ...employee,
      id: Math.max(0, ...employees.value.map(e => e.id)) + 1,
    }
    employees.value.push(newEmployee)
    saveData()
    return newEmployee
  }

  const updateEmployee = (id, updates) => {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...updates }
      saveData()
      return employees.value[index]
    }
    return null
  }

  const deleteEmployee = (id) => {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
      saveData()
      return true
    }
    return false
  }

  // CRUD Operations per Teams
  const addTeam = (team) => {
    const newTeam = {
      ...team,
      id: Math.max(0, ...teams.value.map(t => t.id)) + 1,
    }
    teams.value.push(newTeam)
    saveData()
    return newTeam
  }

  const updateTeam = (id, updates) => {
    const index = teams.value.findIndex(t => t.id === id)
    if (index !== -1) {
      teams.value[index] = { ...teams.value[index], ...updates }
      saveData()
      return teams.value[index]
    }
    return null
  }

  const deleteTeam = (id) => {
    const index = teams.value.findIndex(t => t.id === id)
    if (index !== -1) {
      teams.value.splice(index, 1)
      saveData()
      return true
    }
    return false
  }

  // CRUD Operations per Meetings
  const addMeeting = (meeting) => {
    const newMeeting = {
      ...meeting,
      id: Math.max(0, ...meetings.value.map(m => m.id)) + 1,
      createdAt: new Date().toISOString()
    }
    meetings.value.push(newMeeting)
    saveData()
    return newMeeting
  }

  const updateMeeting = (id, updates) => {
    const index = meetings.value.findIndex(m => m.id === id)
    if (index !== -1) {
      meetings.value[index] = { ...meetings.value[index], ...updates }
      saveData()
      return meetings.value[index]
    }
    return null
  }

  const deleteMeeting = (id) => {
    const index = meetings.value.findIndex(m => m.id === id)
    if (index !== -1) {
      meetings.value.splice(index, 1)
      saveData()
      return true
    }
    return false
  }

  // Export to Excel
  const exportToExcel = (data, filename = 'hr-export') => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  // Import from JSON
  const importFromJSON = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      
      if (data.employees) employees.value = data.employees
      if (data.teams) teams.value = data.teams
      if (data.meetings) meetings.value = data.meetings
      
      saveData()
      return true
    } catch (err) {
      console.error('Import error:', err)
      return false
    }
  }

  return {
    // State
    employees,
    teams,
    meetings,
    filteredEmployees,
    loading,
    error,
    
    // Actions
    loadData,
    saveData,
    
    // Employee CRUD
    addEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Team CRUD
    addTeam,
    updateTeam,
    deleteTeam,
    
    // Meeting CRUD
    addMeeting,
    updateMeeting,
    deleteMeeting,
    
    // Utilities
    getEmployeeStatus,
    exportToExcel,
    importFromJSON
  }
}
