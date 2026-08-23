-- ============================================================================
-- Liverpool Barbearia — Supabase schema
-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles — mirrors auth.users, carries the `role` used everywhere for
--    admin vs client checks (both in the React app and in RLS below).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every authenticated user can read their own profile row (needed so the
-- React AuthContext can look up its own role after login).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Nobody edits their own role from the client — do that manually in the
-- Supabase dashboard (Table Editor) for the barbershop's admin account.
-- No insert/update/delete policy is defined here on purpose.

-- Auto-create a profile row (default role 'client') whenever a new user
-- signs up, so every authenticated user has a row to read.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- To make an account admin, run once (after the user has signed up):
--   update public.profiles set role = 'admin' where email = 'owner@example.com';


-- ----------------------------------------------------------------------------
-- 2. agendamentos — bookings
-- ----------------------------------------------------------------------------
create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  data date not null,
  horario time not null,
  pessoas integer not null default 1 check (pessoas >= 1),
  observacoes text,
  status text not null default 'pending',
  admin_message text,
  created_at timestamptz not null default now()
);

-- Rebuilt every time this script runs (drop + add), instead of relying on
-- the inline CHECK from table creation. `create table if not exists` is a
-- no-op when the table already exists, so if an earlier run of this script
-- (or a manual edit) ever left the table with a different/stale constraint,
-- simply re-running the file would NOT fix it without this explicit step.
alter table public.agendamentos drop constraint if exists agendamentos_status_check;
alter table public.agendamentos add constraint agendamentos_status_check
  check (status in ('pending', 'confirmed', 'declined'));

alter table public.agendamentos enable row level security;

-- Public booking form: anyone (even anonymous) can INSERT a new booking, but
-- can never SELECT the table directly — that's what the RPC function below
-- is for, so no client name/phone list is ever exposed wholesale.
drop policy if exists "agendamentos_insert_public" on public.agendamentos;
create policy "agendamentos_insert_public" on public.agendamentos
  for insert with check (true);

-- Admins can read every booking (used by the admin dashboard/table).
drop policy if exists "agendamentos_select_admin" on public.agendamentos;
create policy "agendamentos_select_admin" on public.agendamentos
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admins can update status / admin_message.
drop policy if exists "agendamentos_update_admin" on public.agendamentos;
create policy "agendamentos_update_admin" on public.agendamentos
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 2a. consultar_agendamento — the ONLY way a client looks up their booking.
--     Runs as the function owner (security definer) so it can read the
--     table even though clients have no direct SELECT policy on it, but it
--     only ever returns rows matching the exact name + phone passed in.
-- ----------------------------------------------------------------------------
create or replace function public.consultar_agendamento(p_nome text, p_telefone text)
returns setof public.agendamentos
language sql
security definer
set search_path = public
as $$
  select *
  from public.agendamentos
  where lower(trim(nome)) = lower(trim(p_nome))
    and regexp_replace(telefone, '\D', '', 'g') = regexp_replace(p_telefone, '\D', '', 'g')
  order by created_at desc
  limit 1;
$$;

-- Let anonymous + authenticated callers execute the RPC (it's already
-- filtered to a single exact match, so this is safe to expose publicly).
grant execute on function public.consultar_agendamento(text, text) to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3. fotos_carrossel — optional metadata table for carousel photos.
--    (The site can also just list files directly from Storage — see
--    Carousel.js — but this table lets the admin panel reorder/caption
--    photos later without touching Storage file names.)
-- ----------------------------------------------------------------------------
create table if not exists public.fotos_carrossel (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fotos_carrossel enable row level security;

drop policy if exists "fotos_carrossel_select_public" on public.fotos_carrossel;
create policy "fotos_carrossel_select_public" on public.fotos_carrossel
  for select using (true);

drop policy if exists "fotos_carrossel_write_admin" on public.fotos_carrossel;
create policy "fotos_carrossel_write_admin" on public.fotos_carrossel
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ----------------------------------------------------------------------------
-- 4. Storage buckets
--    Buckets themselves are usually created via the dashboard (Storage >
--    New bucket), but this covers it via SQL too so it's scripted end to end.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('carrossel-fotos', 'carrossel-fotos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('barbearia-assets', 'barbearia-assets', true)
on conflict (id) do nothing;

-- Public read on both buckets (they hold public marketing photos only).
drop policy if exists "carrossel_fotos_public_read" on storage.objects;
create policy "carrossel_fotos_public_read" on storage.objects
  for select using (bucket_id = 'carrossel-fotos');

drop policy if exists "barbearia_assets_public_read" on storage.objects;
create policy "barbearia_assets_public_read" on storage.objects
  for select using (bucket_id = 'barbearia-assets');

-- Only admins can write to either bucket.
drop policy if exists "carrossel_fotos_admin_write" on storage.objects;
create policy "carrossel_fotos_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'carrossel-fotos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "carrossel_fotos_admin_delete" on storage.objects;
create policy "carrossel_fotos_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'carrossel-fotos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "barbearia_assets_admin_write" on storage.objects;
create policy "barbearia_assets_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'barbearia-assets'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
