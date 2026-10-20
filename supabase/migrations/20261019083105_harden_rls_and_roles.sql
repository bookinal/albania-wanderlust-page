-- =============================================================================
-- Harden RLS and role-based access
--
-- Roles (public.users.role): 'user' (customer), 'provider', 'admin'.
-- public.users is the single source of truth for roles. JWT user_metadata is
-- user-editable and is NOT trusted for authorization anymore.
--
-- Edge functions and cron use the service_role key and bypass RLS, so they are
-- unaffected by these policies.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Private helper functions (not exposed through the Data API)
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- Role of the signed-in user, only if the account is active (suspended => null)
create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.role
  from public.users u
  where u.id = (select auth.uid())
    and u.status = 'active'
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_user_role()) = 'admin', false)
$$;

create or replace function private.is_provider_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_user_role()) in ('provider', 'admin'), false)
$$;

-- Owner (providerId) of a car / apartment / hotel. Property tables are
-- publicly readable, so this does not leak anything.
create or replace function private.property_owner(p_type text, p_id text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  if p_id is null or p_id !~ '^[0-9]+$' then
    return null;
  end if;

  case p_type
    when 'car' then
      select c."providerId" into v_owner from public.car c where c.id = p_id::bigint;
    when 'apartment' then
      select a."providerId" into v_owner from public.apartment a where a.id = p_id::bigint;
    when 'hotel' then
      select h."providerId" into v_owner from public.hotel h where h.id = p_id::bigint;
    else
      v_owner := null;
  end case;

  return v_owner;
end;
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to anon, authenticated;

-- True when the current request comes from a client role (anon/authenticated)
-- rather than service_role / postgres (edge functions, cron, dashboard).
create or replace function private.is_client_request()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('anon', 'authenticated')
$$;
revoke all on function private.is_client_request() from public;
grant execute on function private.is_client_request() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. Drop the old, insecure policies
-- -----------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public.articles;
drop policy if exists "Enable read access for all users" on public.articles;

drop policy if exists "Admins can update all conversations" on public.chat_conversations;
drop policy if exists "Admins can view all conversations" on public.chat_conversations;
drop policy if exists "Users can create own conversations" on public.chat_conversations;
drop policy if exists "Users can update own conversations" on public.chat_conversations;
drop policy if exists "Users can view own conversations" on public.chat_conversations;

drop policy if exists "Admins can insert messages" on public.chat_messages;
drop policy if exists "Admins can update all messages" on public.chat_messages;
drop policy if exists "Admins can view all messages" on public.chat_messages;
drop policy if exists "Users can insert own messages" on public.chat_messages;
drop policy if exists "Users can update own messages" on public.chat_messages;
drop policy if exists "Users can view own messages" on public.chat_messages;

drop policy if exists "Enable insert for all users only" on public.hotel;
drop policy if exists "Enable read access for all users" on public.hotel;

drop policy if exists "Allow authenticated users to insert images" on public.hotel_images;
drop policy if exists "Allow public to view hotel images" on public.hotel_images;
drop policy if exists "Allow users to delete own images" on public.hotel_images;
drop policy if exists "Allow users to update own images" on public.hotel_images;

drop policy if exists "Admins can update property requests" on public.property_requests;
drop policy if exists "Admins can view all property requests" on public.property_requests;
drop policy if exists "Providers can create property requests" on public.property_requests;
drop policy if exists "Providers can view their own property requests" on public.property_requests;

drop policy if exists reviews_delete_own on public.reviews;
drop policy if exists reviews_insert_own on public.reviews;
drop policy if exists reviews_select_public on public.reviews;
drop policy if exists reviews_update_own on public.reviews;

drop policy if exists "Admins can update any profile" on public.users;
drop policy if exists "Authenticated users can read users table" on public.users;
drop policy if exists "Users can read all profiles" on public.users;
drop policy if exists "Users can update own profile" on public.users;

-- The old is_admin() trusted user_metadata.role (user-editable) => privilege
-- escalation. All policies now use private.is_admin().
drop function if exists public.is_admin();

-- -----------------------------------------------------------------------------
-- 3. Enable RLS everywhere in public
-- -----------------------------------------------------------------------------
alter table public.apartment             enable row level security;
alter table public.articles              enable row level security;
alter table public.booking               enable row level security;
alter table public.car                   enable row level security;
alter table public.chat_conversations    enable row level security;
alter table public.chat_messages         enable row level security;
alter table public.destination           enable row level security;
alter table public.hotel                 enable row level security;
alter table public.hotel_images          enable row level security;
alter table public.monthly_prices        enable row level security;
alter table public.payment_transactions  enable row level security;
alter table public.property_requests     enable row level security;
alter table public.review                enable row level security; -- legacy, unused: no policies => no client access
alter table public.reviews               enable row level security;
alter table public.role_requests         enable row level security;
alter table public.users                 enable row level security;
alter table public.wishlist              enable row level security;
alter table public.wishlist_destinations enable row level security;

-- Defense in depth: anon never writes directly, and nobody should TRUNCATE
-- (TRUNCATE is not subject to RLS).
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon;
revoke truncate, references, trigger
  on all tables in schema public from authenticated;

-- -----------------------------------------------------------------------------
-- 4. users
-- -----------------------------------------------------------------------------
create policy users_select_own on public.users
  for select to authenticated
  using (id = (select auth.uid()));

create policy users_select_admin on public.users
  for select to authenticated
  using ((select private.is_admin()));

-- A customer can see the provider profile of their own bookings
create policy users_select_booked_provider on public.users
  for select to authenticated
  using (
    exists (
      select 1 from public.booking b
      where b."providerId" = users.id
        and b."userId" = (select auth.uid())
    )
  );

create policy users_insert_own on public.users
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'user');

