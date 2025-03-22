import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Player, Aircraft, Airport, Route, Flight, Transaction } from "@shared/schema";
import { showAlert, showConfirm, showInput, formatGameTime } from "@/utils/popup-system";
import { GameState } from "@/utils/gameSystem";
import { DIFFICULTY_SETTINGS, FLIGHT_STATUSES } from "@/utils/constants";
import { availableAircraft, generateRegistration } from "@/utils/aircraftManager";
import { availableHubs, hubDetails } from "@/utils/airportManager";

// Game Settings
const TIME_MULTIPLIER = 1;
const DEFAULT_AIRLINE_NAME = "SkyTycoon Airways";
const DEFAULT_CEO_NAME = "Player";
const DEFAULT_HUB = null;

// Define the context type
interface GameContextType {
  // Basic game state
  player: Player | null;
  isLoading: boolean;
  timeMultiplier: number;
  setTimeMultiplier: (multiplier: number) => void;
  aircraft: Aircraft[];
  routes: Route[];
  flights: Flight[];
  upcomingFlights: Flight[];
  transactions: Transaction[];
  airports: Airport[];
  
  // Game actions
  advanceDay: () => Promise<{ completedFlights: number; revenue: number }>;
  saveGame: () => Promise<void>;
  purchaseAircraft: (modelId: string, configuration: number) => Promise<Aircraft | null>;
  sellAircraft: (aircraftId: number) => Promise<boolean>;
  selectHub: (hubCode: string) => Promise<boolean>;
  createRoute: (originCode: string, destinationCode: string) => Promise<Route | null>;
  scheduleFlight: (routeId: number, aircraftId: number, departureTime: Date, isReturn: boolean) => Promise<Flight | null>;
  cancelFlight: (flightId: number) => Promise<boolean>;
  
  // UI helpers
  showAlert: (title: string, message: string) => Promise<void>;
  showConfirm: (title: string, message: string) => Promise<boolean>;
  showInput: (title: string, message: string, placeholder?: string) => Promise<string | null>;
  formatCurrency: (amount: number) => string;
  
  // Airline info
  airlineName: string;
  setAirlineName: (name: string) => void;
  ceoName: string;
  setCeoName: (name: string) => void;
  currentHub: string | null;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
  player: null,
  isLoading: true,
  timeMultiplier: TIME_MULTIPLIER,
  setTimeMultiplier: () => {},
  aircraft: [],
  routes: [],
  flights: [],
  upcomingFlights: [],
  transactions: [],
  airports: [],
  
  advanceDay: async () => ({ completedFlights: 0, revenue: 0 }),
  saveGame: async () => {},
  purchaseAircraft: async () => null,
  sellAircraft: async () => false,
  selectHub: async () => false,
  createRoute: async () => null,
  scheduleFlight: async () => null,
  cancelFlight: async () => false,
  
  showAlert,
  showConfirm,
  showInput,
  formatCurrency: (amount) => `$${amount.toLocaleString()}`,
  
