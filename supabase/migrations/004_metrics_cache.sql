-- Criar tabela de cache de métricas
CREATE TABLE IF NOT EXISTS company_metrics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period VARCHAR(10) NOT NULL, -- '7d', '30d', '90d'
    metrics JSONB NOT NULL DEFAULT '{}',
    kpis JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, period)
);

-- Índices para performance
CREATE INDEX idx_company_metrics_cache_company_id ON company_metrics_cache(company_id);
CREATE INDEX idx_company_metrics_cache_period ON company_metrics_cache(period);
CREATE INDEX idx_company_metrics_cache_updated_at ON company_metrics_cache(updated_at);

-- RLS
ALTER TABLE company_metrics_cache ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "Users can view their company metrics cache" ON company_metrics_cache
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Política de inserção/atualização (apenas via service role)
CREATE POLICY "Service role can manage metrics cache" ON company_metrics_cache
    FOR ALL USING (auth.role() = 'service_role');