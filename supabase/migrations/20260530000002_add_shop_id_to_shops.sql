-- Add shop_id to shops table for public links
ALTER TABLE shops ADD COLUMN IF NOT EXISTS shop_id VARCHAR(100) UNIQUE;

-- Backfill shop_id from business_onboarding if exists
UPDATE shops s
SET shop_id = b.shop_id
FROM business_onboarding b
WHERE s.owner_id = b.user_id
AND s.shop_id IS NULL;
