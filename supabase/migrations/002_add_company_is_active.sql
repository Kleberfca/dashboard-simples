-- Add is_active column to companies table if it doesn't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing companies to be active
UPDATE companies 
SET is_active = true 
WHERE is_active IS NULL;