export const CATEGORIES = [
  { id: "Destinations", label: "Destinations" },
  { id: "Eat, drink & dance", label: "Eat, drink & dance" },
  { id: "History & culture", label: "History & culture" },
  { id: "Experiences", label: "Experiences" },
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