create policy users_update_own on public.users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy users_update_admin on public.users
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy users_delete_admin on public.users
  for delete to authenticated
  using ((select private.is_admin()));

-- Only admins (or the backend) may change role / status / email
create or replace function private.guard_user_privileged_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_client_request() or private.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'user';
    new.status := 'active';
    return new;
  end if;

  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.email is distinct from old.email
     or new.id is distinct from old.id then
    raise exception 'Only an admin can change role, status or email'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_user_privileged_columns on public.users;
create trigger guard_user_privileged_columns
  before insert or update on public.users
  for each row execute function private.guard_user_privileged_columns();

-- -----------------------------------------------------------------------------
-- 5. role_requests (user -> provider upgrade requests)
-- -----------------------------------------------------------------------------
create policy role_requests_select on public.role_requests
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy role_requests_insert_own on public.role_requests
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and "roleRequested" = 'provider'
    and reviewer_id is null
    and reviewed_at is null
  );

create policy role_requests_update_admin on public.role_requests
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy role_requests_delete on public.role_requests
  for delete to authenticated
  using (
    (user_id = (select auth.uid()) and status = 'pending')
    or (select private.is_admin())
  );

-- -----------------------------------------------------------------------------
-- 6. Properties: car, apartment, hotel (public read, owner/admin write)
-- -----------------------------------------------------------------------------
create policy car_select_public on public.car
  for select to anon, authenticated using (true);
create policy car_insert on public.car
  for insert to authenticated
  with check (
    (select private.is_admin())
    or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid()))
  );
create policy car_update on public.car
  for update to authenticated
  using ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())))
  with check ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())));
create policy car_delete on public.car
  for delete to authenticated
  using ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())));

create policy apartment_select_public on public.apartment
  for select to anon, authenticated using (true);
create policy apartment_insert on public.apartment
  for insert to authenticated
  with check (
    (select private.is_admin())
    or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid()))
  );
create policy apartment_update on public.apartment
  for update to authenticated
  using ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())))
  with check ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())));
create policy apartment_delete on public.apartment
  for delete to authenticated
  using ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())));

create policy hotel_select_public on public.hotel
  for select to anon, authenticated using (true);
create policy hotel_insert on public.hotel
  for insert to authenticated
  with check (
    (select private.is_admin())
    or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid()))
  );
create policy hotel_update on public.hotel
  for update to authenticated
  using ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())))
  with check ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())));
create policy hotel_delete on public.hotel
  for delete to authenticated
  using ((select private.is_admin()) or ((select private.is_provider_or_admin()) and "providerId" = (select auth.uid())));

-- Cars/apartments created by providers start in 'review' and only an admin
-- (via property request approval) can take them out of review. Apartment
-- rating is set by the admin on approval.
create or replace function private.guard_property_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_client_request() or private.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'review';
    return new;
  end if;

  if old.status::text = 'review' and new.status is distinct from old.status then
    raise exception 'This property is under review and must be approved by an admin'
      using errcode = '42501';
  end if;

  if tg_table_name = 'apartment' and new.rating is distinct from old.rating then
    raise exception 'Only an admin can change the rating'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_property_review on public.car;
create trigger guard_property_review
  before insert or update on public.car
  for each row execute function private.guard_property_review();

drop trigger if exists guard_property_review on public.apartment;
create trigger guard_property_review
  before insert or update on public.apartment
  for each row execute function private.guard_property_review();

-- hotel_images
create policy hotel_images_select_public on public.hotel_images
  for select to anon, authenticated using (true);
create policy hotel_images_insert on public.hotel_images
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (select private.is_admin())
      or private.property_owner('hotel', hotel_id::text) = (select auth.uid())
    )
  );
create policy hotel_images_update on public.hotel_images
  for update to authenticated
  using (created_by = (select auth.uid()) or (select private.is_admin()))
  with check (created_by = (select auth.uid()) or (select private.is_admin()));
