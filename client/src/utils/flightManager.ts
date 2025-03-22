/**
 * Flight Manager for SkyTycoon
 * This file contains utility functions for scheduling and managing flights
 */

import { calculateDistance } from './aircraftManager';
import { hubDetails, AirlineRoute } from './airportManager';
import { formatGameTime } from './popup-system';
import { FLIGHT_STATUSES } from './constants';

// Flight interface
export interface Flight {
  id: string;
  routeId: string;
  aircraftId: string;
  departureTime: number; // Game time in minutes
  arrivalTime: number; // Game time in minutes
  status: string;
  passengers: {
    economy: number;
    premium: number;
    business: number;
    first: number;
  };
  revenue: number;
  costs: number;
  isReturn: boolean; // Is this the return flight?
}

// Calculate estimated flight time based on distance and aircraft
export function calculateFlightDuration(distance: number, aircraftSpeed: number): number {
  // Base time calculation
  const flightHours = distance / aircraftSpeed;
  
  // Add time for taxiing, takeoff, landing, etc.
  const groundTimeHours = 0.5; // 30 minutes
  
  return flightHours + groundTimeHours;
}

// Calculate estimated revenue for a flight
export function calculateFlightRevenue(
  route: AirlineRoute,
  passengers: { economy: number; premium: number; business: number; first: number; }
): number {
  return (
    passengers.economy * route.fare.economy +
    passengers.premium * route.fare.premium +
    passengers.business * route.fare.business +
    passengers.first * route.fare.first
  );
}

// Calculate costs for a flight
export function calculateFlightCosts(
  route: AirlineRoute,
  aircraft: any
): number {
  // Base costs from the aircraft
  const hourlyOperatingCost = aircraft.maintenanceCost || 5000;
  const flightHours = route.flightTime;
  
  // Calculate fuel costs based on distance
  const fuelCostPerKm = 20; // $20 per km
  const fuelEfficiency = aircraft.fuelEfficiency || 0.8; // Higher is better
  const fuelCost = (route.distance * fuelCostPerKm) / fuelEfficiency;
  
  // Calculate staff costs
  const staffCost = flightHours * 2000; // $2000 per hour
  
  // Calculate airport fees
  const originHub = hubDetails[route.origin];
  const destHub = hubDetails[route.destination];
  const originFees = originHub?.fees || 15000;
  const destFees = destHub?.fees || 15000;
  
  // Sum up all costs
  return (hourlyOperatingCost * flightHours) + fuelCost + staffCost + originFees + destFees;
}

// Schedule a new flight
export function scheduleFlight(
  route: AirlineRoute,
  aircraft: any,
  departureTime: number,
  isReturn: boolean = false
): Flight {
  // Calculate arrival time
  const flightDuration = route.flightTime * 60; // Convert hours to minutes
  const arrivalTime = departureTime + flightDuration;
  
  // Estimate passenger numbers based on demand and aircraft capacity
  const loadFactor = (route.demand / 100) * (0.7 + Math.random() * 0.3); // 70-100% of demand
  const totalCapacity = aircraft.configuration?.capacity || 180;
  
  // Split by cabin type based on configuration
  const config = aircraft.configuration?.seats || {
    economy: 0.8,
    premium: 0.1, 
    business: 0.08,
    first: 0.02
  };
  
  let passengers;
  if (typeof config.economy === 'number' && config.economy > 1) {
    // Absolute number of seats
    const totalPassengers = Math.floor(totalCapacity * loadFactor);
    const ratio = totalPassengers / totalCapacity;
    
    passengers = {
      economy: Math.floor((config.economy || 0) * ratio),
      premium: Math.floor((config.premiumEconomy || 0) * ratio),
      business: Math.floor((config.businessClass || 0) * ratio),
      first: Math.floor((config.firstClass || 0) * ratio)
    };
  } else {
    // Percentage of capacity
    const totalPassengers = Math.floor(totalCapacity * loadFactor);
    passengers = {
      economy: Math.floor(totalPassengers * 0.7),
      premium: Math.floor(totalPassengers * 0.15),
      business: Math.floor(totalPassengers * 0.1),
      first: Math.floor(totalPassengers * 0.05)
    };
  }
  
  // Calculate revenue and costs
  const revenue = calculateFlightRevenue(route, passengers);
  const costs = calculateFlightCosts(route, aircraft);
  
  return {
    id: `flight-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    routeId: route.id,
    aircraftId: aircraft.id,
    departureTime,
    arrivalTime,
    status: FLIGHT_STATUSES.SCHEDULED,
    passengers,
    revenue,
    costs,
    isReturn
  };
}

// Get flight status based on current game time
export function getFlightStatus(flight: Flight, currentGameTime: number): string {
  // Early return for completed flights
  if (flight.status === FLIGHT_STATUSES.ARRIVED || 
      flight.status === FLIGHT_STATUSES.CANCELLED) {
    return flight.status;
  }
  
  const boardingStartTime = flight.departureTime - 60; // 60 minutes before departure
  const takeoffTime = flight.departureTime;
  const landingStartTime = flight.arrivalTime - 20; // 20 minutes before arrival
  
  if (currentGameTime < boardingStartTime) {
    return FLIGHT_STATUSES.SCHEDULED;
  } else if (currentGameTime >= boardingStartTime && currentGameTime < takeoffTime) {
    return FLIGHT_STATUSES.BOARDING;
  } else if (currentGameTime >= takeoffTime && currentGameTime < landingStartTime) {
    return FLIGHT_STATUSES.IN_AIR;
  } else if (currentGameTime >= landingStartTime && currentGameTime < flight.arrivalTime) {
    return FLIGHT_STATUSES.LANDING;
  } else {
    return FLIGHT_STATUSES.ARRIVED;
  }
}

// Format flight times for display
export function formatFlightTimes(flight: Flight): {
  departure: string;
  arrival: string;
  duration: string;
  durationHours: number;
} {
  const departure = formatGameTime(flight.departureTime);
  const arrival = formatGameTime(flight.arrivalTime);
  
  const durationMinutes = flight.arrivalTime - flight.departureTime;
  const durationHours = durationMinutes / 60;
  const hours = Math.floor(durationHours);
  const minutes = Math.floor((durationHours - hours) * 60);
  
  return {
    departure: `${departure.date} ${departure.time}`,
    arrival: `${arrival.date} ${arrival.time}`,
    duration: `${hours}h ${minutes}m`,
    durationHours
  };
}

// Generate a flight number
export function generateFlightNumber(airlineCode: string, routeId: string): string {
  // Use a simplified algorithm: airline code + hash of route
  const routeHash = Math.abs(routeId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const number = (routeHash % 9000) + 1000; // 1000-9999 range
  
  return `${airlineCode}${number}`;
}