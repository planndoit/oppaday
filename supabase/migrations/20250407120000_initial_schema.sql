-- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nickname text not null default '',
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  event_date date not null,
  category text not null check (category in ('birthday', 'dating', 'wedding', 'etc')),
  description text not null default '',
  repeat_type text not null check (repeat_type in ('yearly', 'once')),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index anniversaries_event_date_idx on public.anniversaries (event_date);
create index anniversaries_user_created_idx on public.anniversaries (user_id, created_at);
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger anniversaries_set_updated_at
  before update on public.anniversaries
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nickname, profile_image_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.enforce_anniversary_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.anniversaries where user_id = new.user_id) >= 3 then
    raise exception 'anniversary_limit_exceeded';
  end if;
  return new;
end;
$$;

create trigger anniversaries_limit_before_insert
  before insert on public.anniversaries
  for each row execute function public.enforce_anniversary_limit();

alter table public.profiles enable row level security;
alter table public.anniversaries enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "anniversaries_select_public"
  on public.anniversaries for select
  using (is_public = true or auth.uid() = user_id);

create policy "anniversaries_insert_own"
  on public.anniversaries for insert
  with check (auth.uid() = user_id);

create policy "anniversaries_update_own"
  on public.anniversaries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "anniversaries_delete_own"
  on public.anniversaries for delete
  using (auth.uid() = user_id);

create or replace function public.anniversaries_for_month(p_year int, p_month int)
returns table (
  id uuid,
  user_id uuid,
  title text,
  event_date date,
  category text,
  description text,
  repeat_type text,
  created_at timestamptz,
  nickname text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    a.id,
    a.user_id,
    a.title,
    a.event_date,
    a.category,
    a.description,
    a.repeat_type,
    a.created_at,
    p.nickname
  from public.anniversaries a
  inner join public.profiles p on p.id = a.user_id
  where a.is_public = true
    and (
      (
        a.repeat_type = 'once'
        and a.event_date >= make_date(p_year, p_month, 1)
        and a.event_date < (make_date(p_year, p_month, 1) + interval '1 month')::date
      )
      or (
        a.repeat_type = 'yearly'
        and extract(month from a.event_date)::int = p_month
      )
    );
$$;

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant select, insert, update, delete on public.anniversaries to authenticated;
grant select on public.anniversaries to anon;

grant execute on function public.anniversaries_for_month(int, int) to anon, authenticated;
