import { pgTable, text, serial, integer, numeric, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Player data
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  money: numeric("money", { precision: 12, scale: 2 }).notNull().default("10000000"),
  currentDate: date("current_date").notNull().default(new Date()),
  hub: text("hub").notNull().default("JFK"),
  lastLogin: timestamp("last_login").notNull().default(new Date()),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  username: true,
  password: true,
});

// Aircraft data
export const aircraft = pgTable("aircraft", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  model: text("model").notNull(), // A320neo or A330-300
  registration: text("registration").notNull(),
  capacity: integer("capacity").notNull(),
  range: integer("range").notNull(), // range in km
  cruisingSpeed: integer("cruising_speed").notNull(), // speed in km/h
  fuelEfficiency: numeric("fuel_efficiency", { precision: 5, scale: 2 }).notNull(), // liters per passenger per 100km
  status: text("status").notNull().default("active"), // active, maintenance, en-route
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  purchaseDate: date("purchase_date").notNull(),
  maintenanceDue: date("maintenance_due").notNull(),
  hasWifi: boolean("has_wifi").notNull().default(false),
  hasEntertainment: boolean("has_entertainment").notNull().default(false),
  hasPremiumSeating: boolean("has_premium_seating").notNull().default(false),
});

export const insertAircraftSchema = createInsertSchema(aircraft).omit({
  id: true,
});

// Airports data
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  latitude: numeric("latitude", { precision: 9, scale: 6 }).notNull(),
  longitude: numeric("longitude", { precision: 9, scale: 6 }).notNull(),
});

export const insertAirportSchema = createInsertSchema(airports).omit({
  id: true,
});

// Routes data
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  originCode: text("origin_code").notNull(),
  destinationCode: text("destination_code").notNull(),
  distance: integer("distance").notNull(), // distance in km
  estimatedTime: integer("estimated_time").notNull(), // flight time in minutes
  demand: integer("demand").notNull(), // passenger demand as percentage
  established: date("established").notNull(),
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

// Flights data
export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  routeId: integer("route_id").notNull(),
  aircraftId: integer("aircraft_id").notNull(),
  flightNumber: text("flight_number").notNull(),
  departureDate: date("departure_date").notNull(),
  departureTime: text("departure_time").notNull(), // format: "HH:MM"
  arrivalDate: date("arrival_date").notNull(),
  arrivalTime: text("arrival_time").notNull(), // format: "HH:MM"
  bookedPassengers: integer("booked_passengers").notNull().default(0),
  maximumPassengers: integer("maximum_passengers").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in-progress, completed, cancelled
  revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  operatingCost: numeric("operating_cost", { precision: 12, scale: 2 }).notNull().default("0"),
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
  bookedPassengers: true,
  status: true,
  revenue: true,
  operatingCost: true,
});

// Financial transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // purchase, revenue, expense
  description: text("description").notNull(),
  date: date("date").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

// Export Types
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Aircraft = typeof aircraft.$inferSelect;
export type InsertAircraft = z.infer<typeof insertAircraftSchema>;

export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
