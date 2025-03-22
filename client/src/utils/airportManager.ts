/**
 * Airport Manager for SkyTycoon
 * This file contains utility functions for airport and route management
 */

import { calculateDistance } from './aircraftManager';

// Available hub airports for selection
export const availableHubs = [
  "JFK", // New York
  "LHR", // London
  "CDG", // Paris
  "FRA", // Frankfurt
  "DXB", // Dubai
  "SIN", // Singapore
  "HND", // Tokyo
  "SYD", // Sydney
  "ICN", // Seoul
  "GRU", // São Paulo
  "ATL", // Atlanta
  "SFO", // San Francisco
  "PEK", // Beijing
  "PVG", // Shanghai
  "AMS", // Amsterdam
  "MIA", // Miami
  "MAN", // Manchester
  "ORY"  // Paris Orly
];

// Detailed hub information
export interface AirportHub {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  demand: number; // Demand rating from 1-10
  fees: number; // Landing/takeoff fees per plane
  slots: number; // Available slots for flights
}

// Hub details lookup
export const hubDetails: Record<string, AirportHub> = {
  JFK: {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "USA",
    lat: 40.6413,
    lon: -73.7781,
    demand: 9,
    fees: 25000,
    slots: 100
  },
  LHR: {
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    lat: 51.4700,
    lon: -0.4543,
    demand: 10,
    fees: 27000,
    slots: 95
  },
  CDG: {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    lat: 49.0097,
    lon: 2.5479,
    demand: 8,
    fees: 23000,
    slots: 90
  },
  FRA: {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    lat: 50.0379,
    lon: 8.5622,
    demand: 8,
    fees: 22000,
    slots: 88
  },
  DXB: {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "UAE",
    lat: 25.2532,
    lon: 55.3657,
    demand: 9,
    fees: 26000,
    slots: 105
  },
  SIN: {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    lat: 1.3644,
    lon: 103.9915,
    demand: 8,
    fees: 24000,
    slots: 92
  },
  HND: {
    code: "HND",
    name: "Tokyo Haneda Airport",
    city: "Tokyo",
    country: "Japan",
    lat: 35.5494,
    lon: 139.7798,
    demand: 9,
    fees: 25000,
    slots: 94
  },
  SYD: {
    code: "SYD",
    name: "Sydney Airport",
    city: "Sydney",
    country: "Australia",
    lat: -33.9399,
    lon: 151.1753,
    demand: 7,
    fees: 21000,
    slots: 85
  },
  ICN: {
    code: "ICN",
    name: "Incheon International Airport",
    city: "Seoul",
    country: "South Korea",
    lat: 37.4602,
    lon: 126.4407,
    demand: 8,
    fees: 22000,
    slots: 88
  },
  GRU: {
    code: "GRU",
    name: "São Paulo–Guarulhos International Airport",
    city: "São Paulo",
    country: "Brazil",
    lat: -23.4356,
    lon: -46.4731,
    demand: 7,
    fees: 20000,
    slots: 82
  },
  ATL: {
    code: "ATL",
    name: "Hartsfield–Jackson Atlanta International Airport",
    city: "Atlanta",
    country: "USA",
    lat: 33.6407,
    lon: -84.4277,
    demand: 8,
    fees: 22000,
    slots: 120
  },
  SFO: {
    code: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    country: "USA",
    lat: 37.6213,
    lon: -122.3790,
    demand: 8,
    fees: 23000,
    slots: 90
  },
  PEK: {
    code: "PEK",
    name: "Beijing Capital International Airport",
    city: "Beijing",
    country: "China",
    lat: 40.0799,
    lon: 116.6031,
    demand: 9,
    fees: 23000,
    slots: 95
  },
  PVG: {
    code: "PVG",
    name: "Shanghai Pudong International Airport",
    city: "Shanghai",
    country: "China",
    lat: 31.1443,
    lon: 121.8083,
    demand: 8,
    fees: 22000,
    slots: 90
  },
  AMS: {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.3105,
    lon: 4.7683,
    demand: 8,
    fees: 22000,
    slots: 88
  },
  MIA: {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "USA",
    lat: 25.7932,
    lon: -80.2906,
    demand: 7,
    fees: 21000,
    slots: 85
  },
  MAN: {
    code: "MAN",
    name: "Manchester Airport",
    city: "Manchester",
    country: "United Kingdom",
    lat: 53.3588,
    lon: -2.2727,
    demand: 6,
    fees: 19000,
    slots: 78
  },
  ORY: {
    code: "ORY",
    name: "Paris Orly Airport",
    city: "Paris",
    country: "France",
    lat: 48.7262,
    lon: 2.3652,
    demand: 7,
    fees: 20000,
    slots: 80
  }
};

