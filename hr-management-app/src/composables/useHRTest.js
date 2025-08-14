import { ref, computed } from 'vue'

const employees = ref([])
const teams = ref([])
const meetings = ref([])
const companies = ref([])
const selectedCompany = ref(null)
const loading = ref(false)
const error = ref(null)

export function useHR() {
  // Versione semplificata per test - dati hardcoded con supporto multi-azienda
  const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simuliamo un caricamento
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Aziende
      companies.value = [
        {
          id: 1,
          name: "Move Solutions",
          fullName: "Move Solutions S.r.l.",
          address: "Via Roma 123, Milano",
          taxCode: "12345678901",
          vatNumber: "IT12345678901"
        },
        {
          id: 2,
          name: "Move X",
          fullName: "Move X S.r.l.",
          address: "Via Torino 456, Milano", 
          taxCode: "09876543210",
          vatNumber: "IT09876543210"
        }
      ]
      
      // Dati di test hardcoded con più dipendenti per testare filtri e raggruppamento
      employees.value = [
        // Move Solutions dipendenti
        {
          id: 1,
          firstName: "Mario",
          lastName: "Rossi", 
          email: "mario.rossi@movesolutions.it",
          role: "Senior Developer",
          teamId: 1,
          companyId: 1,
          contractType: "Indeterminato",
          contractStart: "2023-01-01",
          contractEnd: null,
          onboardingStatus: "Completato",
          ndaSigned: true,
          kitReceived: true,
          vacationDays: 15
        },
        {
          id: 2,
          firstName: "Laura",
          lastName: "Bianchi",
          email: "laura.bianchi@movesolutions.it", 
          role: "UI/UX Designer",
          teamId: 2,
          companyId: 1,
          contractType: "Determinato",
          contractStart: "2023-06-01",
          contractEnd: "2024-12-31",
          onboardingStatus: "In corso",
          ndaSigned: true,
          kitReceived: false,
          vacationDays: 8
        },
        {
          id: 3,
          firstName: "Giuseppe",
          lastName: "Verdi",
          email: "giuseppe.verdi@movesolutions.it",
          role: "DevOps Engineer",
          teamId: 1,
          companyId: 1,
          contractType: "Consulenza",
          contractStart: "2024-01-15",
          contractEnd: "2024-12-15",
          onboardingStatus: "Completato",
          ndaSigned: true,
          kitReceived: true,
          vacationDays: 12
        },
        // Move X dipendenti
        {
          id: 4,
          firstName: "Francesca",
          lastName: "Romano",
          email: "francesca.romano@movex.it",
          role: "Project Manager",
          teamId: 3,
          companyId: 2,
          contractType: "Indeterminato",
          contractStart: "2022-03-01",
          contractEnd: null,
          onboardingStatus: "Completato",
          ndaSigned: true,
          kitReceived: true,
          vacationDays: 20
        },
        {
          id: 5,
          firstName: "Andrea",
          lastName: "Ferrari",
          email: "andrea.ferrari@movex.it",
          role: "Junior Developer",
          teamId: 4,
          companyId: 2,
          contractType: "Stage",
          contractStart: "2024-09-01",
          contractEnd: "2025-02-28",
          onboardingStatus: "In corso",
          ndaSigned: false,
          kitReceived: false,
          vacationDays: 0
        },
        {
          id: 6,
          firstName: "Elena",
          lastName: "Conti",
          email: "elena.conti@movex.it",
          role: "Marketing Specialist",
          teamId: 5,
          companyId: 2,
          contractType: "Determinato",
          contractStart: "2024-01-01",
          contractEnd: "2024-12-31",
          onboardingStatus: "Non iniziato",
          ndaSigned: false,
          kitReceived: false,
          vacationDays: 0
        }
      ]
      
      teams.value = [
        // Move Solutions teams
        { id: 1, name: "Dev Team Solutions", lead: "Mario Rossi", description: "Sviluppo prodotti digitali", companyId: 1 },
        { id: 2, name: "Design Team Solutions", lead: "Laura Bianchi", description: "Design e UX", companyId: 1 },
        // Move X teams  
        { id: 3, name: "Management Team X", lead: "Francesca Romano", description: "Gestione progetti", companyId: 2 },
        { id: 4, name: "Dev Team X", lead: "Andrea Ferrari", description: "Sviluppo mobile", companyId: 2 },
        { id: 5, name: "Marketing Team X", lead: "Elena Conti", description: "Marketing e comunicazione", companyId: 2 }
      ]
      
      console.log('Test data loaded successfully!')
      console.log('Employees:', employees.value)
      console.log('Teams:', teams.value)
      
    } catch (err) {
      error.value = 'Errore nel caricamento dei dati di test'
      console.error('Test data loading error:', err)
    } finally {
      loading.value = false
    }
  }

  // Funzioni CRUD semplificate per test
  const addEmployee = (employee) => {
    console.log('Add employee called:', employee)
    return employee
  }

  const updateEmployee = (id, updates) => {
    console.log('Update employee called:', id, updates)
    return true
  }

  const deleteEmployee = (id) => {
    console.log('Delete employee called:', id)
    return true
  }

  // Company CRUD functions
  const addCompany = (companyData) => {
    const newCompany = {
      ...companyData,
      id: Math.max(0, ...companies.value.map(c => c.id)) + 1
    }
    companies.value.push(newCompany)
    console.log('Company added:', newCompany)
    return newCompany
  }

  const updateCompany = (id, updates) => {
    const index = companies.value.findIndex(company => company.id === id)
    if (index !== -1) {
      companies.value[index] = { ...companies.value[index], ...updates }
      console.log('Company updated:', companies.value[index])
      return companies.value[index]
    }
    return null
  }

  const deleteCompany = (id) => {
    const index = companies.value.findIndex(company => company.id === id)
    if (index !== -1) {
      companies.value.splice(index, 1)
      // Also remove related employees and teams
      employees.value = employees.value.filter(emp => emp.companyId !== id)
      teams.value = teams.value.filter(team => team.companyId !== id)
      console.log('Company deleted and related data cleaned up')
      return true
    }
    return false
  }

  // Team CRUD functions
  const addTeam = (teamData) => {
    const newTeam = {
      ...teamData,
      id: Math.max(0, ...teams.value.map(t => t.id)) + 1
    }
    
    // Set lead name from employee if leadId is provided
    if (newTeam.leadId) {
      const leader = employees.value.find(emp => emp.id === newTeam.leadId)
      if (leader) {
        newTeam.lead = `${leader.firstName} ${leader.lastName}`
      }
    }
    
    teams.value.push(newTeam)
    console.log('Team added:', newTeam)
    return newTeam
  }

  const updateTeam = (id, updates) => {
    const index = teams.value.findIndex(team => team.id === id)
    if (index !== -1) {
      const updatedTeam = { ...teams.value[index], ...updates }
      
      // Update lead name from employee if leadId is provided
      if (updatedTeam.leadId) {
        const leader = employees.value.find(emp => emp.id === updatedTeam.leadId)
        if (leader) {
          updatedTeam.lead = `${leader.firstName} ${leader.lastName}`
        }
      } else {
        updatedTeam.lead = ''
      }
      
      teams.value[index] = updatedTeam
      console.log('Team updated:', teams.value[index])
      return teams.value[index]
    }
    return null
  }

  const deleteTeam = (id) => {
    const index = teams.value.findIndex(team => team.id === id)
    if (index !== -1) {
      teams.value.splice(index, 1)
      // Remove team assignment from employees
      employees.value.forEach(emp => {
        if (emp.teamId === id) {
          emp.teamId = null
        }
      })
      console.log('Team deleted and employee assignments updated')
      return true
    }
    return false
  }

  const exportToExcel = (data, filename) => {
    console.log('Export called:', filename, data.length, 'records')
  }

  const importFromJSON = (jsonData) => {
    console.log('Import called:', jsonData)
    return true
  }

  // Computed properties per filtrare per azienda
  const filteredEmployeesByCompany = computed(() => {
    if (!selectedCompany.value) return employees.value
    return employees.value.filter(emp => emp.companyId === selectedCompany.value)
  })

  const filteredTeamsByCompany = computed(() => {
    if (!selectedCompany.value) return teams.value
    return teams.value.filter(team => team.companyId === selectedCompany.value)
  })

  // Funzione per cambiare azienda
  const setSelectedCompany = (companyId) => {
    selectedCompany.value = companyId
    console.log('Selected company changed to:', companyId)
  }

  const getCompanyName = (companyId) => {
    const company = companies.value.find(c => c.id === companyId)
    return company ? company.name : 'N/A'
  }

  return {
    employees,
    teams,
    meetings,
    companies,
    selectedCompany,
    filteredEmployeesByCompany,
    filteredTeamsByCompany,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadData,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addCompany,
    updateCompany,
    deleteCompany,
    addTeam,
    updateTeam,
    deleteTeam,
    exportToExcel,
    importFromJSON,
    setSelectedCompany,
    getCompanyName
  }
}
