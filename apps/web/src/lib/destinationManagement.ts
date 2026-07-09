export const CATEGORIES = [
  { id: "Destinations", label: "Destinations" },
  { id: "Eat, drink & dance", label: "Eat, drink & dance" },
  { id: "History & culture", label: "History & culture" },
  { id: "Experiences", label: "Experiences" },
];

export interface QuickFactField {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
}

export const QUICK_FACT_FIELDS: QuickFactField[] = [
  { key: "rating", label: "Rating", placeholder: "e.g. 4.8", type: "number", step: "0.1", min: "0", max: "5" },
  { key: "location", label: "Location", placeholder: "Select a city..." },
  { key: "beachType", label: "Beach Type", placeholder: "Pebble beach, sandy cove..." },
  { key: "water", label: "Water", placeholder: "Crystal clear, turquoise, calm..." },
  { key: "bestFor", label: "Best For", placeholder: "Families, couples, snorkeling..." },
  { key: "cuisineType", label: "Cuisine Type", placeholder: "Local, Mediterranean, international..." },
  { key: "howToBook", label: "How to Book", placeholder: "Steps to book this destination..." },
  { key: "crowdLevel", label: "Crowd Level", placeholder: "Quiet, moderate, lively..." },
  { key: "bestMonths", label: "Best Months", placeholder: "May - September" },
  { key: "priceLevel", label: "Price Level", placeholder: "Budget, mid-range, premium..." },

  { key: "region", label: "Region", placeholder: "e.g. Southern Albania, Albanian Riviera..." },
  { key: "destinationType", label: "Destination Type", placeholder: "e.g. Beach, Mountain, City..." },
  { key: "founded", label: "Founded", placeholder: "e.g. 6th century BC, 1920..." },
  { key: "population", label: "Population", placeholder: "e.g. 85,000" },
  { key: "elevation", label: "Elevation", placeholder: "e.g. 1,200 m" },
  { key: "heritageStatus", label: "Heritage Status", placeholder: "e.g. UNESCO World Heritage..." },
  { key: "duration", label: "Duration", placeholder: "e.g. 2-3 hours, Full day..." },
  { key: "activities", label: "Activities", placeholder: "e.g. Hiking, swimming, birdwatching..." },
  { key: "highlight", label: "Highlight", placeholder: "e.g. Panoramic views, ancient mosaics..." },
  { key: "difficultyLevel", label: "Difficulty Level", placeholder: "e.g. Easy, Moderate, Hard..." },
];

export const SUBCATEGORIES = [
  // Destinations
  {
    id: "Top cities & villages",
    label: "Top cities & villages",
    parent: "Destinations",
  },
  { id: "Mountains", label: "Mountains", parent: "Destinations" },
  { id: "Beach", label: "Beach", parent: "Destinations" },
  { id: "Lakes & canyons", label: "Lakes & canyons", parent: "Destinations" },

  // Eat, drink & dance
  { id: "Restaurants", label: "Restaurants", parent: "Eat, drink & dance" },
  { id: "Bars", label: "Bars", parent: "Eat, drink & dance" },
  { id: "Pubs", label: "Pubs", parent: "Eat, drink & dance" },
  { id: "Clubs", label: "Clubs", parent: "Eat, drink & dance" },

  // History & culture
  {
    id: "Historical & archeological sites",
    label: "Historical & archeological sites",
    parent: "History & culture",
  },
  {
    id: "Museums & galleries",
    label: "Museums & galleries",
    parent: "History & culture",
  },
  { id: "UNESCO sites", label: "UNESCO sites", parent: "History & culture" },
  {
    id: "Not defined yet (History)",
    label: "Not defined yet",
    parent: "History & culture",
  },

  // Experiences
  {
    id: "Breathtaking/Adventure",
    label: "Breathtaking/Adventure",
    parent: "Experiences",
  },
  { id: "Sea activities", label: "Sea activities", parent: "Experiences" },
  { id: "On high altitude", label: "On high altitude", parent: "Experiences" },
  {
    id: "Not defined yet (Experiences)",
    label: "Not defined yet",
    parent: "Experiences",
  },
];
