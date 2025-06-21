-- supabase/migrations/003_sync_logs.sql

-- Criar tabela de logs de sincronização
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE SET NULL,
  sync_type VARCHAR(50) NOT NULL, -- 'manual', 'cron', 'webhook'
  status VARCHAR(20) NOT NULL, -- 'started', 'in_progress', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sync_logs_company ON sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration ON sync_logs(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON sync_logs(started_at DESC);

-- RLS Policies
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logs são visíveis apenas para usuários da mesma empresa"
  ON sync_logs FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Logs podem ser criados pelo sistema"
  ON sync_logs FOR INSERT
  WITH CHECK (true); -- Permite que o sistema crie logs

-- Função para limpar logs antigos (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM sync_logs 
  WHERE started_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE sync_logs IS 'Logs de todas as sincronizações realizadas no sistema';
COMMENT ON COLUMN sync_logs.sync_type IS 'Tipo de sincronização: manual (usuário), cron (automática), webhook (evento externo)';
COMMENT ON COLUMN sync_logs.status IS 'Status da sincronização: started, in_progress, completed, failed';
COMMENT ON COLUMN sync_logs.records_processed IS 'Número de registros processados durante a sincronização';
COMMENT ON COLUMN sync_logs.metadata IS 'Dados adicionais da sincronização em formato JSON';