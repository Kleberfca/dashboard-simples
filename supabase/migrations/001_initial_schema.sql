-- supabase/migrations/001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create integration_configs table
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'analytics')),
  name VARCHAR(255) NOT NULL,
  credentials_encrypted TEXT,
  oauth_tokens JSONB,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(20) CHECK (last_sync_status IN ('success', 'failed', 'in_progress')),
  last_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, platform, name)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE SET NULL,
  external_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50),
  platform VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creatives table
CREATE TABLE IF NOT EXISTS creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  external_id VARCHAR(255),
  name VARCHAR(255),
  type VARCHAR(50) CHECK (type IN ('video', 'image', 'carousel', 'text')),
  url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_metrics table
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Media metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Conversion metrics
  leads INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_icp INTEGER DEFAULT 0,
  
  -- Sales metrics
  revenue DECIMAL(10, 2) DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  
  -- Calculated metrics (pode ser calculado em runtime, mas armazenamos para performance)
  ctr DECIMAL(5, 2), -- Click-through rate
  cpm DECIMAL(10, 2), -- Cost per mille
  cpc DECIMAL(10, 2), -- Cost per click
  cpl DECIMAL(10, 2), -- Cost per lead
  roas DECIMAL(10, 2), -- Return on ad spend
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garante que não há duplicatas para a mesma campanha/criativo/data
  UNIQUE(company_id, campaign_id, creative_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_integration_configs_company ON integration_configs(company_id);
CREATE INDEX idx_campaigns_company ON campaigns(company_id);
CREATE INDEX idx_campaigns_integration ON campaigns(integration_config_id);
CREATE INDEX idx_creatives_campaign ON creatives(campaign_id);
CREATE INDEX idx_daily_metrics_company_date ON daily_metrics(company_id, date);
CREATE INDEX idx_daily_metrics_campaign ON daily_metrics(campaign_id);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON creatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas são visíveis apenas para seus usuários"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas membros da mesma empresa"
  ON users FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Apenas admins podem inserir usuários"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND company_id = NEW.company_id
    )
  );

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Integration Configs
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integrações são visíveis apenas para usuários da empresa"
  ON integration_configs FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Apenas admins podem gerenciar integrações"
  ON integration_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND company_id = integration_configs.company_id
    )
  );

-- Campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campanhas são visíveis apenas para usuários da empresa"
  ON campaigns FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Daily Metrics
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Métricas são visíveis apenas para usuários da empresa"
  ON daily_metrics FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Comments for documentation
COMMENT ON TABLE companies IS 'Empresas/organizações que usam o sistema';
COMMENT ON TABLE users IS 'Usuários do sistema, estende auth.users do Supabase';
COMMENT ON TABLE integration_configs IS 'Configurações de integração com plataformas externas';
COMMENT ON TABLE campaigns IS 'Campanhas de marketing importadas das plataformas';
COMMENT ON TABLE creatives IS 'Criativos/anúncios das campanhas';
COMMENT ON TABLE daily_metrics IS 'Métricas diárias agregadas por campanha/criativo';

COMMENT ON COLUMN users.role IS 'Papel do usuário: admin (total), editor (criar/editar), viewer (apenas visualizar)';
COMMENT ON COLUMN integration_configs.credentials_encrypted IS 'Credenciais criptografadas da integração';
COMMENT ON COLUMN daily_metrics.leads_qualified IS 'Leads que passaram por qualificação';
COMMENT ON COLUMN daily_metrics.leads_icp IS 'Leads que se encaixam no Ideal Customer Profile';