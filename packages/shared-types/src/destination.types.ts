import { User } from "./user.types";

/** A record of translations keyed by locale code (e.g. "en", "sq", "it", "fr") */
export type TranslatedField = Record<string, string>;

export interface DestinationVisitorTip {
  icon: string;
  title: string;
  description: string;
}

export interface DestinationContact {
  instagram?: string;
  facebook?: string;
  website?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  tripadvisor?: string;
  bookingUrl?: string;
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
  cuisineType?: string;
  howToBook?: string;
  bestFor?: string;
  crowdLevel?: string;
  bestMonths?: string;
  priceLevel?: string;
  byCar?: string;
  byFoot?: string;
  byBoat?: string;
  rating?: number;
  region?: string;
  destinationType?: string;
  founded?: string;
  population?: string;
  elevation?: string;
  heritageStatus?: string;
  duration?: string;
  activities?: string;
  highlight?: string;
  difficultyLevel?: string;
  visitorTips?: DestinationVisitorTip[];
  contact?: DestinationContact;
  nearbyDestinations?: Destination[];
  historicalPeriod?: string;
  siteType?: string;
  museumType?: string;
  established?: number;
  admission?: string;
  yearInscribed?: number;
  activityType?: string;
  eventType?: string;
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
  cuisineType?: string;
  howToBook?: string;
  bestFor?: string;
  crowdLevel?: string;
  bestMonths?: string;
  priceLevel?: string;
  byCar?: string;
  byFoot?: string;
  byBoat?: string;
  rating?: number;
  region?: string;
  destinationType?: string;
  founded?: string;
  population?: string;
  elevation?: string;
  heritageStatus?: string;
  duration?: string;
  activities?: string;
  highlight?: string;
  difficultyLevel?: string;
  visitorTips?: DestinationVisitorTip[];
  contact?: DestinationContact;
  nearbyDestinationIds?: string[];
  historicalPeriod?: string;
  siteType?: string;
  museumType?: string;
  established?: number;
  admission?: string;
  yearInscribed?: number;
  activityType?: string;
  eventType?: string;
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
