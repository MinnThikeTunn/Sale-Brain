CREATE TABLE business_onboarding (
    onboarding_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    business_name VARCHAR(255) NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    selling_platform VARCHAR(100) NOT NULL,
    weekly_order_volume VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    delivery_method VARCHAR(100) NOT NULL,
    business_goal VARCHAR(100) NOT NULL,
    bot_personality VARCHAR(100) DEFAULT 'Friendly',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE business_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own onboarding" 
ON business_onboarding FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own onboarding" 
ON business_onboarding FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding" 
ON business_onboarding FOR UPDATE 
USING (auth.uid() = user_id);
