create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  dob date,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

grant select, update on table public.profiles to authenticated;
revoke all on table public.profiles from anon;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, dob, preferences)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    case
      when coalesce(new.raw_user_meta_data->>'dob', '') <> ''
        then (new.raw_user_meta_data->>'dob')::date
      else null
    end,
    '{}'::jsonb
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, first_name, last_name, dob, preferences)
select
  users.id,
  coalesce(users.raw_user_meta_data->>'first_name', ''),
  coalesce(users.raw_user_meta_data->>'last_name', ''),
  case
    when coalesce(users.raw_user_meta_data->>'dob', '') <> ''
      then (users.raw_user_meta_data->>'dob')::date
    else null
  end,
  '{}'::jsonb
from auth.users as users
on conflict (id) do nothing;