create policy hotel_images_delete on public.hotel_images
  for delete to authenticated
  using (created_by = (select auth.uid()) or (select private.is_admin()));

-- monthly_prices (seasonal pricing of a property)
create policy monthly_prices_select_public on public.monthly_prices
  for select to anon, authenticated using (true);
create policy monthly_prices_insert on public.monthly_prices
  for insert to authenticated
  with check ((select private.is_admin()) or private.property_owner(property_type, property_id::text) = (select auth.uid()));
create policy monthly_prices_update on public.monthly_prices
  for update to authenticated
  using ((select private.is_admin()) or private.property_owner(property_type, property_id::text) = (select auth.uid()))
  with check ((select private.is_admin()) or private.property_owner(property_type, property_id::text) = (select auth.uid()));
create policy monthly_prices_delete on public.monthly_prices
  for delete to authenticated
  using ((select private.is_admin()) or private.property_owner(property_type, property_id::text) = (select auth.uid()));

-- property_requests (provider asks admin to publish a property)
create policy property_requests_select on public.property_requests
  for select to authenticated
  using (provider_id = (select auth.uid()) or (select private.is_admin()));
create policy property_requests_insert on public.property_requests
  for insert to authenticated
  with check (
    provider_id = (select auth.uid())
    and status = 'pending'
    and (
      (select private.is_admin())
      or (
        (select private.is_provider_or_admin())
        and private.property_owner(property_type, property_id) = (select auth.uid())
      )
    )
  );
create policy property_requests_update_admin on public.property_requests
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy property_requests_delete_admin on public.property_requests
  for delete to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- 7. booking + payment_transactions
-- -----------------------------------------------------------------------------
create policy booking_select on public.booking
  for select to authenticated
  using (
    "userId" = (select auth.uid())
    or "providerId" = (select auth.uid())
    or (select private.is_admin())
  );

create policy booking_insert_own on public.booking
  for insert to authenticated
  with check (
    "userId" = (select auth.uid())
    and (select private.current_user_role()) is not null -- active (not suspended) account
    and status = 'pending'
    and coalesce(payment_status, 'pending') = 'pending'
    and paid_at is null
    and payment_intent_id is null
    and paypal_order_id is null
    and stripe_payment_intent_id is null
    -- providerId must be the real owner (null for admin-managed properties)
    and "providerId" is not distinct from private.property_owner("propertyType", "propertyId")
  );

create policy booking_update on public.booking
  for update to authenticated
  using (
    "userId" = (select auth.uid())
    or "providerId" = (select auth.uid())
    or (select private.is_admin())
  )
  with check (
    "userId" = (select auth.uid())
    or "providerId" = (select auth.uid())
    or (select private.is_admin())
  );

create policy booking_delete_admin on public.booking
  for delete to authenticated
  using ((select private.is_admin()));

-- Clients may only change status / cancellation reason. Customers may only
-- cancel. Payment fields are written exclusively by edge functions.
create or replace function private.guard_booking_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  allowed_cols constant text[] := array['status', 'updatedAt', 'cancellation_reason'];
begin
  if not private.is_client_request() or private.is_admin() then
    return new;
  end if;

  if (to_jsonb(new) - allowed_cols) is distinct from (to_jsonb(old) - allowed_cols) then
    raise exception 'Only the booking status can be changed'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status
     and old."providerId" is distinct from (select auth.uid())
     and new.status <> 'canceled' then
    raise exception 'Customers can only cancel a booking'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_booking_update on public.booking;
create trigger guard_booking_update
  before update on public.booking
  for each row execute function private.guard_booking_update();

-- Availability: everyone needs to know which dates are taken, but must not
-- see other customers' booking details. Expose only the date ranges.
create or replace function public.get_booked_date_ranges(
  p_property_type text,
  p_property_id text default null,
  p_start date default null,
  p_end date default null
)
returns table ("propertyId" text, "startDate" date, "endDate" date)
language sql
stable
security definer
set search_path = ''
as $$
  select b."propertyId", b."startDate", b."endDate"
  from public.booking b
  where b.status = 'confirmed'
    and b."propertyType" = p_property_type
    and (p_property_id is null or b."propertyId" = p_property_id)
    and (p_end is null or b."startDate" <= p_end)
    and (p_start is null or b."endDate" >= p_start)
$$;
revoke all on function public.get_booked_date_ranges(text, text, date, date) from public;
grant execute on function public.get_booked_date_ranges(text, text, date, date) to anon, authenticated;

-- payment_transactions: written only by edge functions (service_role)
revoke all on public.payment_transactions from anon;
revoke insert, update, delete on public.payment_transactions from authenticated;
create policy payment_transactions_select on public.payment_transactions
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.booking b
      where b.id = payment_transactions.booking_id
        and b."userId" = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 8. Content managed by admins: destination, articles
