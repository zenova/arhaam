import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

// Define the context type
interface GameContextType {
  player: Player | null;
  isLoading: boolean;
  advanceDay: () => Promise<{ completedFlights: number; revenue: number }>;
  saveGame: () => Promise<void>;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
  player: null,
  isLoading: true,
  advanceDay: async () => ({ completedFlights: 0, revenue: 0 }),
  saveGame: async () => {},
});

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component that wraps your app and makes the game context available
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Query to get player data
  const { data: player, isLoading } = useQuery({
    queryKey: ['/api/players/1'],
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
  
  // Initialize player if needed
  useEffect(() => {
    if (!isLoading && !player && !isInitialized) {
      setIsInitialized(true);
      
      // Create default player if it doesn't exist
      const createDefaultPlayer = async () => {
        try {
          await apiRequest('POST', '/api/players', {
            username: 'Player',
            password: 'password123'
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
  }, [isLoading, player, isInitialized, toast]);
  
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
  
  // The value to be provided to consumers of this context
  const contextValue: GameContextType = {
    player: player || null,
    isLoading,
    advanceDay,
    saveGame
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
