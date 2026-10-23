-- Fix: "permission denied for schema private" in edge functions.
--
-- 20261019083105_harden_rls_and_roles.sql put the RLS helpers and the guard
-- triggers (booking, users, car, apartment) in the private schema, but only
-- granted it to anon/authenticated. Edge functions connect as service_role,
-- so every UPDATE they make on those tables fails inside the guard trigger
-- (e.g. create-paypal-order saving the PayPal order id on the booking).
--
-- The guards already let service_role through (private.is_client_request()
-- is false for it); it just needs to be allowed to call them.

grant usage on schema private to service_role;
grant execute on all functions in schema private to service_role;

-- Functions added to private later get the same grant
alter default privileges in schema private
  grant execute on functions to service_role;
