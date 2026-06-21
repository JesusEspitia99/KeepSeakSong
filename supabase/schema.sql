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
  generated_lyrics text[]
);

create index if not exists quiz_responses_email_idx on quiz_responses (email);
create index if not exists quiz_responses_created_at_idx on quiz_responses (created_at);

-- Rate limiting for the Claude API lyric generation endpoint
create table if not exists lyric_requests (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists lyric_requests_ip_created_idx on lyric_requests (ip, created_at);
