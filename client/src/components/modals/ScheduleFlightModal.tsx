import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { useGameContext } from "@/contexts/GameContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, calculateFlightTime, formatTimeForDisplay } from "@/utils/gameLogic";
import type { Aircraft, Route } from "@shared/schema";

interface ScheduleFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export default function ScheduleFlightModal({ isOpen, onClose, initialDate }: ScheduleFlightModalProps) {
  const { player } = useGameContext();
  const { toast } = useToast();
  
  // State for flight scheduling
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(initialDate);
  const [departureTime, setDepartureTime] = useState("08:00");
  const [flightNumber, setFlightNumber] = useState("101");
  
  // Get aircraft, routes, and flights data
  const { data: aircraft, isLoading: isLoadingAircraft } = useQuery({
    queryKey: ['/api/aircraft/player/1'],
    enabled: isOpen && !!player,
  });
  
  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['/api/routes/player/1'],
    enabled: isOpen && !!player,
  });
  
  // Set initial values if we have data
  useEffect(() => {
    if (aircraft && aircraft.length > 0 && !selectedAircraftId) {
      setSelectedAircraftId(aircraft[0].id);
    }
    
    if (routes && routes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(routes[0].id);
    }
  }, [aircraft, routes, selectedAircraftId, selectedRouteId]);
  
  // Get the selected aircraft and route
  const selectedAircraft = aircraft?.find(a => a.id === selectedAircraftId);
  const selectedRoute = routes?.find(r => r.id === selectedRouteId);
  
  // Calculate flight details
  const getFlightDetails = () => {
    if (!selectedAircraft || !selectedRoute || !departureDate) {
      return null;
    }
    
    // Extract hours and minutes from departure time
    const [hours, minutes] = departureTime.split(':').map(Number);
    const departureDateObj = new Date(departureDate);
    departureDateObj.setHours(hours, minutes, 0, 0);
    
    // Calculate arrival time
    const flightTimeMinutes = selectedRoute.estimatedTime;
    const arrivalDateObj = new Date(departureDateObj);
    arrivalDateObj.setMinutes(arrivalDateObj.getMinutes() + flightTimeMinutes);
    
    // Format dates for display and API
    const formattedDepartureDate = departureDateObj.toISOString().split('T')[0];
    const formattedArrivalDate = arrivalDateObj.toISOString().split('T')[0];
    
    // Format times for display and API (HH:MM)
    const formattedDepartureTime = departureTime;
    const formattedArrivalTime = `${arrivalDateObj.getHours().toString().padStart(2, '0')}:${arrivalDateObj.getMinutes().toString().padStart(2, '0')}`;
    
    // Calculate expected bookings (70-95% of capacity)
    const bookingPercentage = 0.7 + (Math.random() * 0.25);
    const bookingAdjustment = selectedRoute.demand / 100; // Adjust based on route demand
    const adjustedBookingPercentage = Math.min(0.95, bookingPercentage * bookingAdjustment);
    const expectedBookings = Math.floor(selectedAircraft.capacity * adjustedBookingPercentage);
    
    // Calculate estimated revenue ($150-300 per passenger)
    const averageFare = 150 + (Math.random() * 150);
    const estimatedRevenue = expectedBookings * averageFare;
    
    // Calculate operating cost (60-80% of revenue)
    const costPercentage = 0.6 + (Math.random() * 0.2);
    const operatingCost = estimatedRevenue * costPercentage;
    
    return {
      departureDate: formattedDepartureDate,
      departureTime: formattedDepartureTime,
      arrivalDate: formattedArrivalDate,
      arrivalTime: formattedArrivalTime,
      expectedBookings,
      bookingPercentage: adjustedBookingPercentage * 100,
      estimatedRevenue,
      operatingCost,
      profit: estimatedRevenue - operatingCost
    };
  };
  
  const flightDetails = getFlightDetails();
  
  // Mutation for scheduling a flight
  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!flightDetails || !selectedAircraft || !selectedRoute || !player) {
        throw new Error("Missing flight details");
      }
      
      const flightData = {
        playerId: player.id,
        routeId: selectedRoute.id,
        aircraftId: selectedAircraft.id,
        flightNumber: `ST-${flightNumber}`,
        departureDate: flightDetails.departureDate,
        departureTime: flightDetails.departureTime,
        arrivalDate: flightDetails.arrivalDate,
        arrivalTime: flightDetails.arrivalTime,
        maximumPassengers: selectedAircraft.capacity
      };
      
      return apiRequest('POST', '/api/flights', flightData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flights/player/1/upcoming'] });
      
      toast({
        title: "Flight Scheduled",
        description: `Flight ST-${flightNumber} has been scheduled successfully.`,
        duration: 5000,
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  });
  
  // Validate scheduling form
  const validateForm = () => {
    if (!selectedAircraftId) {
      toast({
        title: "No Aircraft Selected",
        description: "Please select an aircraft for this flight",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!selectedRouteId) {
      toast({
        title: "No Route Selected",
        description: "Please select a route for this flight",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!departureDate) {
      toast({
        title: "No Departure Date",
        description: "Please select a departure date for this flight",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!flightNumber || !/^\d+$/.test(flightNumber)) {
      toast({
        title: "Invalid Flight Number",
        description: "Please enter a valid flight number (numbers only)",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    // Check if aircraft is available (not in maintenance)
    if (selectedAircraft?.status === "maintenance") {
      toast({
        title: "Aircraft Unavailable",
        description: "This aircraft is currently in maintenance",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    // Check if selected date is valid (not in the past)
    if (player && departureDate) {
      const playerCurrentDate = new Date(player.currentDate);
      if (departureDate < playerCurrentDate) {
        toast({
          title: "Invalid Date",
          description: "You cannot schedule flights in the past",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    }
    
    return true;
  };
  
  // Handle scheduling submission
  const handleScheduleFlight = () => {
    if (validateForm()) {
      scheduleMutation.mutate();
    }
  };
  
  // Generate time options
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Schedule New Flight</DialogTitle>
          <DialogDescription>
            Select an aircraft, route, and date to schedule a new flight
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <div>
            <h4 className="font-medium mb-3">1. Select Aircraft</h4>
            {isLoadingAircraft ? (
              <div className="text-center py-4">Loading aircraft...</div>
            ) : aircraft && aircraft.length > 0 ? (
              <RadioGroup 
                value={selectedAircraftId?.toString() || ""}
                onValueChange={(value) => setSelectedAircraftId(parseInt(value))}
                className="space-y-2"
              >
                {aircraft.map(aircraft => (
                  <div 
                    key={aircraft.id}
                    className={`border rounded-lg p-3 
                      ${selectedAircraftId === aircraft.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-neutral-200'
                      }
                      ${aircraft.status === 'maintenance' ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem 
                        value={aircraft.id.toString()} 
                        id={`aircraft-${aircraft.id}`}
                        disabled={aircraft.status === 'maintenance'}
                        className="mr-3"
                      />
                      <div>
                        <Label htmlFor={`aircraft-${aircraft.id}`} className="font-medium">
                          {aircraft.registration} - {aircraft.model.replace('Airbus ', '')}
                        </Label>
                        <div className="text-xs text-neutral-600">
                          {aircraft.capacity} seats, {aircraft.range.toLocaleString()} km range
                        </div>
                        {aircraft.status === 'maintenance' && (
                          <div className="text-xs text-warning">
                            Currently in maintenance
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500">No aircraft available</p>
                <Button 
                  className="mt-2" 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    window.location.href = "/fleet";
                  }}
                >
                  Purchase Aircraft
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-3">2. Select Route</h4>
            {isLoadingRoutes ? (
              <div className="text-center py-4">Loading routes...</div>
            ) : routes && routes.length > 0 ? (
              <RadioGroup 
                value={selectedRouteId?.toString() || ""}
                onValueChange={(value) => setSelectedRouteId(parseInt(value))}
                className="space-y-2"
              >
                {routes.map(route => {
                  const hours = Math.floor(route.estimatedTime / 60);
                  const minutes = route.estimatedTime % 60;
                  const formattedTime = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
                  
                  return (
                    <div 
                      key={route.id}
                      className={`border rounded-lg p-3 
                        ${selectedRouteId === route.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-neutral-200'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <RadioGroupItem 
                          value={route.id.toString()} 
                          id={`route-${route.id}`}
                          className="mr-3"
                        />
                        <div>
                          <Label htmlFor={`route-${route.id}`} className="font-medium font-mono">
                            {route.originCode} → {route.destinationCode}
                          </Label>
                          <div className="text-xs text-neutral-600">
                            {route.distance.toLocaleString()} km, ~{formattedTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500">No routes established</p>
                <Button 
                  className="mt-2" 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    window.location.href = "/routes";
                  }}
                >
                  Create Route
                </Button>
              </div>
            )}
            
            {routes && routes.length > 0 && (
              <div className="text-center mt-2">
                <Button 
                  variant="link" 
                  className="text-primary text-sm"
                  onClick={() => {
                    onClose();
                    window.location.href = "/routes";
                  }}
                >
                  <span className="mr-1">+</span> Create New Route
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="my-4">
          <h4 className="font-medium mb-3">3. Schedule Flight Date</h4>
          <div className="border border-neutral-200 rounded-lg p-4">
            <Calendar
              mode="single"
              selected={departureDate}
              onSelect={setDepartureDate}
              className="rounded-md border mx-auto"
              disabled={{ before: player ? new Date(player.currentDate) : new Date() }}
            />
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departure-time" className="block text-sm font-medium mb-1">Departure Time</Label>
                <Select 
                  value={departureTime}
                  onValueChange={setDepartureTime}
                >
                  <SelectTrigger id="departure-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="flight-number" className="block text-sm font-medium mb-1">Flight Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-md text-sm text-neutral-600">
                    ST
                  </span>
                  <Input 
                    id="flight-number"
                    className="rounded-l-none"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    pattern="[0-9]*"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-100 rounded-lg p-4 my-4">
          <h4 className="font-medium mb-3">Flight Summary</h4>
          
          {flightDetails && selectedAircraft && selectedRoute ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-neutral-600">Aircraft</div>
                  <div className="font-medium">{selectedAircraft.registration} - {selectedAircraft.model.replace('Airbus ', '')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600">Route</div>
                  <div className="font-medium font-mono">
                    {selectedRoute.originCode} → {selectedRoute.destinationCode} ({selectedRoute.distance.toLocaleString()} km)
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600">Departure</div>
                  <div className="font-medium">
                    {departureDate?.toLocaleDateString()} at {formatTimeForDisplay(flightDetails.departureTime)}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-neutral-600">Flight Time</div>
                  <div className="font-medium">
                    ~{Math.floor(selectedRoute.estimatedTime / 60)}h 
                    {selectedRoute.estimatedTime % 60 > 0 ? ` ${selectedRoute.estimatedTime % 60}m` : ''}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600">Arrival (Est.)</div>
                  <div className="font-medium">
                    {new Date(flightDetails.arrivalDate).toLocaleDateString()} at {formatTimeForDisplay(flightDetails.arrivalTime)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600">Flight Number</div>
                  <div className="font-medium">ST-{flightNumber}</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Expected Bookings</div>
                  <div className="font-medium">
                    {flightDetails.expectedBookings}/{selectedAircraft.capacity} seats ({flightDetails.bookingPercentage.toFixed(0)}%)
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600">Estimated Revenue</div>
                  <div className="font-medium text-success">
                    {formatCurrency(flightDetails.estimatedRevenue)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600">Operating Cost</div>
                  <div className="font-medium text-danger">
                    {formatCurrency(flightDetails.operatingCost)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-neutral-500">
              Please select aircraft, route, and date to see flight summary
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleFlight}
            disabled={scheduleMutation.isPending || !flightDetails}
          >
            {scheduleMutation.isPending ? 'Processing...' : 'Schedule Flight'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
