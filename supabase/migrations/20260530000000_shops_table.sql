-- Shops table for SME onboarding profiles
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_profile JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own shop"
ON shops FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own shop"
ON shops FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own shop"
ON shops FOR UPDATE
USING (auth.uid() = owner_id);

-- Index for owner_id lookups
CREATE INDEX idx_shops_owner_id ON shops(owner_id);