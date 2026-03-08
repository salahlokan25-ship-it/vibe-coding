-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS TABLE
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  prompt text, -- The original prompt 
  preview_html text, -- For dashboard thumbnails
  file_count integer default 0,
  status text check (status in ('building', 'ready', 'error')) default 'building',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECT FILES TABLE
create table project_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  file_path text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, file_path)
);

-- MESSAGES TABLE
create table messages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)

alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table messages enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Policies for Projects
create policy "Users can view their own projects." on projects for select using (auth.uid() = user_id);
create policy "Users can create their own projects." on projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects." on projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects." on projects for delete using (auth.uid() = user_id);

-- Policies for Project Files
-- Instead of complex joins for RLS on child tables, allow access if the user owns the parent project
create policy "Users can view their own project files." on project_files for select using (
  exists (select 1 from projects where projects.id = project_files.project_id and projects.user_id = auth.uid())
);
create policy "Users can insert their own project files." on project_files for insert with check (
  exists (select 1 from projects where projects.id = project_files.project_id and projects.user_id = auth.uid())
);
create policy "Users can update their own project files." on project_files for update using (
  exists (select 1 from projects where projects.id = project_files.project_id and projects.user_id = auth.uid())
);
create policy "Users can delete their own project files." on project_files for delete using (
  exists (select 1 from projects where projects.id = project_files.project_id and projects.user_id = auth.uid())
);

-- Policies for Messages
create policy "Users can view their own project messages." on messages for select using (
  exists (select 1 from projects where projects.id = messages.project_id and projects.user_id = auth.uid())
);
create policy "Users can insert their own project messages." on messages for insert with check (
  exists (select 1 from projects where projects.id = messages.project_id and projects.user_id = auth.uid())
);
create policy "Users can update their own project messages." on messages for update using (
  exists (select 1 from projects where projects.id = messages.project_id and projects.user_id = auth.uid())
);
create policy "Users can delete their own project messages." on messages for delete using (
  exists (select 1 from projects where projects.id = messages.project_id and projects.user_id = auth.uid())
);

-- Function to handle new user profile creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.email, '');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on sign up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
