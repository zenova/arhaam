import {
  Player, InsertPlayer,
  Aircraft, InsertAircraft,
  Airport, InsertAirport,
  Route, InsertRoute,
  Flight, InsertFlight,
  Transaction, InsertTransaction
} from "@shared/schema";

// Define storage interface
export interface IStorage {
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;
  
  // Aircraft methods
  getAircraft(id: number): Promise<Aircraft | undefined>;
  getAircraftByPlayer(playerId: number): Promise<Aircraft[]>;
  createAircraft(aircraft: InsertAircraft): Promise<Aircraft>;
  updateAircraft(id: number, updates: Partial<Aircraft>): Promise<Aircraft | undefined>;
  
  // Airport methods
  getAirport(id: number): Promise<Airport | undefined>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  getAllAirports(): Promise<Airport[]>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  
  // Route methods
  getRoute(id: number): Promise<Route | undefined>;
  getRoutesByPlayer(playerId: number): Promise<Route[]>;
  getRouteByOriginDestination(playerId: number, originCode: string, destinationCode: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  
  // Flight methods
  getFlight(id: number): Promise<Flight | undefined>;
  getFlightsByPlayer(playerId: number): Promise<Flight[]>;
  getUpcomingFlightsByPlayer(playerId: number, date: Date): Promise<Flight[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  updateFlight(id: number, updates: Partial<Flight>): Promise<Flight | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByPlayer(playerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private players: Map<number, Player>;
  private aircraft: Map<number, Aircraft>;
  private airports: Map<number, Airport>;
  private routes: Map<number, Route>;
  private flights: Map<number, Flight>;
  private transactions: Map<number, Transaction>;
  
  private playerIdCounter: number;
  private aircraftIdCounter: number;
  private airportIdCounter: number;
  private routeIdCounter: number;
  private flightIdCounter: number;
  private transactionIdCounter: number;
  
  constructor() {
    this.players = new Map();
    this.aircraft = new Map();
    this.airports = new Map();
    this.routes = new Map();
    this.flights = new Map();
    this.transactions = new Map();
    
    this.playerIdCounter = 1;
    this.aircraftIdCounter = 1;
    this.airportIdCounter = 1;
    this.routeIdCounter = 1;
    this.flightIdCounter = 1;
    this.transactionIdCounter = 1;
    
    // Initialize with default airports
    this.initializeDefaultAirports();
  }
  
  private initializeDefaultAirports() {
    const defaultAirports: InsertAirport[] = [
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", latitude: 40.6413, longitude: -73.7781 },
      { code: "LHR", name: "London Heathrow Airport", city: "London", country: "UK", latitude: 51.4700, longitude: -0.4543 },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", latitude: 49.0097, longitude: 2.5479 },
      { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", latitude: 33.9416, longitude: -118.4085 },
      { code: "MIA", name: "Miami International Airport", city: "Miami", country: "USA", latitude: 25.7932, longitude: -80.2906 },
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", latitude: 1.3644, longitude: 103.9915 },
      { code: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan", latitude: 35.5494, longitude: 139.7798 },
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", latitude: 25.2528, longitude: 55.3644 },
      { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", latitude: 50.0379, longitude: 8.5622 },
      { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", latitude: -33.9399, longitude: 151.1753 }
    ];
    
    defaultAirports.forEach(airport => {
      this.createAirport(airport);
    });
  }
  
  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(player => player.username === username);
  }
  
  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.playerIdCounter++;
    const newPlayer: Player = {
      ...player,
      id,
      money: "5000000000", // $5 billion
      currentDate: new Date(),
      hub: "JFK",
      lastLogin: new Date()
    };
    this.players.set(id, newPlayer);
    return newPlayer;
  }
  
  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = await this.getPlayer(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  // Aircraft methods
  async getAircraft(id: number): Promise<Aircraft | undefined> {
    return this.aircraft.get(id);
  }
  
  async getAircraftByPlayer(playerId: number): Promise<Aircraft[]> {
    return Array.from(this.aircraft.values()).filter(a => a.playerId === playerId);
  }
  
  async createAircraft(aircraft: InsertAircraft): Promise<Aircraft> {
    const id = this.aircraftIdCounter++;
    const newAircraft: Aircraft = { ...aircraft, id };
    this.aircraft.set(id, newAircraft);
    return newAircraft;
  }
  
  async updateAircraft(id: number, updates: Partial<Aircraft>): Promise<Aircraft | undefined> {
    const aircraft = await this.getAircraft(id);
    if (!aircraft) return undefined;
    
    const updatedAircraft = { ...aircraft, ...updates };
    this.aircraft.set(id, updatedAircraft);
    return updatedAircraft;
  }
  
  // Airport methods
  async getAirport(id: number): Promise<Airport | undefined> {
    return this.airports.get(id);
  }
  
  async getAirportByCode(code: string): Promise<Airport | undefined> {
    return Array.from(this.airports.values()).find(a => a.code === code);
  }
  
  async getAllAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values());
  }
  
  async createAirport(airport: InsertAirport): Promise<Airport> {
    const id = this.airportIdCounter++;
    const newAirport: Airport = { ...airport, id };
    this.airports.set(id, newAirport);
    return newAirport;
  }
  
  // Route methods
  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }
  
  async getRoutesByPlayer(playerId: number): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(r => r.playerId === playerId);
  }
  
  async getRouteByOriginDestination(playerId: number, originCode: string, destinationCode: string): Promise<Route | undefined> {
    return Array.from(this.routes.values()).find(
      r => r.playerId === playerId && r.originCode === originCode && r.destinationCode === destinationCode
    );
  }
  
  async createRoute(route: InsertRoute): Promise<Route> {
    const id = this.routeIdCounter++;
    const newRoute: Route = { ...route, id };
    this.routes.set(id, newRoute);
    return newRoute;
  }
  
  // Flight methods
  async getFlight(id: number): Promise<Flight | undefined> {
    return this.flights.get(id);
  }
  
  async getFlightsByPlayer(playerId: number): Promise<Flight[]> {
    return Array.from(this.flights.values()).filter(f => f.playerId === playerId);
  }
  
  async getUpcomingFlightsByPlayer(playerId: number, date: Date): Promise<Flight[]> {
    return Array.from(this.flights.values()).filter(f => {
      return f.playerId === playerId && 
             new Date(f.departureDate) >= date && 
             f.status !== 'completed' && 
             f.status !== 'cancelled';
    }).sort((a, b) => {
      const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
      const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }
  
  async createFlight(flight: InsertFlight): Promise<Flight> {
    const id = this.flightIdCounter++;
    const newFlight: Flight = { 
      ...flight, 
      id, 
      bookedPassengers: 0, 
      status: 'scheduled',
      revenue: "0",
      operatingCost: "0"
    };
    this.flights.set(id, newFlight);
    return newFlight;
  }
  
  async updateFlight(id: number, updates: Partial<Flight>): Promise<Flight | undefined> {
    const flight = await this.getFlight(id);
    if (!flight) return undefined;
    
    const updatedFlight = { ...flight, ...updates };
    this.flights.set(id, updatedFlight);
    return updatedFlight;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByPlayer(playerId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.playerId === playerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
}

export const storage = new MemStorage();
