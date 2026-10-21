-- Drop the legacy fixed insurance price from the car table.
-- Added by 20260716094500_add_insurance_to_car.sql; replaced by insurance plans
-- (20261021120000_add_insurance_plans.sql): the client now picks a plan and pays
-- its price per rental day, saved on the booking ("insuranceTotal").
--
-- Deploy the app code that no longer reads/writes car.insurance BEFORE running this.

ALTER TABLE public.car
  DROP COLUMN IF EXISTS insurance;
