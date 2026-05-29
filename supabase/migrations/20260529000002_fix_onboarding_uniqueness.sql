-- Add unique constraint to user_id to ensure one record per shop
ALTER TABLE business_onboarding ADD CONSTRAINT business_onboarding_user_id_key UNIQUE (user_id);

-- Cleanup duplicates if any (keep the most recent completed one)
DELETE FROM business_onboarding a
USING business_onboarding b
WHERE a.onboarding_id < b.onboarding_id
  AND a.user_id = b.user_id;
