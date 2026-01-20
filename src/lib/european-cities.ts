// European cities available for event filtering
export const EUROPEAN_CITIES = [
  // Norway
  { city: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522 },
  { city: "Bergen", country: "Norway", lat: 60.3913, lng: 5.3221 },
  { city: "Trondheim", country: "Norway", lat: 63.4305, lng: 10.3951 },
  { city: "Stavanger", country: "Norway", lat: 58.9700, lng: 5.7331 },
  { city: "Tromsø", country: "Norway", lat: 69.6496, lng: 18.9560 },
  { city: "Kristiansand", country: "Norway", lat: 58.1599, lng: 8.0182 },
  // Nordic
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { city: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 },
  { city: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384 },
  { city: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426 },
  // Major European
  { city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { city: "Munich", country: "Germany", lat: 48.1351, lng: 11.5820 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Brussels", country: "Belgium", lat: 50.8503, lng: 4.3517 },
  { city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  { city: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417 },
  { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "Milan", country: "Italy", lat: 45.4642, lng: 9.1900 },
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
  { city: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
] as const;

export type EuropeanCity = typeof EUROPEAN_CITIES[number];