// Airline route interface
export interface AirlineRoute {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  demand: number; // Percentage 0-100
  flightTime: number; // In hours
  fare: {
    economy: number;
    premium: number;
    business: number;
    first: number;
  };
  competition: number; // 0-10 where 10 is high competition
}

// Calculate route demand based on origin and destination
export function calculateRouteDemand(origin: string, destination: string): number {
  // Get demand factors from the hub details
  const originHub = hubDetails[origin];
  const destHub = hubDetails[destination];
  
  if (!originHub || !destHub) {
    return 50; // Default 50% if we don't have data
  }
  
  // Calculate base demand based on hub demand ratings
  const baseRouteDemand = (originHub.demand + destHub.demand) * 5; // 0-100 scale
  
  // Apply adjustments based on distance
  const distance = calculateDistance(originHub.lat, originHub.lon, destHub.lat, destHub.lon);
  let distanceMultiplier = 1.0;
  
  // Short routes (< 1000km) get a boost for business travel
  if (distance < 1000) {
    distanceMultiplier = 1.2;
  } 
  // Very long routes (> 8000km) get a slight penalty
  else if (distance > 8000) {
    distanceMultiplier = 0.9;
  }
  
  // Apply competition factor
  const competition = calculateCompetition(origin, destination);
  const competitionFactor = 1 - (competition / 20); // 0.5-1.0 range
  
  // Calculate final demand
  let finalDemand = baseRouteDemand * distanceMultiplier * competitionFactor;
  
  // Ensure it stays within 0-100 range
  finalDemand = Math.max(5, Math.min(100, finalDemand));
  
  return Math.round(finalDemand);
}

// Calculate ticket fares based on distance and demand
export function calculateFares(distance: number, demand: number): {
  economy: number;
  premium: number;
  business: number;
  first: number;
} {
  // Base cost per kilometer
  const economyBaseCost = 0.15; // $0.15 per km
  
  // Adjust for demand (higher demand = higher prices)
  const demandFactor = 0.8 + (demand / 100) * 0.4; // 0.8-1.2 range
  
  // Calculate economy fare
  const economyFare = Math.round(distance * economyBaseCost * demandFactor);
  
  // Calculate other cabin types as multiples of economy
  const premiumFare = Math.round(economyFare * 1.7);
  const businessFare = Math.round(economyFare * 2.8);
  const firstFare = Math.round(economyFare * 4.5);
  
  return {
    economy: economyFare,
    premium: premiumFare,
    business: businessFare,
    first: firstFare
  };
}

// Calculate competition level on a route (higher = more competition)
export function calculateCompetition(origin: string, destination: string): number {
  // Major hubs naturally have more competition
  const originHub = hubDetails[origin];
  const destHub = hubDetails[destination];
  
  if (!originHub || !destHub) {
    return 5; // Default medium competition
  }
  
  // Base competition from hub sizes
  let baseCompetition = ((originHub.demand + destHub.demand) / 2);
  
  // Specific route logic - certain route pairs have higher competition
  // High competition pairs (global financial centers, popular tourist routes)
  const highCompetitionPairs = [
    ["JFK", "LHR"], // New York - London (very competitive)
    ["LHR", "JFK"],
    ["JFK", "CDG"], // New York - Paris
    ["CDG", "JFK"],
    ["LHR", "DXB"], // London - Dubai
    ["DXB", "LHR"],
    ["SIN", "LHR"], // Singapore - London
    ["LHR", "SIN"],
    ["HND", "SIN"], // Tokyo - Singapore
    ["SIN", "HND"]
  ];
  
  // Check if this route is a high competition pair
  const isHighCompetition = highCompetitionPairs.some(
    pair => pair[0] === origin && pair[1] === destination
  );
  
  if (isHighCompetition) {
    baseCompetition += 2;
  }
  
  // Adjust for distance - shorter routes often have more competition
  const distance = calculateDistance(originHub.lat, originHub.lon, destHub.lat, destHub.lon);
  if (distance < 1000) {
    baseCompetition += 1;
  }
  
  // Ensure it stays within 0-10 range
  return Math.max(1, Math.min(10, baseCompetition));
}