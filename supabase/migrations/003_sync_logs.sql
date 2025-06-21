-- supabase/migrations/003_sync_logs.sql

-- Create sync_logs table for tracking synchronization history
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) DEFAULT 'manual' CHECK (sync_type IN ('manual', 'cron', 'webhook')),
  status VARCHAR(20) DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sync_logs_company_id ON sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_config_id ON sync_logs(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see sync logs from their company
CREATE POLICY "Users can view company sync logs" ON sync_logs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Create a function to clean old sync logs (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_sync_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sync_logs
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND status != 'failed';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for sync statistics
CREATE OR REPLACE VIEW sync_statistics AS
SELECT 
  company_id,
  integration_config_id,
  COUNT(*) as total_syncs,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_syncs,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_syncs,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
  MAX(started_at) as last_sync_at
FROM sync_logs
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY company_id, integration_config_id;

-- Grant permissions
GRANT SELECT ON sync_statistics TO authenticated;

-- Add a column to track sync queue status
ALTER TABLE integration_configs 
ADD COLUMN IF NOT EXISTS sync_in_progress BOOLEAN DEFAULT false;

-- Create a function to check if sync is needed
CREATE OR REPLACE FUNCTION should_sync_integration(integration_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_sync TIMESTAMP WITH TIME ZONE;
  sync_interval INTERVAL;
BEGIN
  -- Get last successful sync
  SELECT MAX(completed_at) INTO last_sync
  FROM sync_logs
  WHERE integration_config_id = integration_id
  AND status = 'completed';
  
  -- Default sync interval is 1 hour
  sync_interval := INTERVAL '1 hour';
  
  -- If never synced or last sync is older than interval
  RETURN last_sync IS NULL OR last_sync < NOW() - sync_interval;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE sync_logs IS 'Tracks all synchronization attempts for debugging and monitoring';
COMMENT ON COLUMN sync_logs.records_processed IS 'Number of records processed during this sync';
COMMENT ON COLUMN sync_logs.metadata IS 'Additional sync details like API responses, rate limits, etc';