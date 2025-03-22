/**
 * Aircraft Manager for SkyTycoon
 * This file contains utility functions for aircraft management
 */

// Available aircraft to purchase in the game
export const availableAircraft = [
  {
    id: "a320neo",
    name: "Airbus A320neo",
    manufacturer: "Airbus",
    range: 6300, // Range in kilometers
    speed: 828, // Cruising speed in km/h
    fuelEfficiency: 2.4, // Lower is better - liters per passenger per 100km
    purchasePrice: 110000000, // $110 million
    maintenanceCost: 3200, // Per flight hour
    configurations: [
      {
        id: 0,
        name: "All Economy",
        capacity: 180,
        premium: false,
        seats: {
          economy: 180,
          premium: 0,
          business: 0,
          first: 0
        }
      },
      {
        id: 1,
        name: "Mixed Cabin",
        capacity: 150,
        premium: true,
        seats: {
          economy: 126,
          premium: 12,
          business: 12,
          first: 0
        }
      },
      {
        id: 2,
        name: "Business Focus",
        capacity: 120,
        premium: true,
        seats: {
          economy: 60,
          premium: 24,
          business: 30,
          first: 6
        }
      }
    ]
  },
  {
    id: "a330-300",
    name: "Airbus A330-300",
    manufacturer: "Airbus",
    range: 11000, // Range in kilometers
    speed: 871, // Cruising speed in km/h
    fuelEfficiency: 2.9, // Lower is better - liters per passenger per 100km
    purchasePrice: 260000000, // $260 million
    maintenanceCost: 7800, // Per flight hour
    configurations: [
      {
        id: 0,
        name: "All Economy",
        capacity: 440,
        premium: false,
        seats: {
          economy: 440,
          premium: 0,
          business: 0,
          first: 0
        }
      },
      {
        id: 1,
        name: "Two Class",
        capacity: 330,
        premium: true,
        seats: {
          economy: 270,
          premium: 0,
          business: 60,
          first: 0
        }
      },
      {
        id: 2,
        name: "Three Class",
        capacity: 270,
        premium: true,
        seats: {
          economy: 180,
          premium: 48,
          business: 30,
          first: 12
        }
      }
    ]
  }
];

// Hub registration prefixes
export const hubRegistrationPrefixes: Record<string, string> = {
  'SYD': 'VH-',
  'JFK': 'N',
  'LHR': 'G-',
  'CDG': 'F-',
  'DXB': 'A6-',
  'HND': 'JA-',
  'SIN': '9V-',
  'FRA': 'D-',
  'AMS': 'PH-',
  'ICN': 'HL-',
  'ATL': 'N',
  'MIA': 'N',
  'SFO': 'N',
  'PEK': 'B-',
  'PVG': 'B-',
  'GRU': 'PP-',
  'MAN': 'G-',
  'ORY': 'F-'
};

// Generate a unique aircraft registration number
export function generateRegistration(hubCode: string): string {
  // Get the prefix for the hub
  const prefix = hubRegistrationPrefixes[hubCode] || 'X-';
  
  // Generate random letters for the registration
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let registration = '';
  
  // For US registrations (N-prefix), use a different format
  if (prefix === 'N') {
    registration = prefix + Math.floor(Math.random() * 9000 + 1000);
  } else {
    // Generate 3 random letters
    for (let i = 0; i < 3; i++) {
      registration += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    registration = prefix + registration;
  }
  
  return registration;
}

// Calculate operational costs for an aircraft
export function calculateOperationalCosts(aircraft: any): number {
  // Base daily cost depends on aircraft size
  const baseDaily = aircraft.maintenanceCost || 5000;
  
  // Additional costs based on aircraft age and configuration
  const ageMultiplier = aircraft.age ? 1 + (aircraft.age * 0.05) : 1;
  
  // Premium configuration costs more to maintain
  const configMultiplier = aircraft.hasPremiumSeating ? 1.2 : 1;
  
  return baseDaily * ageMultiplier * configMultiplier;
}

// Calculate flight time between two points
export function calculateFlightTime(
  distance: number, 
  aircraftSpeed: number
): number {
  // Base flight time calculation
  let flightHours = distance / aircraftSpeed;
  
  // Add time for taxiing, takeoff, landing, etc.
  const groundTimeHours = 0.5; // 30 minutes
  
  return flightHours + groundTimeHours;
}

// Calculate distance between two points on Earth using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

// Helper function: Convert degrees to radians
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}