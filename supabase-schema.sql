-- ============================================================================
-- Student Portal — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query
-- → paste all of this → Run.
-- ============================================================================

create table students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  created_at timestamptz default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  date date not null,
  time text not null,
  status text not null default 'Scheduled',
  created_at timestamptz default now()
);

create table homework (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  lesson text,
  due date,
  status text not null default 'pending',
  note text default '',
  created_at timestamptz default now()
);

create table vocab (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  word text not null,
  translation text not null,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Links each Supabase auth user to a role (teacher/student) and, for
-- students, to their row in `students`.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student',
  student_id uuid references students(id),
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Auto-provisioning: runs every time someone signs up.
-- The FIRST person to ever sign up becomes the teacher (that's you —
-- sign up first, before sharing the app with any student).
-- Everyone after that becomes a student:
--   - if their email matches a row you already added to `students`, they're
--     linked to it automatically
--   - otherwise a new student row is created for them on the spot
-- ----------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger as $$
declare
  is_first boolean;
  matched_student_id uuid;
begin
  select count(*) = 0 into is_first from profiles;

  if is_first then
    insert into profiles (id, role) values (new.id, 'teacher');
  else
    select id into matched_student_id from students where email = new.email limit 1;

    if matched_student_id is null then
      insert into students (name, email)
      values (coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
      returning id into matched_student_id;
    end if;

    insert into profiles (id, role, student_id) values (new.id, 'student', matched_student_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security — teachers see/edit everything; students only see and
-- edit their own data (and can only edit homework status/note, nothing else).
-- ----------------------------------------------------------------------------

alter table students enable row level security;
alter table lessons enable row level security;
alter table homework enable row level security;
alter table vocab enable row level security;
alter table profiles enable row level security;

create function is_teacher() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher');
$$ language sql security definer stable;

create function my_student_id() returns uuid as $$
  select student_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- profiles: everyone can read their own profile row
create policy "read own profile" on profiles for select using (id = auth.uid());

-- students table
create policy "teacher full access to students" on students for all using (is_teacher());
create policy "student reads own row" on students for select using (id = my_student_id());

-- lessons
create policy "teacher full access to lessons" on lessons for all using (is_teacher());
create policy "student reads own lessons" on lessons for select using (student_id = my_student_id());

-- homework
create policy "teacher full access to homework" on homework for all using (is_teacher());
create policy "student reads own homework" on homework for select using (student_id = my_student_id());
create policy "student updates own homework" on homework for update
  using (student_id = my_student_id())
  with check (student_id = my_student_id());

-- vocab
create policy "teacher full access to vocab" on vocab for all using (is_teacher());
create policy "student reads own vocab" on vocab for select using (student_id = my_student_id());
