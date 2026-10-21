import type {
  CarPaymentMethod,
  CarRentalTerms,
  FuelPolicy,
} from "@/types/car.types";

export const FUEL_POLICIES: FuelPolicy[] = [
  "full_to_full",
  "same_to_same",
  "pre_purchase",
];

export const CAR_PAYMENT_METHODS: CarPaymentMethod[] = [
  "cash",
  "debit_card",
  "credit_card",
];

/** Same defaults as the car table columns (see the add_car_rental_terms migration). */
export const DEFAULT_CAR_RENTAL_TERMS: CarRentalTerms = {
  depositAmount: 0,
  dailyKmLimit: null,
  minimumAge: 21,
  drivingLicenseYears: 1,
  fuelPolicy: "full_to_full",
  crossBorderDeposit: 0,
  crossBorderAssistance: false,
  acceptedPaymentMethods: ["cash"],
};

/** Picks the rental terms out of a car, filling gaps with the defaults. */
export const getCarRentalTerms = (
  car: Partial<CarRentalTerms> | null | undefined,
): CarRentalTerms => ({
  // numeric columns: coerce in case they arrive as strings
  depositAmount: Number(car?.depositAmount ?? DEFAULT_CAR_RENTAL_TERMS.depositAmount),
  dailyKmLimit: car?.dailyKmLimit ?? DEFAULT_CAR_RENTAL_TERMS.dailyKmLimit,
  minimumAge: car?.minimumAge ?? DEFAULT_CAR_RENTAL_TERMS.minimumAge,
  drivingLicenseYears:
    car?.drivingLicenseYears ?? DEFAULT_CAR_RENTAL_TERMS.drivingLicenseYears,
  fuelPolicy: car?.fuelPolicy ?? DEFAULT_CAR_RENTAL_TERMS.fuelPolicy,
  crossBorderDeposit: Number(
    car?.crossBorderDeposit ?? DEFAULT_CAR_RENTAL_TERMS.crossBorderDeposit,
  ),
  crossBorderAssistance:
    car?.crossBorderAssistance ?? DEFAULT_CAR_RENTAL_TERMS.crossBorderAssistance,
  acceptedPaymentMethods: car?.acceptedPaymentMethods?.length
    ? car.acceptedPaymentMethods
    : DEFAULT_CAR_RENTAL_TERMS.acceptedPaymentMethods,
});

/** Returns a translation key of the first invalid field, or null when valid. */
export const validateCarRentalTerms = (terms: CarRentalTerms): string | null => {
  if (terms.depositAmount < 0 || terms.crossBorderDeposit < 0) {
    return "cars.rentalTerms.validation.negativeAmount";
  }
  if (terms.dailyKmLimit !== null && terms.dailyKmLimit <= 0) {
    return "cars.rentalTerms.validation.kmLimit";
  }
  if (terms.minimumAge < 18 || terms.minimumAge > 99) {
    return "cars.rentalTerms.validation.minimumAge";
  }
  if (terms.drivingLicenseYears < 0 || terms.drivingLicenseYears > 50) {
    return "cars.rentalTerms.validation.licenseYears";
  }
  if (terms.acceptedPaymentMethods.length === 0) {
    return "cars.rentalTerms.validation.paymentMethods";
  }
  return null;
};
