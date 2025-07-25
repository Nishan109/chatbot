-- Enable the storage extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create a bucket for data files
insert into storage.buckets (id, name, public) 
values ('data_files', 'data_files', false);

-- Set up RLS policies for the bucket
create policy "Users can view own data files"
  on storage.objects
  for select
  using (auth.uid() = owner);

CREATE POLICY "Users can upload data files"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.uid() = owner
  AND bucket_id = 'data_files'
  AND (
    storage.extension(name) = 'csv' 
    OR storage.extension(name) = 'json'
    OR storage.extension(name) = 'png'
    OR storage.extension(name) = 'jpg'
    OR storage.extension(name) = 'jpeg'
  )
);

create policy "Users can update own data files"
  on storage.objects
  for update
  using (auth.uid() = owner)
  with check (bucket_id = 'data_files');

create policy "Users can delete own data files"
  on storage.objects
  for delete
  using (auth.uid() = owner);
