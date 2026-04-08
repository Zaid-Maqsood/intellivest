-- FinCopilot Database Schema
-- Runs inside the "grayphite" database under the "fincopilot" schema

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS fincopilot;

-- Use this schema for all subsequent objects
SET search_path TO fincopilot, public;

-- USERS (advisors + admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'advisor' CHECK (role IN ('advisor', 'admin')),
  avatar_url VARCHAR(500),
  department VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  date_of_birth DATE,
  address TEXT,
  risk_tolerance VARCHAR(50) DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  investment_goals TEXT,
  annual_income DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  aum DECIMAL(15,2) DEFAULT 0, -- Assets Under Management
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  tax_bracket DECIMAL(5,2),
  estate_size DECIMAL(15,2),
  notes TEXT,
  tags TEXT[], -- e.g. ['high-net-worth', 'retirement', 'estate-planning']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_advisor ON clients(advisor_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_aum ON clients(aum DESC);

-- PORTFOLIOS
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) DEFAULT 'investment' CHECK (type IN ('investment', 'retirement', 'trust', 'custodial', 'taxable')),
  total_value DECIMAL(15,2) DEFAULT 0,
  cost_basis DECIMAL(15,2) DEFAULT 0,
  unrealized_gain DECIMAL(15,2) DEFAULT 0,
  ytd_return DECIMAL(8,4) DEFAULT 0, -- percentage
  inception_return DECIMAL(8,4) DEFAULT 0,
  benchmark VARCHAR(100) DEFAULT 'S&P 500',
  risk_score DECIMAL(4,2), -- 1-10
  allocation JSONB DEFAULT '{}', -- { stocks: 60, bonds: 30, cash: 10, alternatives: 0 }
  performance_history JSONB DEFAULT '[]', -- [{ date, value, benchmark_value }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_client ON portfolios(client_id);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'transfer')),
  symbol VARCHAR(20),
  description VARCHAR(500),
  quantity DECIMAL(15,6),
  price DECIMAL(15,4),
  amount DECIMAL(15,2) NOT NULL,
  gain_loss DECIMAL(15,2),
  tax_lots JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_executed ON transactions(executed_at DESC);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000),
  file_type VARCHAR(100),
  file_size INTEGER,
  category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('trust', 'estate', 'tax', 'investment', 'compliance', 'general', 'report')),
  extracted_text TEXT, -- AI-extracted content
  summary TEXT, -- AI-generated summary
  tags TEXT[],
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- FINANCIAL PLANS
CREATE TABLE IF NOT EXISTS financial_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'completed')),
  plan_type VARCHAR(100) DEFAULT 'comprehensive',
  retirement_age INTEGER,
  retirement_income_goal DECIMAL(15,2),
  current_savings_rate DECIMAL(5,2),
  projected_retirement_value DECIMAL(15,2),
  goals JSONB DEFAULT '[]', -- [{ title, targetAmount, targetDate, priority, status }]
  ai_suggestions JSONB DEFAULT '[]', -- AI-generated recommendations
  monte_carlo_results JSONB DEFAULT '{}', -- probability of success data
  content TEXT, -- full plan narrative
  version INTEGER DEFAULT 1,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_client ON financial_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON financial_plans(status);

-- ADVISORY ACTIONS (Advisor Copilot next-best actions)
CREATE TABLE IF NOT EXISTS advisory_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL CHECK (type IN ('portfolio', 'tax', 'planning', 'compliance', 'communication', 'ma_integration')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  ai_reasoning TEXT,
  estimated_impact VARCHAR(255), -- e.g. "$12,400 tax savings"
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_client ON advisory_actions(client_id);
CREATE INDEX IF NOT EXISTS idx_actions_advisor ON advisory_actions(advisor_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON advisory_actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_priority ON advisory_actions(priority);

-- COMPLIANCE LOGS
CREATE TABLE IF NOT EXISTS compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  advisor_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  entity_type VARCHAR(100), -- 'transaction', 'document', 'client', etc.
  entity_id UUID,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_client ON compliance_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_compliance_severity ON compliance_logs(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_resolved ON compliance_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_compliance_created ON compliance_logs(created_at DESC);
