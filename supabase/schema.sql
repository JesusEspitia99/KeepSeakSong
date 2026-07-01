create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  recipient text,
  name text,
  pronunciation text,
  nickname text,
  vibe text,
  genre text,
  voice text,
  special text,
  memories text,
  heart_message text,
  email text,
  generated_lyrics text[],
  full_song jsonb
);

-- Run this if quiz_responses already existed before full_song was added:
-- alter table quiz_responses add column if not exists full_song jsonb;

create index if not exists quiz_responses_email_idx on quiz_responses (email);
create index if not exists quiz_responses_created_at_idx on quiz_responses (created_at);

-- Rate limiting for the Claude API lyric generation endpoint
create table if not exists lyric_requests (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists lyric_requests_ip_created_idx on lyric_requests (ip, created_at);

-- Suno song generations. The full audio is stored in a PRIVATE storage bucket named
-- "songs" (auto-created by the API on first use); only a 45s byte-slice is ever served
-- to the browser, and the full track is delivered via signed URL after purchase.
create table if not exists songs (
  task_id text primary key,
  email text,
  storage_path text,
  file_size bigint,
  duration numeric,
  ready boolean not null default false,
  full_song jsonb,
  preview_lyrics jsonb,
  created_at timestamptz not null default now()
);

create index if not exists songs_email_idx on songs (email);

-- Run these if the songs table already existed before full_song/preview_lyrics were added:
-- alter table songs add column if not exists full_song jsonb;
-- alter table songs add column if not exists preview_lyrics jsonb;
