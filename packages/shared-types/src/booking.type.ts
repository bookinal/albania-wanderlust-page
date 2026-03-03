/**
 * Booking Type Definitions
 *
 * TypeScript interfaces for booking data models and API operations
 */

import { Car } from "./car.types";
import { Apartment } from "./apartment.type";
import { Hotel } from "./hotel.types";

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  providerId: string;
  propertyType: "hotel" | "apartment" | "car";
  startDate: string;
  endDate: string;
  pickUpLocation?: string;
  dropOffLocation?: string;
  pickUpTime?: string;
  dropOffTime?: string;
  totalPrice: number;
  contactMail: string;
  contactPhone: string;
  requesterName: string;
  status: "pending" | "confirmed" | "canceled" | "completed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_intent_id?: string;
  paypal_order_id?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  createdAt: string;
  updatedAt: string;
  propertyData?: Car | Apartment | Hotel | null;
}

export interface CreateBookingDto {
  propertyId: string;
  providerId: string;
  propertyType: "hotel" | "apartment" | "car";
  startDate: string;
  endDate: string;
  pickUpLocation?: string;
  dropOffLocation?: string;
  pickUpTime?: string;
  dropOffTime?: string;
  totalPrice: number;
  contactMail: string;
  contactPhone: string;
  requesterName: string;
}
