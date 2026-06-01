import { User } from "./user.types";

/** A record of translations keyed by locale code (e.g. "en", "sq", "it", "fr") */
export type TranslatedField = Record<string, string>;

export interface DestinationVisitorTip {
  icon: string;
  title: string;
  description: string;
}

export interface Destination {
  id: string;
  name: TranslatedField;
  description: TranslatedField;
  imageUrls: string[];
  category: string;
  subcategory?: string;
  lat?: number;
  lng?: number;
  location?: string;
  beachType?: string;
  water?: string;
  bestFor?: string;
  crowdLevel?: string;
  bestMonths?: string;
  priceLevel?: string;
  byCar?: string;
  byFoot?: string;
  byBoat?: string;
  rating?: number;
  visitorTips?: DestinationVisitorTip[];
}

export interface DestinationDto {
  name: TranslatedField;
  description: TranslatedField;
  imageUrls: string[];
  category: string;
  subcategory?: string;
  lat?: number;
  lng?: number;
  location?: string;
  beachType?: string;
  water?: string;
  bestFor?: string;
  crowdLevel?: string;
  bestMonths?: string;
  priceLevel?: string;
  byCar?: string;
  byFoot?: string;
  byBoat?: string;
  rating?: number;
  visitorTips?: DestinationVisitorTip[];
}

export interface Wishlist {
  id: string;
  destinations: Destination[];
  user: User;
}

export interface WishlistDto {
  destinations: Destination[];
  user: User;
}
