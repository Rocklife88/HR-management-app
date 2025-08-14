import { ref, computed } from 'vue'
import { supabase, testConnection } from '../lib/supabase.js'

const companies = ref([])
const teams = ref([])
const employees = ref([])
const selectedCompany = ref(null)
const loading = ref(false)
const error = ref(null)

export function useHR() {
  const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Test connessione
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error('Impossibile connettersi al database')
      }

      // Carica aziende
      console.log('🔍 Caricamento aziende...')
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (companiesError) {
        console.error('❌ Errore caricamento aziende:', companiesError)
        throw companiesError
      }
      
      console.log('📊 Aziende caricate:', companiesData)
      companies.value = companiesData || []
      console.log('✅ companies.value aggiornato:', companies.value)

      // Carica team
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (teamsError) throw teamsError
      teams.value = teamsData || []

      // Carica dipendenti
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (employeesError) throw employeesError
      employees.value = employeesData || []

      console.log('✅ Dati caricati da Supabase:', {
        companies: companies.value.length,
        teams: teams.value.length,
        employees: employees.value.length
      })

      loading.value = false
    } catch (err) {
      console.error('❌ Errore nel caricamento:', err)
      error.value = err.message
      loading.value = false
    }
  }

  const setSelectedCompany = (companyId) => {
    selectedCompany.value = companyId
    console.log('Azienda selezionata:', companyId)
  }

  // Company CRUD
  const addCompany = async (companyData) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single()
      
      if (error) throw error
      
      companies.value.unshift(data)
      console.log('✅ Azienda aggiunta:', data)
      return data
    } catch (err) {
      console.error('❌ Errore aggiunta azienda:', err)
      throw err
    }
  }

  const updateCompany = async (id, companyData) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const index = companies.value.findIndex(c => c.id === id)
      if (index !== -1) {
        companies.value[index] = data
      }
      console.log('✅ Azienda aggiornata:', data)
      return data
    } catch (err) {
      console.error('❌ Errore aggiornamento azienda:', err)
      throw err
    }
  }

  const deleteCompany = async (id) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      const index = companies.value.findIndex(c => c.id === id)
      if (index !== -1) {
        companies.value.splice(index, 1)
        
        // Se l'azienda eliminata era selezionata, deseleziona
        if (selectedCompany.value === id) {
          selectedCompany.value = null
        }
        
        console.log('✅ Azienda eliminata:', id)
      }
    } catch (err) {
      console.error('❌ Errore eliminazione azienda:', err)
      throw err
    }
  }

  // Team CRUD
  const addTeam = async (teamData) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: teamData.name,
          description: teamData.description,
          company_id: teamData.companyId
        }])
        .select()
        .single()
      
      if (error) throw error
      
      teams.value.unshift(data)
      console.log('✅ Team aggiunto:', data)
      return data
    } catch (err) {
      console.error('❌ Errore aggiunta team:', err)
      throw err
    }
  }

  const updateTeam = async (id, teamData) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          name: teamData.name,
          description: teamData.description,
          company_id: teamData.companyId
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const index = teams.value.findIndex(t => t.id === id)
      if (index !== -1) {
        teams.value[index] = data
      }
      console.log('✅ Team aggiornato:', data)
      return data
    } catch (err) {
      console.error('❌ Errore aggiornamento team:', err)
      throw err
    }
  }

  const deleteTeam = async (id) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      const index = teams.value.findIndex(t => t.id === id)
      if (index !== -1) {
        teams.value.splice(index, 1)
        console.log('✅ Team eliminato:', id)
      }
    } catch (err) {
      console.error('❌ Errore eliminazione team:', err)
      throw err
    }
  }

  // Employee CRUD
  const addEmployee = async (employeeData) => {
    try {
      // Gestione team esterno
      if (employeeData.teamId === 'external') {
        employeeData.teamId = null
      }

      const { data, error } = await supabase
        .from('employees')
        .insert([{
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email,
          role: employeeData.role,
          company_id: employeeData.companyId,
          team_id: employeeData.teamId,
          ccnl: employeeData.ccnl,
          level: employeeData.level,
          hire_date: employeeData.hireDate,
          contract_type: employeeData.contractType,
          contract_start: employeeData.contractStart,
          contract_end: employeeData.contractEnd,
          medical_visit: employeeData.medicalVisit,
          safety_training: employeeData.safetyTraining,
          vacation_days: employeeData.vacationDays,
          nda_signed: employeeData.ndaSigned,
          kit_received: employeeData.kitReceived,
          notes: employeeData.notes,
          onboarding_status: employeeData.onboardingStatus
        }])
        .select()
        .single()
      
      if (error) throw error
      
      employees.value.unshift(data)
      console.log('✅ Dipendente aggiunto:', data)
      return data
    } catch (err) {
      console.error('❌ Errore aggiunta dipendente:', err)
      throw err
    }
  }

  const updateEmployee = async (id, employeeData) => {
    try {
      // Gestione team esterno
      if (employeeData.teamId === 'external') {
        employeeData.teamId = null
      }

      const { data, error } = await supabase
        .from('employees')
        .update({
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email,
          role: employeeData.role,
          company_id: employeeData.companyId,
          team_id: employeeData.teamId,
          ccnl: employeeData.ccnl,
          level: employeeData.level,
          hire_date: employeeData.hireDate,
          contract_type: employeeData.contractType,
          contract_start: employeeData.contractStart,
          contract_end: employeeData.contractEnd,
          medical_visit: employeeData.medicalVisit,
          safety_training: employeeData.safetyTraining,
          vacation_days: employeeData.vacationDays,
          nda_signed: employeeData.ndaSigned,
          kit_received: employeeData.kitReceived,
          notes: employeeData.notes,
          onboarding_status: employeeData.onboardingStatus
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) {
        employees.value[index] = data
      }
      console.log('✅ Dipendente aggiornato:', data)
      return data
    } catch (err) {
      console.error('❌ Errore aggiornamento dipendente:', err)
      throw err
    }
  }

  const deleteEmployee = async (id) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) {
        employees.value.splice(index, 1)
        console.log('✅ Dipendente eliminato:', id)
      }
    } catch (err) {
      console.error('❌ Errore eliminazione dipendente:', err)
      throw err
    }
  }

  // Computed properties per filtrare per azienda selezionata
  const filteredTeams = computed(() => {
    if (!selectedCompany.value) return teams.value
    return teams.value.filter(team => team.company_id === selectedCompany.value)
  })

  const filteredEmployees = computed(() => {
    if (!selectedCompany.value) return employees.value
    return employees.value.filter(employee => employee.company_id === selectedCompany.value)
  })

  // Computed per ottenere oggetti per ID
  const getCompanyById = computed(() => (id) => {
    return companies.value.find(c => c.id === id)
  })

  const getTeamById = computed(() => (id) => {
    return teams.value.find(t => t.id === id)
  })

  const getTeamsByCompany = computed(() => (companyId) => {
    return teams.value.filter(t => t.company_id === companyId)
  })

  const getEmployeesByCompany = computed(() => (companyId) => {
    return employees.value.filter(e => e.company_id === companyId)
  })

  const getEmployeesByTeam = computed(() => (teamId) => {
    return employees.value.filter(e => e.team_id === teamId)
  })

  // Utilities
  const clearAllData = async () => {
    try {
      // Elimina tutti i dipendenti
      const { error: empError } = await supabase
        .from('employees')
        .delete()
        .neq('id', 0) // Elimina tutti
      
      if (empError) throw empError

      // Elimina tutti i team
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .neq('id', 0) // Elimina tutti
      
      if (teamError) throw teamError

      // Elimina tutte le aziende
      const { error: compError } = await supabase
        .from('companies')
        .delete()
        .neq('id', 0) // Elimina tutti
      
      if (compError) throw compError

      // Svuota i ref locali
      companies.value = []
      teams.value = []
      employees.value = []
      selectedCompany.value = null

      console.log('✅ Tutti i dati eliminati')
    } catch (err) {
      console.error('❌ Errore eliminazione dati:', err)
      throw err
    }
  }

  return {
    // State
    companies,
    teams,
    employees,
    selectedCompany,
    loading,
    error,
    
    // Filtered data
    filteredTeams,
    filteredEmployees,
    
    // Actions
    loadData,
    setSelectedCompany,
    
    // Company actions
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Team actions
    addTeam,
    updateTeam,
    deleteTeam,
    
    // Employee actions
    addEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Computed getters
    getCompanyById,
    getTeamById,
    getTeamsByCompany,
    getEmployeesByCompany,
    getEmployeesByTeam,
    
    // Utilities
    clearAllData
  }
}
