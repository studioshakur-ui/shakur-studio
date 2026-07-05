-- Create public.profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  dob date,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies for RLS
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create handler function for new auth.users rows
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, dob, preferences)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    case 
      when (new.raw_user_meta_data->>'dob') is not null and (new.raw_user_meta_data->>'dob') <> '' 
      then (new.raw_user_meta_data->>'dob')::date
      else null
    end,
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users insertion
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
