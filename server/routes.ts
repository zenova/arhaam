import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlayerSchema, insertAircraftSchema, insertRouteSchema, 
  insertFlightSchema, insertTransactionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Player routes
  app.post('/api/players', async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const existingPlayer = await storage.getPlayerByUsername(playerData.username);
      
      if (existingPlayer) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      const newPlayer = await storage.createPlayer(playerData);
      res.status(201).json(newPlayer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid player data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create player' });
    }
  });

  app.get('/api/players/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve player' });
    }
  });

  app.patch('/api/players/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      const updatedPlayer = await storage.updatePlayer(id, req.body);
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update player' });
    }
  });

  // Aircraft routes
  app.post('/api/aircraft', async (req, res) => {
    try {
      const aircraftData = insertAircraftSchema.parse(req.body);
      const player = await storage.getPlayer(aircraftData.playerId);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Check if player has enough money
      if (parseFloat(player.money) < parseFloat(aircraftData.purchasePrice)) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      
      // Create aircraft
      const newAircraft = await storage.createAircraft(aircraftData);
      
      // Deduct money and create transaction
      const newBalance = (parseFloat(player.money) - parseFloat(aircraftData.purchasePrice)).toString();
      await storage.updatePlayer(player.id, { money: newBalance });
      
      await storage.createTransaction({
        playerId: player.id,
        amount: `-${aircraftData.purchasePrice}`,
        type: 'purchase',
        description: `Purchased ${aircraftData.model} (${aircraftData.registration})`,
        date: new Date()
      });
      
      res.status(201).json(newAircraft);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid aircraft data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to purchase aircraft' });
    }
  });

  app.get('/api/aircraft/player/:playerId', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const aircraft = await storage.getAircraftByPlayer(playerId);
      res.json(aircraft);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve aircraft' });
    }
  });

  app.patch('/api/aircraft/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const aircraft = await storage.getAircraft(id);
      
      if (!aircraft) {
        return res.status(404).json({ message: 'Aircraft not found' });
      }
      
      const updatedAircraft = await storage.updateAircraft(id, req.body);
      res.json(updatedAircraft);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update aircraft' });
    }
  });

  // Airport routes
  app.get('/api/airports', async (req, res) => {
    try {
      const airports = await storage.getAllAirports();
      res.json(airports);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve airports' });
    }
  });

  app.get('/api/airports/:code', async (req, res) => {
    try {
      const airport = await storage.getAirportByCode(req.params.code);
      
      if (!airport) {
        return res.status(404).json({ message: 'Airport not found' });
      }
      
      res.json(airport);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve airport' });
    }
  });

  // Route routes
  app.post('/api/routes', async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);
      
      // Check if the route already exists
      const existingRoute = await storage.getRouteByOriginDestination(
        routeData.playerId, 
        routeData.originCode, 
        routeData.destinationCode
      );
      
      if (existingRoute) {
        return res.status(409).json({ message: 'Route already exists' });
      }
      
      // Check if airports exist
      const origin = await storage.getAirportByCode(routeData.originCode);
      const destination = await storage.getAirportByCode(routeData.destinationCode);
      
      if (!origin || !destination) {
        return res.status(404).json({ message: 'One or both airports not found' });
      }
      
      const newRoute = await storage.createRoute(routeData);
      res.status(201).json(newRoute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid route data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create route' });
    }
  });

  app.get('/api/routes/player/:playerId', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const routes = await storage.getRoutesByPlayer(playerId);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve routes' });
    }
  });

  // Flight routes
  app.post('/api/flights', async (req, res) => {
    try {
      const flightData = insertFlightSchema.parse(req.body);
      
      // Validate that the aircraft exists and belongs to the player
      const aircraft = await storage.getAircraft(flightData.aircraftId);
      if (!aircraft || aircraft.playerId !== flightData.playerId) {
        return res.status(404).json({ message: 'Aircraft not found or does not belong to player' });
      }
      
      // Validate that the route exists and belongs to the player
      const route = await storage.getRoute(flightData.routeId);
      if (!route || route.playerId !== flightData.playerId) {
        return res.status(404).json({ message: 'Route not found or does not belong to player' });
      }
      
      // Create the flight
      const newFlight = await storage.createFlight(flightData);
      
      // Calculate expected bookings (70-95% of capacity)
      const bookingPercentage = 0.7 + (Math.random() * 0.25);
      const bookedPassengers = Math.floor(flightData.maximumPassengers * bookingPercentage);
      
      // Calculate expected revenue ($150-300 per passenger)
      const averageFare = 150 + (Math.random() * 150);
      const revenue = (bookedPassengers * averageFare).toFixed(2);
      
      // Calculate operating cost (60-80% of revenue)
      const costPercentage = 0.6 + (Math.random() * 0.2);
      const operatingCost = (parseFloat(revenue) * costPercentage).toFixed(2);
      
      // Update the flight with calculated values
      await storage.updateFlight(newFlight.id, {
        bookedPassengers,
        revenue,
        operatingCost
      });
      
      res.status(201).json({
        ...newFlight,
        bookedPassengers,
        revenue,
        operatingCost
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid flight data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to schedule flight' });
    }
  });

  app.get('/api/flights/player/:playerId', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const flights = await storage.getFlightsByPlayer(playerId);
      res.json(flights);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve flights' });
    }
  });

  app.get('/api/flights/player/:playerId/upcoming', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      const flights = await storage.getUpcomingFlightsByPlayer(playerId, new Date(player.currentDate));
      res.json(flights);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve upcoming flights' });
    }
  });

  app.patch('/api/flights/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flight = await storage.getFlight(id);
      
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      
      const updatedFlight = await storage.updateFlight(id, req.body);
      res.json(updatedFlight);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update flight' });
    }
  });

  // Transaction routes
  app.post('/api/transactions', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const newTransaction = await storage.createTransaction(transactionData);
      
      // Update player balance
      const player = await storage.getPlayer(transactionData.playerId);
      if (player) {
        const newBalance = (parseFloat(player.money) + parseFloat(transactionData.amount)).toString();
        await storage.updatePlayer(player.id, { money: newBalance });
      }
      
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  });

  app.get('/api/transactions/player/:playerId', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const transactions = await storage.getTransactionsByPlayer(playerId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve transactions' });
    }
  });

  // Game state management
  app.post('/api/game/:playerId/advance-day', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Advance the current date by 1 day
      const currentDate = new Date(player.currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Update player date
      await storage.updatePlayer(playerId, { currentDate });
      
      // Process completed flights for this day
      const flights = await storage.getFlightsByPlayer(playerId);
      const completedFlights = flights.filter(f => {
        const flightDate = new Date(f.departureDate);
        return flightDate < currentDate && f.status === 'scheduled';
      });
      
      // Process revenue for completed flights
      let totalRevenue = 0;
      
      for (const flight of completedFlights) {
        await storage.updateFlight(flight.id, { status: 'completed' });
        
        // Add flight revenue to player balance
        const profit = parseFloat(flight.revenue) - parseFloat(flight.operatingCost);
        totalRevenue += profit;
        
        // Create transaction for flight revenue
        await storage.createTransaction({
          playerId,
          amount: profit.toString(),
          type: 'revenue',
          description: `Flight ${flight.flightNumber} (${flight.bookedPassengers} passengers)`,
          date: currentDate
        });
      }
      
      // Update player balance with revenue
      if (totalRevenue !== 0) {
        const newBalance = (parseFloat(player.money) + totalRevenue).toString();
        await storage.updatePlayer(playerId, { money: newBalance });
      }
      
      // Get updated player data
      const updatedPlayer = await storage.getPlayer(playerId);
      
      res.json({
        player: updatedPlayer,
        completedFlights: completedFlights.length,
        revenue: totalRevenue
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to advance game day' });
    }
  });

  app.post('/api/game/:playerId/save', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Update last login time
      await storage.updatePlayer(playerId, { lastLogin: new Date() });
      
      res.json({ message: 'Game saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save game' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
