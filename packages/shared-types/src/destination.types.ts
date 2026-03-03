import { User } from "./user.types";

/** A record of translations keyed by locale code (e.g. "en", "sq", "it", "fr") */
export type TranslatedField = Record<string, string>;

export interface Destination {
  id: string;
  name: TranslatedField;
  description: TranslatedField;
  imageUrls: string[];
  category: string;
  lat?: number;
  lng?: number;
}

export interface DestinationDto {
  name: TranslatedField;
  description: TranslatedField;
  imageUrls: string[];
  category: string;
  lat?: number;
  lng?: number;
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
