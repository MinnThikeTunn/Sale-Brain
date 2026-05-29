-- Private bucket for per-user shop JSON state
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-states',
  'shop-states',
  false,
  10485760,
  array['application/json']
)
on conflict (id) do nothing;

-- Users may only access objects under their own folder: {auth.uid()}/state.json
create policy "shop_states_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'shop-states'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "shop_states_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'shop-states'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "shop_states_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'shop-states'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'shop-states'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "shop_states_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'shop-states'
  and (storage.foldername(name))[1] = auth.uid()::text
);
