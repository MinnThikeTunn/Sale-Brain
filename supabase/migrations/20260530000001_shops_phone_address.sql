-- Phone and business address on shops (also mirrored in onboarding_profile jsonb)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS address TEXT;

-- Backfill from onboarding_profile where column values were never written
UPDATE shops
SET
  phone = NULLIF(TRIM(onboarding_profile->>'phone'), ''),
  address = NULLIF(TRIM(onboarding_profile->>'business_address'), '')
WHERE onboarding_profile IS NOT NULL
  AND (
    phone IS NULL OR TRIM(phone) = ''
    OR address IS NULL OR TRIM(address) = ''
  );
