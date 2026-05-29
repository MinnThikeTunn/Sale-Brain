-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  varies JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_on_demand BOOLEAN DEFAULT false,
  waiting_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own products
CREATE POLICY "Users can select their own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
ON products FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
ON products FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_products_user_id ON products(user_id);
