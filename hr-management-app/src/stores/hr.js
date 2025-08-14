import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, testConnection } from '../lib/supabase.js'

export const useHRStore = defineStore('hr', () => {
  // State
  const companies = ref([])
  const teams = ref([])
  const employees = ref([])
  const selectedCompany = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters (computed)
  const filteredTeams = computed(() => {
    if (!selectedCompany.value) return teams.value
    return teams.value.filter(team => team.company_id === selectedCompany.value)
  })

  const filteredEmployees = computed(() => {
    console.log('🔧 DEBUG filteredEmployees:', {
      selectedCompany: selectedCompany.value,
      allEmployees: employees.value.length,
      allEmployeesData: employees.value
    })
    
    if (!selectedCompany.value) return employees.value
    
    const filtered = employees.value.filter(employee => {
      const employeeCompanyId = employee.companyId || employee.company_id
      const match = employeeCompanyId === selectedCompany.value
      
      console.log(`🔧 DEBUG employee filter:`, {
        employeeName: `${employee.firstName || employee.first_name} ${employee.lastName || employee.last_name}`,
        employeeCompanyId,
        selectedCompany: selectedCompany.value,
        match
      })
      
      return match
    })
    
    console.log('🔧 DEBUG filtered result:', filtered)
    return filtered
  })

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

  // Actions
  const loadData = async () => {
    console.log('🔍 Caricamento dati...')
    
    try {
      // Load companies
      console.log('🔍 Caricamento aziende...')
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name')
      
      if (companiesError) {
        console.error('❌ Errore caricamento aziende:', companiesError)
        throw companiesError
      }
      
      companies.value = companiesData || []
      console.log('📊 Aziende caricate:', companies.value)
      console.log('📊 Numero aziende:', companies.value.length)

      // Load teams
      console.log('🔍 Caricamento team...')
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name')
      
      if (teamsError) {
        console.error('❌ Errore caricamento team:', teamsError)
        throw teamsError
      }
      
      teams.value = teamsData || []
      console.log('📊 Team caricati dal database:', teams.value)
      console.log('📊 Numero team:', teams.value.length)

      // Load employees
      console.log('🔍 Caricamento dipendenti...')
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('first_name')
      
      if (employeesError) {
        console.error('❌ Errore caricamento dipendenti:', employeesError)
        throw employeesError
      }
      
      console.log('🔧 DEBUG raw employees from DB:', employeesData)
      
      // Convert to camelCase
      const convertedEmployees = (employeesData || []).map(convertEmployeeFromDB)
      employees.value = convertedEmployees
      console.log('🔧 DEBUG converted employees:', employees.value)
      console.log('📊 Numero dipendenti:', employees.value.length)

      console.log('✅ Dati caricati da Supabase:', {
        companies: companies.value.length,
        teams: teams.value.length,
        employees: employees.value.length
      })
    } catch (err) {
      console.error('❌ Errore caricamento dati:', err)
      error.value = err.message
    } finally {
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
      console.log('🔍 Tentativo di aggiungere team:', teamData)
      
      const insertData = {
        name: teamData.name,
        description: teamData.description,
        company_id: teamData.companyId
      }
      
      console.log('🔍 Dati per inserimento team:', insertData)
      
      const { data, error } = await supabase
        .from('teams')
        .insert([insertData])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Errore Supabase:', error)
        throw error
      }
      
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
      console.log('🔍 Tentativo di aggiornare team:', id, teamData)
      
      const updateData = {
        name: teamData.name,
        description: teamData.description,
        company_id: teamData.companyId
      }
      
      console.log('🔍 Dati per aggiornamento team:', updateData)
      
      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Errore Supabase aggiornamento:', error)
        throw error
      }
      
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

  // Utility function to convert database fields to camelCase
  const convertEmployeeFromDB = (dbEmployee) => {
    return {
      ...dbEmployee,
      firstName: dbEmployee.first_name,
      lastName: dbEmployee.last_name,
      companyId: dbEmployee.company_id,
      teamId: dbEmployee.team_id,
      hireDate: dbEmployee.hire_date,
      contractType: dbEmployee.contract_type,
      contractStart: dbEmployee.contract_start,
      contractEnd: dbEmployee.contract_end,
      medicalVisit: dbEmployee.medical_visit,
      safetyTraining: dbEmployee.safety_training,
      vacationDays: dbEmployee.vacation_days,
      ndaSigned: dbEmployee.nda_signed,
      kitReceived: dbEmployee.kit_received,
      onboardingStatus: dbEmployee.onboarding_status
    }
  }

  // Employee CRUD
  const addEmployee = async (employeeData) => {
    try {
      console.log('🔧 DEBUG: addEmployee chiamata con dati:', employeeData)
      
      // Gestione team esterno
      if (employeeData.teamId === 'external') {
        employeeData.teamId = null
        console.log('🔧 DEBUG: Team esterno, teamId impostato a null')
      }

      const insertData = {
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
      }

      console.log('🔧 DEBUG: Dati per inserimento nel database:', insertData)

      const { data, error } = await supabase
        .from('employees')
        .insert([insertData])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Errore database:', error)
        throw error
      }
      
      console.log('✅ Dipendente inserito nel database (snake_case):', data)
      
      // Converti i dati in camelCase prima di aggiungerli allo store
      const convertedEmployee = convertEmployeeFromDB(data)
      console.log('✅ Dipendente convertito (camelCase):', convertedEmployee)
      
      employees.value.unshift(convertedEmployee)
      console.log('✅ Dipendente aggiunto allo store locale. Totale dipendenti:', employees.value.length)
      return convertedEmployee
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
      
      // Converti i dati aggiornati in camelCase
      const convertedEmployee = convertEmployeeFromDB(data)
      
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) {
        employees.value[index] = convertedEmployee
      }
      console.log('✅ Dipendente aggiornato:', convertedEmployee)
      return convertedEmployee
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
    
    // Getters
    filteredTeams,
    filteredEmployees,
    getCompanyById,
    getTeamById,
    getTeamsByCompany,
    getEmployeesByCompany,
    getEmployeesByTeam,
    
    // Actions
    loadData,
    setSelectedCompany,
    addCompany,
    updateCompany,
    deleteCompany,
    addTeam,
    updateTeam,
    deleteTeam,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    clearAllData
  }
})
