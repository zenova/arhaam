import { useQuery } from "@tanstack/react-query";
import { Flight } from "@shared/schema";
import { formatCurrency } from "@/utils/gameLogic";
import { Plane, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FlightCardProps {
  flight: Flight;
  detailed?: boolean;
}

export default function FlightCard({ flight, detailed = false }: FlightCardProps) {
  // Get route and aircraft details
  const { data: routes } = useQuery({
    queryKey: ['/api/routes/player/1'],
  });
  
  const { data: aircraft } = useQuery({
    queryKey: ['/api/aircraft/player/1'],
  });
  
  const route = routes?.find(r => r.id === flight.routeId);
  const aircraftDetails = aircraft?.find(a => a.id === flight.aircraftId);
  
  // Format time to display
  const formatTime = (time: string) => {
    return time;
  };
  
  // Calculate time until flight
  const getTimeUntil = () => {
    const today = new Date();
    const departureDate = new Date(flight.departureDate);
    departureDate.setHours(
      parseInt(flight.departureTime.split(':')[0]), 
      parseInt(flight.departureTime.split(':')[1])
    );
    
    const diffTime = departureDate.getTime() - today.getTime();
    
    if (diffTime < 0) return "";
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`;
    }
  };
  
  // Get status badge styling
  const getStatusBadge = () => {
    switch (flight.status) {
      case "scheduled":
        return (
          <Badge className="bg-primary/20 text-primary-foreground border border-primary/30">
            {getTimeUntil()}
          </Badge>
        );
      case "in-progress":
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-white/20">{flight.status}</Badge>;
    }
  };
  
  if (!route || !aircraftDetails) {
    return null;
  }

  return (
    <div className="p-4 hover:bg-background/40 transition-all border-b border-white/10">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-foreground font-mono font-medium">
            {route.originCode} → {route.destinationCode}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            Flight {flight.flightNumber}
          </span>
        </div>
        <div className="text-xs">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center text-muted-foreground">
          <Plane className="h-3 w-3 mr-1 text-primary/80" />
          <span>
            {new Date(flight.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 
            {formatTime(flight.departureTime)}
          </span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <User className="h-3 w-3 mr-1 text-primary/80" />
          <span>
            {flight.bookedPassengers}/{flight.maximumPassengers} booked
          </span>
        </div>
        <div className="text-emerald-400 font-medium text-sm">
          {formatCurrency(parseFloat(flight.revenue))}
        </div>
      </div>
      
      {detailed && (
        <div className="mt-3 text-xs grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/10">
          <div>
            <div className="text-muted-foreground">Aircraft</div>
            <div className="font-medium">{aircraftDetails.registration} ({aircraftDetails.model.replace('Airbus ', '')})</div>
          </div>
          <div>
            <div className="text-muted-foreground">Arrival</div>
            <div className="font-medium">
              {new Date(flight.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 
              {formatTime(flight.arrivalTime)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Operating Cost</div>
            <div className="font-medium text-rose-400">
              {formatCurrency(parseFloat(flight.operatingCost))}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Profit</div>
            <div className={`font-medium ${parseFloat(flight.revenue) > parseFloat(flight.operatingCost) ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(parseFloat(flight.revenue) - parseFloat(flight.operatingCost))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
