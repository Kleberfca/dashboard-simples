-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies table (multi-tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration configurations
CREATE TABLE integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'google_ads', 'facebook_ads', 'tiktok_ads'
    name VARCHAR(255) NOT NULL,
    credentials_encrypted TEXT, -- Encrypted JSON with credentials
    oauth_tokens JSONB, -- OAuth tokens if applicable
    config JSONB DEFAULT '{}', -- Additional configuration
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(50), -- 'success', 'failed', 'in_progress'
    last_sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, platform, name)
);

-- Integration sync logs
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed'
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    details JSONB DEFAULT '{}'
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    integration_config_id UUID REFERENCES integration_configs(id),
    external_id VARCHAR(255),
    name VARCHAR(500),
    status VARCHAR(50),
    platform VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, integration_config_id, external_id)
);

-- Creatives table
CREATE TABLE creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    name VARCHAR(500),
    type VARCHAR(50), -- 'video', 'image', 'carousel'
    url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily metrics table
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Media metrics
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    cost DECIMAL(12,2) DEFAULT 0,
    
    -- Conversion metrics
    leads INTEGER DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    leads_icp INTEGER DEFAULT 0,
    
    -- Sales metrics
    revenue DECIMAL(12,2) DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    
    -- Calculated metrics (denormalized for performance)
    ctr DECIMAL(8,4),
    cpm DECIMAL(10,2),
    cpc DECIMAL(10,2),
    cpl DECIMAL(10,2),
    roas DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, campaign_id, creative_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_daily_metrics_company_date ON daily_metrics(company_id, date);
CREATE INDEX idx_daily_metrics_campaign ON daily_metrics(campaign_id);
CREATE INDEX idx_campaigns_company ON campaigns(company_id);
CREATE INDEX idx_sync_logs_integration ON sync_logs(integration_config_id);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for companies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- Function to update updated_at timestamp
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