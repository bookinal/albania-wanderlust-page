export const ALBANIAN_CITIES = [
  "Tirana",
  "Durrës",
  "Vlorë",
  "Shkodër",
  "Elbasan",
  "Korçë",
  "Fier",
  "Berat",
  "Lushnjë",
  "Pogradec",
  "Kavajë",
  "Gjirokastër",
  "Sarandë",
  "Kukës",
  "Lezhë",
  "Peshkopi",
  "Burrel",
  "Çorovodë",
  "Librazhd",
  "Permet",
  "Himarë",
  "Ksamil",
  "Theth",
] as const;

export const TIRANA_AIRPORT = "Tirana International Airport";

/** Car pick-up locations: the airport first (default), then the cities. */
export const CAR_PICKUP_LOCATIONS = [TIRANA_AIRPORT, ...ALBANIAN_CITIES] as const;

export const DEFAULT_CAR_PICKUP_LOCATION = TIRANA_AIRPORT;

/** Approximate coordinates of each pick-up location (used for the car's map pin). */
export const CAR_PICKUP_LOCATION_COORDS: Record<
  (typeof CAR_PICKUP_LOCATIONS)[number],
  { lat: number; lng: number }
> = {
  [TIRANA_AIRPORT]: { lat: 41.4147, lng: 19.7206 },
  Tirana: { lat: 41.3275, lng: 19.8187 },
  Durrës: { lat: 41.3231, lng: 19.4414 },
  Vlorë: { lat: 40.4686, lng: 19.4914 },
  Shkodër: { lat: 42.0683, lng: 19.5126 },
  Elbasan: { lat: 41.1125, lng: 20.0822 },
  Korçë: { lat: 40.6186, lng: 20.7808 },
  Fier: { lat: 40.7239, lng: 19.5561 },
  Berat: { lat: 40.7058, lng: 19.9522 },
  Lushnjë: { lat: 40.9419, lng: 19.705 },
  Pogradec: { lat: 40.9025, lng: 20.6525 },
  Kavajë: { lat: 41.1856, lng: 19.5569 },
  Gjirokastër: { lat: 40.0758, lng: 20.1389 },
  Sarandë: { lat: 39.8756, lng: 20.0053 },
  Kukës: { lat: 42.0769, lng: 20.4219 },
  Lezhë: { lat: 41.7836, lng: 19.6436 },
  Peshkopi: { lat: 41.685, lng: 20.4289 },
  Burrel: { lat: 41.6103, lng: 20.0089 },
  Çorovodë: { lat: 40.5042, lng: 20.2272 },
  Librazhd: { lat: 41.1797, lng: 20.3156 },
  Permet: { lat: 40.2342, lng: 20.3517 },
  Himarë: { lat: 40.1017, lng: 19.7447 },
  Ksamil: { lat: 39.7686, lng: 20.0003 },
  Theth: { lat: 42.3956, lng: 19.7742 },
};

export const getPickupLocationCoords = (location: string) =>
  CAR_PICKUP_LOCATION_COORDS[location as (typeof CAR_PICKUP_LOCATIONS)[number]];
