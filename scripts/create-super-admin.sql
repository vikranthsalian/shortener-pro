-- Create super admin user
INSERT INTO users (email, password_hash, name, provider, created_at, updated_at)
VALUES ('super@admin.com', '', 'Super Admin', 'email', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Add is_super_admin column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Mark super@admin.com as super admin
UPDATE users SET is_super_admin = TRUE WHERE email = 'super@admin.com';
