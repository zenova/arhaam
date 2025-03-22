/**
 * Formats a currency value to a readable string
 * @param value The numeric value to format
 * @returns A string with formatted currency
 */
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

/**
 * Calculates the great-circle distance between two points on Earth
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

/**
 * Converts degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates the estimated flight time based on distance
 * @param distance Distance in kilometers
 * @returns Flight time in minutes
 */
export function calculateFlightTime(distance: number): number {
  // Average cruising speed of commercial aircraft is about 850 km/h
  // Add 30 minutes for takeoff and landing
  const cruisingSpeed = 850; // km/h
  const takeoffLandingTime = 30; // minutes
  
  const cruisingTimeHours = distance / cruisingSpeed;
  const cruisingTimeMinutes = cruisingTimeHours * 60;
  
  return Math.round(cruisingTimeMinutes + takeoffLandingTime);
}

/**
 * Formats a time string for display
 * @param timeStr Time string in HH:MM format
 * @returns Formatted time string
 */
export function formatTimeForDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Calculates the weekly operating cost for an aircraft
 * @param model Aircraft model
 * @param capacity Number of seats
 * @returns Weekly operating cost
 */
export function calculateWeeklyOperatingCost(model: string, capacity: number): number {
  // Base costs differ by model
  const baseCostPerSeat = model.includes('A320') ? 1500 : 1800;
  
  // Multiply by capacity and adjust for random variation (+/- 10%)
  const variation = 0.9 + (Math.random() * 0.2);
  return Math.round(baseCostPerSeat * capacity * variation);
}

/**
 * Calculates expected revenue for a flight
 * @param capacity Aircraft capacity
 * @param demand Route demand (percentage)
 * @param distance Flight distance
 * @returns Expected revenue
 */
export function calculateExpectedRevenue(capacity: number, demand: number, distance: number): number {
  // Base fare increases with distance
  const baseFarePerKm = 0.12; // $ per km
  const baseFare = Math.max(100, baseFarePerKm * distance);
  
  // Calculate expected bookings
  const bookingRate = (demand / 100) * (0.7 + Math.random() * 0.25);
  const bookedPassengers = Math.floor(capacity * bookingRate);
  
  // Calculate total revenue
  return Math.round(bookedPassengers * baseFare);
}
