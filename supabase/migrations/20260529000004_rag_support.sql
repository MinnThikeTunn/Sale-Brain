create extension if not exists vector;

-- 1. Create table if not exists with all columns
create table if not exists public.shop_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id text not null,
  source_id text not null,
  source_type text not null,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_id, source_type)
);

-- 2. Ensure user_id exists if the table was created by an older migration
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='shop_knowledge_documents' and column_name='user_id') then
    alter table public.shop_knowledge_documents add column user_id uuid not null references auth.users(id) on delete cascade;
  end if;
  
  -- Add unique constraint if it doesn't exist
  if not exists (select 1 from pg_constraint where conname = 'shop_knowledge_documents_user_id_source_id_source_type_key') then
    alter table public.shop_knowledge_documents add unique (user_id, source_id, source_type);
  end if;
end $$;

-- 3. Create indexes
create index if not exists shop_knowledge_documents_user_id_idx
  on public.shop_knowledge_documents (user_id);

create index if not exists shop_knowledge_documents_shop_id_idx
  on public.shop_knowledge_documents (shop_id);

create index if not exists shop_knowledge_documents_embedding_idx
  on public.shop_knowledge_documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Match function using user_id as established in business_onboarding
create or replace function public.match_shop_knowledge(
  user_id_input uuid,
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  source_id text,
  source_type text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    source_id,
    source_type,
    title,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from public.shop_knowledge_documents
  where user_id = user_id_input
  order by embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- Enable RLS
alter table public.shop_knowledge_documents enable row level security;

-- Drop existing policies if they exist to avoid errors on re-run
drop policy if exists "Users can manage their own knowledge" on public.shop_knowledge_documents;
drop policy if exists "Public can view onboarding by shop_id" on public.business_onboarding;
drop policy if exists "Public can view knowledge documents" on public.shop_knowledge_documents;

-- Owner can manage their own data
create policy "Users can manage their own knowledge"
on public.shop_knowledge_documents for all
using (auth.uid() = user_id);

-- Public policy for onboarding to allow shop lookup (Required for public storefront)
create policy "Public can view onboarding by shop_id"
on public.business_onboarding for select
using (true);

-- Public policy for knowledge documents (Required for RAG on public storefront)
create policy "Public can view knowledge documents"
on public.shop_knowledge_documents for select
using (true);
