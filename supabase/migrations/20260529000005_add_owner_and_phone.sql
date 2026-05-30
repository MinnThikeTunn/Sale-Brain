-- Add missing columns to business_onboarding table
ALTER TABLE public.business_onboarding 
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
