-- Rate limiting table + helper function for Edge Functions

create table if not exists public.api_rate_limits (
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  request_count int not null default 0,
  window_start timestamptz not null default now(),
  primary key (user_id, endpoint)
);

create or replace function public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_limit int,
  p_window interval default interval '1 hour'
) returns boolean
language plpgsql
as $$
declare
  v_count int;
  v_window_start timestamptz;
begin
  select request_count, window_start
    into v_count, v_window_start
  from public.api_rate_limits
  where user_id = p_user_id
    and endpoint = p_endpoint;

  if v_count is null or v_window_start < now() - p_window then
    insert into public.api_rate_limits (user_id, endpoint, request_count, window_start)
    values (p_user_id, p_endpoint, 1, now())
    on conflict (user_id, endpoint)
    do update set request_count = 1, window_start = now();
    return true;
  end if;

  if v_count < p_limit then
    update public.api_rate_limits
    set request_count = request_count + 1
    where user_id = p_user_id
      and endpoint = p_endpoint;
    return true;
  end if;

  return false;
end;
$$;
