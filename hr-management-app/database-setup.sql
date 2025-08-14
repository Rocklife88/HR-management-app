-- Script per creare le tabelle del database HR Management

-- Tabella aziende
CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella team
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella dipendenti
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  ccnl TEXT,
  level TEXT,
  hire_date DATE NOT NULL,
  contract_type TEXT NOT NULL,
  contract_start DATE NOT NULL,
  contract_end DATE,
  medical_visit DATE,
  safety_training DATE,
  vacation_days INTEGER DEFAULT 20,
  nda_signed BOOLEAN DEFAULT FALSE,
  kit_received BOOLEAN DEFAULT FALSE,
  notes TEXT,
  onboarding_status TEXT DEFAULT 'Non iniziato',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_teams_company_id ON teams(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_team_id ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Inserimento dati di esempio
INSERT INTO companies (name, description, industry, location) VALUES 
('MARCO PELLEGRINI', 'Azienda di esempio per test', 'Tecnologia', 'Milano')
ON CONFLICT DO NOTHING;

-- Verifica che le tabelle siano state create
SELECT 'companies' as table_name, COUNT(*) as records FROM companies
UNION ALL
SELECT 'teams' as table_name, COUNT(*) as records FROM teams
UNION ALL  
SELECT 'employees' as table_name, COUNT(*) as records FROM employees;
