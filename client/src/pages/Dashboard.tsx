import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import StatCard from "@/components/StatCard";
import RouteMap from "@/components/RouteMap";
import AircraftCard from "@/components/AircraftCard";
import FlightCard from "@/components/FlightCard";
import FinancialSummary from "@/components/FinancialSummary";
import PurchaseAircraftModal from "@/components/modals/PurchaseAircraftModal";
import ScheduleFlightModal from "@/components/modals/ScheduleFlightModal";
import { Plane, Route as RouteIcon, TrendingUp, Calendar, Plus } from "lucide-react";

export default function Dashboard() {
  const { player } = useGameContext();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: aircraft } = useQuery({
    queryKey: ['/api/aircraft/player/1'],
    enabled: !!player,
  });

  const { data: routes } = useQuery({
    queryKey: ['/api/routes/player/1'],
    enabled: !!player,
  });

  const { data: upcomingFlights } = useQuery({
    queryKey: ['/api/flights/player/1/upcoming'],
    enabled: !!player,
  });

  // Calculate stats
  const fleetSize = aircraft ? aircraft.length : 0;
  const routeCount = routes ? routes.length : 0;
  const weeklyRevenue = upcomingFlights ? 
    upcomingFlights.slice(0, 10).reduce((sum, flight) => sum + parseFloat(flight.revenue), 0) : 0;
  
  const a320Count = aircraft ? aircraft.filter(a => a.model === "Airbus A320neo").length : 0;
  const a330Count = aircraft ? aircraft.filter(a => a.model === "Airbus A330-300").length : 0;
  
  // Calculate total route distance
  const totalDistance = routes ? routes.reduce((sum, route) => sum + route.distance, 0) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-300 text-transparent bg-clip-text">
        Airways Manager Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Fleet Size" 
          value={fleetSize} 
          suffix="aircraft"
          icon={<Plane className="h-5 w-5" />}
          details={[
            { label: "A320neo", value: a320Count },
            { label: "A330-300", value: a330Count }
          ]}
        />
        
        <StatCard 
          title="Active Routes" 
          value={routeCount} 
          suffix="routes"
          icon={<RouteIcon className="h-5 w-5" />}
          details={[
            { label: "Total Distance", value: `${(totalDistance).toLocaleString()} km` }
          ]}
        />
        
        <StatCard 
          title="Weekly Revenue" 
          value={`$${weeklyRevenue.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ 
            value: 8.5, 
            label: "from last week", 
            direction: "up" 
          }}
        />
      </div>
      
      <div className="glass-panel rounded-lg shadow-md mb-6 card-glow">
        <div className="p-4 border-b border-white/10 flex items-center">
          <RouteIcon className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-lg">Route Network</h3>
        </div>
        <div className="p-4 relative" style={{ height: "400px" }}>
          <RouteMap routes={routes || []} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-lg shadow-md card-glow">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center">
              <Plane className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-lg">Fleet Overview</h3>
            </div>
            <button 
              className="text-primary hover:text-primary-foreground text-sm font-medium transition-colors"
              onClick={() => window.location.href = "/fleet"}
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {aircraft && aircraft.length > 0 ? (
              aircraft.slice(0, 2).map((aircraft) => (
                <AircraftCard key={aircraft.id} aircraft={aircraft} className="mb-3" />
              ))
            ) : (
              <p className="text-center text-muted-foreground my-4">No aircraft in your fleet</p>
            )}
            
            <button 
              className="mt-4 bg-primary text-white w-full py-2 rounded-lg hover:bg-primary/80 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(149,76,233,0.4)] hover:translate-y-[-2px]"
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              <Plus className="h-4 w-4 inline mr-1" /> Purchase Aircraft
            </button>
          </div>
        </div>
        
        <div className="glass-panel rounded-lg shadow-md card-glow">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" /> 
              <h3 className="font-semibold text-lg">Upcoming Flights</h3>
            </div>
            <button 
              className="text-primary hover:text-primary-foreground text-sm font-medium transition-colors"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule New
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingFlights && upcomingFlights.length > 0 ? (
              upcomingFlights.slice(0, 3).map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            ) : (
              <p className="text-center text-muted-foreground my-4">No upcoming flights</p>
            )}
            
            {upcomingFlights && upcomingFlights.length > 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <button 
                  className="hover:text-primary hover:underline transition-all"
                  onClick={() => window.location.href = "/schedule"}
                >
                  View all scheduled flights →
                </button>
              </div>
            )}
          </div>
        </div>
        
        <FinancialSummary />
      </div>
      
      {isPurchaseModalOpen && (
        <PurchaseAircraftModal 
          isOpen={isPurchaseModalOpen} 
          onClose={() => setIsPurchaseModalOpen(false)} 
        />
      )}
      
      {isScheduleModalOpen && (
        <ScheduleFlightModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
        />
      )}
    </div>
  );
}