-- -----------------------------------------------------------------------------
create policy destination_select_public on public.destination
  for select to anon, authenticated using (true);
create policy destination_insert_admin on public.destination
  for insert to authenticated with check ((select private.is_admin()));
create policy destination_update_admin on public.destination
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy destination_delete_admin on public.destination
  for delete to authenticated using ((select private.is_admin()));

create policy articles_select_public on public.articles
  for select to anon, authenticated using (true);
create policy articles_insert_admin on public.articles
  for insert to authenticated with check ((select private.is_admin()));
create policy articles_update_admin on public.articles
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy articles_delete_admin on public.articles
  for delete to authenticated using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- 9. reviews, wishlist
-- -----------------------------------------------------------------------------
create policy reviews_select_public on public.reviews
  for select to anon, authenticated using (true);
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy reviews_update_own on public.reviews
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy reviews_delete on public.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy wishlist_own on public.wishlist
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy wishlist_destinations_own on public.wishlist_destinations
  for all to authenticated
  using (
    exists (
      select 1 from public.wishlist w
      where w.id = wishlist_destinations.wishlist_id
        and w.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.wishlist w
      where w.id = wishlist_destinations.wishlist_id
        and w.user_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 10. Support chat
-- -----------------------------------------------------------------------------
create policy chat_conversations_select on public.chat_conversations
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy chat_conversations_insert_own on public.chat_conversations
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy chat_conversations_update on public.chat_conversations
  for update to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy chat_messages_select on public.chat_messages
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.chat_conversations c
      where c.id = chat_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );
-- Users post as 'user' in their own conversation; only admins post as 'admin'
create policy chat_messages_insert on public.chat_messages
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      ((select private.is_admin()) and role = 'admin')
      or (
        role = 'user'
        and exists (
          select 1 from public.chat_conversations c
          where c.id = chat_messages.conversation_id
            and c.user_id = (select auth.uid())
        )
      )
    )
  );
create policy chat_messages_update on public.chat_messages
  for update to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.chat_conversations c
      where c.id = chat_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    (select private.is_admin())
    or exists (
      select 1 from public.chat_conversations c
      where c.id = chat_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );
-- Clients only ever mark messages as read; they cannot edit message text
revoke update on public.chat_messages from authenticated;
grant update (is_read) on public.chat_messages to authenticated;

-- -----------------------------------------------------------------------------
-- 11. Functions: fixed search_path, no public RPC for trigger functions
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.update_conversation_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.chat_conversations
  set updated_at = now(),
      last_message_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;
revoke execute on function public.update_conversation_timestamp() from public, anon, authenticated;

alter function public.update_property_requests_updated_at() set search_path = '';
revoke execute on function public.update_property_requests_updated_at() from public, anon, authenticated;

alter function public.get_top_destinations_by_category() set search_path = public, pg_temp;

-- -----------------------------------------------------------------------------
-- 12. Storage
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public to read 1f678hd_0" on storage.objects;
drop policy if exists "Allow public to read 1f678hd_1" on storage.objects;
drop policy if exists "Allow public to read 1f678hd_2" on storage.objects;
drop policy if exists "Allow public to read 1f678hd_3" on storage.objects;
drop policy if exists allow_insert_useravatar_authenticated on storage.objects;

-- hotel-images: property photos (all property types). Public bucket, so files
-- are served by public URL; only providers/admins can upload, only the
-- uploader or an admin can change/delete. (SELECT is required by remove().)
create policy property_images_select on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'hotel-images');
create policy property_images_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'hotel-images' and (select private.is_provider_or_admin()));
create policy property_images_update on storage.objects
  for update to authenticated
  using (bucket_id = 'hotel-images' and (owner_id = (select auth.uid())::text or (select private.is_admin())))
  with check (bucket_id = 'hotel-images' and (owner_id = (select auth.uid())::text or (select private.is_admin())));
create policy property_images_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'hotel-images' and (owner_id = (select auth.uid())::text or (select private.is_admin())));

-- userAvatar: any signed-in user uploads; only the uploader (or admin) deletes
create policy avatars_select on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'userAvatar');
create policy avatars_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'userAvatar');
create policy avatars_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'userAvatar' and (owner_id = (select auth.uid())::text or (select private.is_admin())))
  with check (bucket_id = 'userAvatar' and (owner_id = (select auth.uid())::text or (select private.is_admin())));
create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'userAvatar' and (owner_id = (select auth.uid())::text or (select private.is_admin())));

-- Only images, bounded size
update storage.buckets
set allowed_mime_types = array['image/*'],
    file_size_limit = 10485760 -- 10 MB
where id = 'hotel-images';

update storage.buckets
set allowed_mime_types = array['image/*']
where id = 'userAvatar';
