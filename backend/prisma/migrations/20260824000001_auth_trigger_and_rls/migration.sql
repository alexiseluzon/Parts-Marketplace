-- Auto-create a profile row whenever a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.parts enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: users can read their own row; admins can read all
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- parts: owners manage their own rows; admins manage all
create policy "parts_select_own_or_admin"
  on public.parts for select
  using ("ownerId" = auth.uid() or public.is_admin());

create policy "parts_insert_own"
  on public.parts for insert
  with check ("ownerId" = auth.uid());

create policy "parts_update_own_or_admin"
  on public.parts for update
  using ("ownerId" = auth.uid() or public.is_admin());

create policy "parts_delete_own_or_admin"
  on public.parts for delete
  using ("ownerId" = auth.uid() or public.is_admin());
