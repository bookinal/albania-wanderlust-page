-- Rental conditions set by the provider for each car.
--
--   depositAmount          security deposit required at pick-up (EUR, 0 = none)
--   dailyKmLimit           kilometres allowed per day (NULL = unlimited)
--   minimumAge             minimum driver age
--   drivingLicenseYears    driving licence held for at least N years
--   fuelPolicy             full_to_full | same_to_same | pre_purchase
--   crossBorderDeposit     extra deposit to take the car abroad (EUR, 0 = none)
--   crossBorderAssistance  roadside assistance available abroad
--   acceptedPaymentMethods payment types accepted at pick-up: cash | debit_card | credit_card
--
-- Existing cars get the defaults below; providers can then edit them from the dashboard.

ALTER TABLE public.car
  ADD COLUMN IF NOT EXISTS "depositAmount" numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "dailyKmLimit" integer,
  ADD COLUMN IF NOT EXISTS "minimumAge" integer NOT NULL DEFAULT 21,
  ADD COLUMN IF NOT EXISTS "drivingLicenseYears" integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "fuelPolicy" text NOT NULL DEFAULT 'full_to_full',
  ADD COLUMN IF NOT EXISTS "crossBorderDeposit" numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "crossBorderAssistance" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "acceptedPaymentMethods" text[] NOT NULL DEFAULT ARRAY['cash']::text[];

ALTER TABLE public.car
  DROP CONSTRAINT IF EXISTS car_deposit_amount_check,
  DROP CONSTRAINT IF EXISTS car_daily_km_limit_check,
  DROP CONSTRAINT IF EXISTS car_minimum_age_check,
  DROP CONSTRAINT IF EXISTS car_driving_license_years_check,
  DROP CONSTRAINT IF EXISTS car_fuel_policy_check,
  DROP CONSTRAINT IF EXISTS car_cross_border_deposit_check,
  DROP CONSTRAINT IF EXISTS car_accepted_payment_methods_check;

ALTER TABLE public.car
  ADD CONSTRAINT car_deposit_amount_check
    CHECK ("depositAmount" >= 0),
  ADD CONSTRAINT car_daily_km_limit_check
    CHECK ("dailyKmLimit" IS NULL OR "dailyKmLimit" > 0),
  ADD CONSTRAINT car_minimum_age_check
    CHECK ("minimumAge" BETWEEN 18 AND 99),
  ADD CONSTRAINT car_driving_license_years_check
    CHECK ("drivingLicenseYears" BETWEEN 0 AND 50),
  ADD CONSTRAINT car_fuel_policy_check
    CHECK ("fuelPolicy" IN ('full_to_full', 'same_to_same', 'pre_purchase')),
  ADD CONSTRAINT car_cross_border_deposit_check
    CHECK ("crossBorderDeposit" >= 0),
  ADD CONSTRAINT car_accepted_payment_methods_check
    CHECK (
      cardinality("acceptedPaymentMethods") > 0
      AND "acceptedPaymentMethods" <@ ARRAY['cash', 'debit_card', 'credit_card']::text[]
    );
