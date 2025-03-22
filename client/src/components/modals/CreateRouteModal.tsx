import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGameContext } from "@/contexts/GameContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { calculateDistance, calculateFlightTime } from "@/utils/gameLogic";
import type { Airport } from "@shared/schema";

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  airports: Airport[];
  hub: string;
}

export default function CreateRouteModal({ isOpen, onClose, airports, hub }: CreateRouteModalProps) {
  const { player } = useGameContext();
  const { toast } = useToast();
  
  // State for route creation
  const [originCode, setOriginCode] = useState(hub);
  const [destinationCode, setDestinationCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Calculate route details based on origin and destination
  const origin = airports.find(a => a.code === originCode);
  const destination = airports.find(a => a.code === destinationCode);
  
  // Calculate route metrics if we have both airports
  const routeMetrics = origin && destination ? {
    distance: calculateDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    ),
    time: calculateFlightTime(
      calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
      )
    ),
    demand: Math.floor(40 + Math.random() * 60) // Random demand between 40-100%
  } : null;
  
  // Reset the form when the modal opens
  useEffect(() => {
    if (isOpen) {
      setOriginCode(hub);
      setDestinationCode("");
      setSearchQuery("");
    }
  }, [isOpen, hub]);
  
  // Filter airports based on search query
  const filteredAirports = airports.filter(airport => {
    // Don't show the origin airport in the list
    if (airport.code === originCode) return false;
    
    const query = searchQuery.toLowerCase();
    return airport.code.toLowerCase().includes(query) || 
           airport.name.toLowerCase().includes(query) ||
           airport.city.toLowerCase().includes(query) ||
           airport.country.toLowerCase().includes(query);
  });
  
  // Mutation for creating route
  const createRouteMutation = useMutation({
    mutationFn: async () => {
      if (!player || !routeMetrics) throw new Error("Missing data");
      
      const routeData = {
        playerId: player.id,
        originCode,
        destinationCode,
        distance: routeMetrics.distance,
        estimatedTime: routeMetrics.time,
        demand: routeMetrics.demand,
        established: new Date().toISOString().split('T')[0]
      };
      
      return apiRequest('POST', '/api/routes', routeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes/player/1'] });
      
      toast({
        title: "Route Created",
        description: `Route from ${originCode} to ${destinationCode} has been established`,
        duration: 3000,
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Route Creation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  const handleCreateRoute = () => {
    if (!origin || !destination) {
      toast({
        title: "Invalid Route",
        description: "Both origin and destination must be selected",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (origin.code === destination.code) {
      toast({
        title: "Invalid Route",
        description: "Origin and destination cannot be the same",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    createRouteMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Route</DialogTitle>
          <DialogDescription>
            Establish a new flight route between two airports
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="flex items-center mb-6">
            <div className="flex-1">
              <Label className="text-lg font-medium">Origin Airport</Label>
              <div className="flex items-center mt-2">
                <div className="p-3 border rounded-lg bg-primary/5 flex items-center">
                  <div className="font-mono font-medium text-primary text-lg mr-2">{originCode}</div>
                  {origin && (
                    <div>
                      <div>{origin.city}, {origin.country}</div>
                      <div className="text-xs text-neutral-500">{origin.name}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mx-4 text-2xl text-neutral-400">→</div>
            
            <div className="flex-1">
              <Label className="text-lg font-medium">Destination Airport</Label>
              {destinationCode && destination ? (
                <div className="flex items-center mt-2">
                  <div className="p-3 border rounded-lg bg-primary/5 flex items-center">
                    <div className="font-mono font-medium text-primary text-lg mr-2">{destinationCode}</div>
                    <div>
                      <div>{destination.city}, {destination.country}</div>
                      <div className="text-xs text-neutral-500">{destination.name}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => setDestinationCode("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-neutral-500 mt-2">
                  Select a destination from the list below
                </div>
              )}
            </div>
          </div>
          
          {routeMetrics && (
            <div className="mb-6 bg-neutral-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Route Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Distance</div>
                  <div className="font-medium">{routeMetrics.distance.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Estimated Flight Time</div>
                  <div className="font-medium">
                    {Math.floor(routeMetrics.time / 60)}h {routeMetrics.time % 60}m
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Passenger Demand</div>
                  <div className="font-medium">{routeMetrics.demand}%</div>
                </div>
              </div>
            </div>
          )}
          
          {!destinationCode && (
            <>
              <Input
                placeholder="Search airports by code, name, city, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-neutral-100 px-4 py-2 grid grid-cols-12 text-sm font-medium">
                  <div className="col-span-2">Code</div>
                  <div className="col-span-4">Airport</div>
                  <div className="col-span-3">City</div>
                  <div className="col-span-3">Country</div>
                </div>
                
                <div className="max-h-[40vh] overflow-y-auto">
                  <RadioGroup 
                    value={destinationCode} 
                    onValueChange={setDestinationCode}
                  >
                    {filteredAirports.map(airport => (
                      <div 
                        key={airport.code}
                        className="px-4 py-3 border-t border-neutral-200 grid grid-cols-12 items-center hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => setDestinationCode(airport.code)}
                      >
                        <div className="col-span-2 flex items-center">
                          <RadioGroupItem 
                            value={airport.code} 
                            id={`destination-${airport.code}`}
                            className="mr-2"
                          />
                          <Label htmlFor={`destination-${airport.code}`} className="font-mono font-medium">
                            {airport.code}
                          </Label>
                        </div>
                        <div className="col-span-4 truncate">{airport.name}</div>
                        <div className="col-span-3 truncate">{airport.city}</div>
                        <div className="col-span-3 truncate">{airport.country}</div>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {filteredAirports.length === 0 && (
                    <div className="px-4 py-8 text-center text-neutral-500">
                      No airports found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoute}
            disabled={createRouteMutation.isPending || !destinationCode}
          >
            {createRouteMutation.isPending ? 'Creating...' : 'Establish Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