  airlineName: DEFAULT_AIRLINE_NAME,
  setAirlineName: () => {},
  ceoName: DEFAULT_CEO_NAME,
  setCeoName: () => {},
  currentHub: DEFAULT_HUB
});

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component that wraps your app and makes the game context available
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(TIME_MULTIPLIER);
  const [airlineName, setAirlineName] = useState(DEFAULT_AIRLINE_NAME);
  const [ceoName, setCeoName] = useState(DEFAULT_CEO_NAME);
  
  // Query to get player data
  const { data: player, isLoading: isPlayerLoading } = useQuery({
    queryKey: ['/api/players/1'],
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
  
  // Query to get aircraft data
  const { data: aircraft = [] } = useQuery({
    queryKey: ['/api/aircraft/player/1'],
    enabled: !!player,
    staleTime: 30000, // 30 seconds
  });
  
  // Query to get airports data
  const { data: airports = [] } = useQuery({
    queryKey: ['/api/airports'],
    staleTime: Infinity, // This data doesn't change
  });
  
  // Query to get routes data
  const { data: routes = [] } = useQuery({
    queryKey: ['/api/routes/player/1'],
    enabled: !!player,
    staleTime: 30000, // 30 seconds
  });
  
  // Query to get upcoming flights
  const { data: upcomingFlights = [] } = useQuery({
    queryKey: ['/api/flights/player/1/upcoming'],
    enabled: !!player,
    staleTime: 30000, // 30 seconds
  });
  
  // Query to get all flights
  const { data: flights = [] } = useQuery({
    queryKey: ['/api/flights/player/1'],
    enabled: !!player,
    staleTime: 30000, // 30 seconds
  });
  
  // Query to get transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions/player/1'],
    enabled: !!player,
    staleTime: 30000, // 30 seconds
  });
  
  const isLoading = isPlayerLoading;
  
  // Format currency with thousand separators, millions (M), billions (B), etc.
  const formatCurrency = useCallback((amount: number): string => {
    // Handle negative numbers
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    
    // Format based on size
    let formatted: string;
    if (absAmount >= 1_000_000_000) {
      formatted = `$${(absAmount / 1_000_000_000).toFixed(2)}B`;
    } else if (absAmount >= 1_000_000) {
      formatted = `$${(absAmount / 1_000_000).toFixed(2)}M`;
    } else if (absAmount >= 1_000) {
      formatted = `$${(absAmount / 1_000).toFixed(2)}K`;
    } else {
      formatted = `$${absAmount.toFixed(2)}`;
    }
    
    return isNegative ? `-${formatted}` : formatted;
  }, []);
  
  // Initialize player if needed
  useEffect(() => {
    if (!isPlayerLoading && !player && !isInitialized) {
      setIsInitialized(true);
      
      // Create default player if it doesn't exist
      const createDefaultPlayer = async () => {
        try {
          await apiRequest('POST', '/api/players', {
            username: 'Player',
            password: 'password123',
            airlineName: airlineName,
            money: DIFFICULTY_SETTINGS.NORMAL.startingMoney
          });
          
          queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
          
          toast({
            title: "Welcome to SkyTycoon!",
            description: "Your airline management career has begun",
            duration: 5000,
          });
        } catch (error) {
          console.error("Failed to create player:", error);
          toast({
            title: "Initialization Error",
            description: "Failed to initialize the game",
            variant: "destructive",
            duration: 5000,
          });
        }
      };
      
      createDefaultPlayer();
    }
  }, [isPlayerLoading, player, isInitialized, toast, airlineName]);
  
  // Mutation to advance game day
  const advanceDayMutation = useMutation({
    mutationFn: async () => {
      if (!player) throw new Error("Player not found");
      const response = await apiRequest('POST', `/api/game/${player.id}/advance-day`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/player/1'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to advance game day",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  // Save game mutation
  const saveGameMutation = useMutation({
    mutationFn: async () => {
      if (!player) throw new Error("Player not found");
      await apiRequest('POST', `/api/game/${player.id}/save`, {});
    },
    onError: (error) => {
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save game",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  // Purchase aircraft mutation
  const purchaseAircraftMutation = useMutation({
    mutationFn: async ({ modelId, configuration }: { modelId: string; configuration: number }) => {
      if (!player) throw new Error("Player not found");
      if (!player.hub) throw new Error("You must select a hub before purchasing aircraft");
      
      const aircraftModel = availableAircraft.find(a => a.id === modelId);
      if (!aircraftModel) throw new Error("Invalid aircraft model");
      
      const aircraftConfig = aircraftModel.configurations[configuration];
      if (!aircraftConfig) throw new Error("Invalid aircraft configuration");
      
      // Generate a registration number based on the player's hub
      const registration = generateRegistration(player.hub);
      
      const response = await apiRequest('POST', '/api/aircraft', {
        playerId: player.id,
        model: aircraftModel.name,
        registration,
        capacity: aircraftConfig.capacity,
        range: aircraftModel.range,
        cruisingSpeed: aircraftModel.speed,
        fuelEfficiency: aircraftModel.fuelEfficiency.toString(),
        purchasePrice: aircraftModel.purchasePrice.toString(),
        purchaseDate: new Date(player.currentDate).toISOString(),
        maintenanceDue: new Date(new Date(player.currentDate).setMonth(new Date(player.currentDate).getMonth() + 3)).toISOString(),
        status: 'Available',
        hasWifi: true,
        hasEntertainment: configuration > 0, // Basic config doesn't have entertainment
        hasPremiumSeating: configuration > 1, // Only luxury configs have premium seating
      });
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aircraft/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/player/1'] });
    },
    onError: (error) => {
      toast({
        title: "Purchase Error",
        description: error instanceof Error ? error.message : "Failed to purchase aircraft",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  // Sell aircraft mutation
  const sellAircraftMutation = useMutation({
    mutationFn: async (aircraftId: number) => {
      if (!player) throw new Error("Player not found");
      await apiRequest('DELETE', `/api/aircraft/${aircraftId}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aircraft/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/player/1'] });
    }
  });
  
  // Select hub mutation
  const selectHubMutation = useMutation({
    mutationFn: async (hubCode: string) => {
      if (!player) throw new Error("Player not found");
      await apiRequest('PATCH', `/api/players/${player.id}`, { hub: hubCode });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
    }
  });
  
  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: async ({ originCode, destinationCode }: { originCode: string; destinationCode: string }) => {
      if (!player) throw new Error("Player not found");
      const response = await apiRequest('POST', '/api/routes', {
        playerId: player.id,
        origin: originCode,
        destination: destinationCode
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes/player/1'] });
    }
  });
  
  // Schedule flight mutation
  const scheduleFlightMutation = useMutation({
    mutationFn: async ({ routeId, aircraftId, departureTime, isReturn }: 
      { routeId: number; aircraftId: number; departureTime: Date; isReturn: boolean }) => {
      if (!player) throw new Error("Player not found");
      const response = await apiRequest('POST', '/api/flights', {
        playerId: player.id,
        routeId,
        aircraftId,
        departureTime: departureTime.toISOString(),
        status: FLIGHT_STATUSES.SCHEDULED,
        isReturn
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1/upcoming'] });
    }
  });
  
  // Cancel flight mutation
  const cancelFlightMutation = useMutation({
    mutationFn: async (flightId: number) => {
      if (!player) throw new Error("Player not found");
      await apiRequest('PATCH', `/api/flights/${flightId}`, {
        status: FLIGHT_STATUSES.CANCELLED
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1/upcoming'] });
    }
  });
  
  // Function to advance the game day
  const advanceDay = async () => {
    try {
      const result = await advanceDayMutation.mutateAsync();
      return {
        completedFlights: result.completedFlights,
        revenue: result.revenue
      };
    } catch (error) {
      return { completedFlights: 0, revenue: 0 };
    }
  };
  
  // Function to save the game
  const saveGame = async () => {
    await saveGameMutation.mutateAsync();
  };
  
  // Function to purchase an aircraft
  const purchaseAircraft = async (modelId: string, configuration: number): Promise<Aircraft | null> => {
    try {
      return await purchaseAircraftMutation.mutateAsync({ modelId, configuration });
    } catch (error) {
      return null;
    }
  };
  
  // Function to sell an aircraft
  const sellAircraft = async (aircraftId: number): Promise<boolean> => {
    try {
      return await sellAircraftMutation.mutateAsync(aircraftId);
    } catch (error) {
      return false;
    }
  };
  
  // Function to select a hub
  const selectHub = async (hubCode: string): Promise<boolean> => {
    try {
      return await selectHubMutation.mutateAsync(hubCode);
    } catch (error) {
      return false;
    }
  };
  
  // Function to create a route
  const createRoute = async (originCode: string, destinationCode: string): Promise<Route | null> => {
    try {
      return await createRouteMutation.mutateAsync({ originCode, destinationCode });
    } catch (error) {
      return null;
    }
  };
  
  // Function to schedule a flight
  const scheduleFlight = async (
    routeId: number, 
    aircraftId: number, 
    departureTime: Date, 
    isReturn: boolean
  ): Promise<Flight | null> => {
    try {
      return await scheduleFlightMutation.mutateAsync({ routeId, aircraftId, departureTime, isReturn });
    } catch (error) {
      return null;
    }
  };
  
  // Function to cancel a flight
  const cancelFlight = async (flightId: number): Promise<boolean> => {
    try {
      return await cancelFlightMutation.mutateAsync(flightId);
    } catch (error) {
      return false;
    }
  };
  
  // The value to be provided to consumers of this context
  const contextValue: GameContextType = {
    player: player || null,
    isLoading,
    timeMultiplier,
    setTimeMultiplier,
    aircraft,
    routes,
    flights,
    upcomingFlights,
    transactions,
    airports,
    
    advanceDay,
    saveGame,
    purchaseAircraft,
    sellAircraft,
    selectHub,
    createRoute,
    scheduleFlight,
    cancelFlight,
    
    showAlert,
    showConfirm,
    showInput,
    formatCurrency,
    
    airlineName,
    setAirlineName,
    ceoName,
    setCeoName,
    currentHub: player?.hub || null
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
