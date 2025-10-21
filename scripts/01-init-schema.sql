-- Create URLs table to store original URLs and their short codes
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT
);

-- Create clicks table to track every click on a short link
CREATE TABLE IF NOT EXISTS clicks (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  referrer TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(2),
  device_type VARCHAR(50)
);

-- Create impressions table to track ad impressions
CREATE TABLE IF NOT EXISTS impressions (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  impressed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ad_type VARCHAR(50),
  user_agent TEXT,
  ip_address VARCHAR(45)
);

-- Create analytics table for aggregated stats
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  estimated_earnings DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(url_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_impressions_url_id ON impressions(url_id);
CREATE INDEX IF NOT EXISTS idx_analytics_url_id ON analytics(url_id);
