-- Add video_urls column to properties
-- Run in Supabase Dashboard → SQL Editor
alter table public.properties
  add column if not exists video_urls text[] not null default '{}';
