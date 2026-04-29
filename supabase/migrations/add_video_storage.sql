-- Property video storage bucket
-- Run in Supabase Dashboard → SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-videos',
  'property-videos',
  true,
  104857600,  -- 100 MB per file
  array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
)
on conflict (id) do nothing;

-- Public read
create policy "property-videos: public read"
  on storage.objects for select
  using ( bucket_id = 'property-videos' );

-- Admin write
create policy "property-videos: admin insert"
  on storage.objects for insert
  with check ( bucket_id = 'property-videos' and public.is_admin() );

create policy "property-videos: admin update"
  on storage.objects for update
  using ( bucket_id = 'property-videos' and public.is_admin() );

create policy "property-videos: admin delete"
  on storage.objects for delete
  using ( bucket_id = 'property-videos' and public.is_admin() );
