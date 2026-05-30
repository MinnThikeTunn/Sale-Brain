-- Make onboarding columns nullable to allow partial updates from the dashboard
ALTER TABLE public.business_onboarding 
ALTER COLUMN business_category DROP NOT NULL,
ALTER COLUMN selling_platform DROP NOT NULL,
ALTER COLUMN weekly_order_volume DROP NOT NULL,
ALTER COLUMN payment_method DROP NOT NULL,
ALTER COLUMN delivery_method DROP NOT NULL,
ALTER COLUMN business_goal DROP NOT NULL;
