// Types
// Export apartment types (includes PaginationParams)
export * from "./apartment.type";
export * from "./booking.type";
// Exclude duplicate PaginationParams from car.types
export {
  type Car,
  type CarFilters,
  type CreateCarDto,
  type UpdateCarDto,
} from "./car.types";
export * from "./chat.types";
export * from "./destination.types";
export * from "./email.types";
// Exclude duplicate PaginationParams from hotel.types
export {
  type Hotel,
  type HotelFilters,
  type CreateHotelDto,
  type UpdateHotelDto,
} from "./hotel.types";
export * from "./price.type";
export * from "./request.type";
export * from "./review.type";
export * from "./search.types";
export * from "./user.types";
