# 🚀 Configurazione Supabase per HR Management

## Passaggi per la configurazione:

### 1. Crea il progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea un account (se non l'hai già)
3. Clicca su "New Project"
4. Scegli un nome per il progetto (es. "hr-management")
5. Crea una password sicura per il database
6. Seleziona una regione (Europa West per l'Italia)
7. Clicca "Create new project"

### 2. Ottieni le credenziali
1. Una volta creato il progetto, vai nella sezione "Settings" → "API"
2. Copia l'**URL del progetto** (Project URL)
3. Copia la **chiave pubblica** (anon/public key)

### 3. Configura le variabili d'ambiente
1. Apri il file `.env` nella root del progetto
2. Sostituisci i valori placeholder con le tue credenziali:

```env
VITE_SUPABASE_URL=https://tuoprogetto.supabase.co
VITE_SUPABASE_ANON_KEY=tua-chiave-pubblica-qui
```

### 4. Crea le tabelle del database
1. In Supabase, vai nella sezione "SQL Editor"
2. Copia e incolla il contenuto del file `database-setup.sql`
3. Clicca "Run" per eseguire lo script
4. Le tabelle verranno create automaticamente

### 5. Verifica la configurazione
1. Salva i file e riavvia il server di sviluppo
2. Apri la console del browser (F12)
3. Dovresti vedere il messaggio "✅ Connessione Supabase OK"

## Funzionalità disponibili:

- ✅ **Persistenza dati**: Tutti i dati vengono salvati automaticamente nel database PostgreSQL
- ✅ **CRUD completo**: Crea, leggi, aggiorna ed elimina aziende, team e dipendenti
- ✅ **Relazioni**: Le tabelle sono collegate con chiavi esterne
- ✅ **Auto-selezione azienda**: Se c'è una sola azienda, viene selezionata automaticamente
- ✅ **Gestione errori**: Messaggi di errore chiari in caso di problemi
- ✅ **Performance**: Operazioni ottimizzate con indici sul database

## Struttura del database:

### Tabella `companies`
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `industry` (TEXT)
- `location` (TEXT)
- `created_at` (TIMESTAMP)

### Tabella `teams`
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `company_id` (riferimento a companies)
- `created_at` (TIMESTAMP)

### Tabella `employees`
- `id` (BIGSERIAL PRIMARY KEY)
- `first_name`, `last_name` (TEXT NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `role` (TEXT NOT NULL)
- `company_id` (riferimento a companies)
- `team_id` (riferimento a teams, nullable)
- Campi contrattuali: `ccnl`, `level`, `hire_date`, `contract_type`, etc.
- Campi onboarding: `medical_visit`, `safety_training`, `vacation_days`, etc.
- `created_at` (TIMESTAMP)

## In caso di problemi:

1. **Errore di connessione**: Controlla che le credenziali nel file `.env` siano corrette
2. **Tabelle non trovate**: Assicurati di aver eseguito lo script `database-setup.sql`
3. **Errori CORS**: Le impostazioni di Supabase dovrebbero permettere localhost automaticamente
4. **Console browser**: Controlla sempre la console per messaggi di errore dettagliati

## Passaggio da localStorage a Supabase:

Il sistema ora usa `useHRSupabase.js` invece di `useHRClean.js`:
- Tutte le operazioni sono asincrone (async/await)
- I dati persistono tra le sessioni
- Supporto per più utenti contemporaneamente
- Backup automatico nel cloud
