import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenziali Supabase mancanti!')
  console.log('Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test della connessione
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1)
    if (error) throw error
    console.log('✅ Connessione Supabase OK')
    return true
  } catch (error) {
    console.error('❌ Errore connessione Supabase:', error.message)
    return false
  }
}
