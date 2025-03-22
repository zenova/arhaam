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
import { Plane, Route as RouteIcon, TrendingUp } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Fleet Size" 
          value={fleetSize} 
          suffix="aircraft"
          icon={<Plane className="text-primary" />}
          details={[
            { label: "A320neo", value: a320Count },
            { label: "A330-300", value: a330Count }
          ]}
        />
        
        <StatCard 
          title="Active Routes" 
          value={routeCount} 
          suffix="routes"
          icon={<RouteIcon className="text-accent" />}
          details={[
            { label: "Total Distance", value: `${(totalDistance).toLocaleString()} km` }
          ]}
        />
        
        <StatCard 
          title="Weekly Revenue" 
          value={`$${weeklyRevenue.toLocaleString()}`}
          icon={<TrendingUp className="text-success" />}
          trend={{ 
            value: 8.5, 
            label: "from last week", 
            direction: "up" 
          }}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="font-semibold text-lg">Route Network</h3>
        </div>
        <div className="p-4 relative" style={{ height: "400px" }}>
          <RouteMap routes={routes || []} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Fleet Overview</h3>
            <button 
              className="text-primary hover:text-primary-dark text-sm font-medium"
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
              <p className="text-center text-neutral-500 my-4">No aircraft in your fleet</p>
            )}
            
            <button 
              className="mt-4 bg-primary text-white w-full py-2 rounded-lg hover:bg-primary/90 transition-all"
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              <i className="fas fa-plus mr-1"></i> Purchase Aircraft
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Upcoming Flights</h3>
            <button 
              className="text-primary hover:text-primary-dark text-sm font-medium"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule New
            </button>
          </div>
          <div className="divide-y divide-neutral-200">
            {upcomingFlights && upcomingFlights.length > 0 ? (
              upcomingFlights.slice(0, 3).map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            ) : (
              <p className="text-center text-neutral-500 my-4">No upcoming flights</p>
            )}
            
            {upcomingFlights && upcomingFlights.length > 0 && (
              <div className="p-4 text-center text-sm text-neutral-500">
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
