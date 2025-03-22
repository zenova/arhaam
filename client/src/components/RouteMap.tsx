import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import { Route } from "@shared/schema";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteMapProps {
  routes: Route[];
  detailed?: boolean;
}

export default function RouteMap({ routes, detailed = false }: RouteMapProps) {
  const { player } = useGameContext();

  const { data: airports } = useQuery({
    queryKey: ['/api/airports'],
    enabled: !!player,
  });

  // Map coordinates (very simplified for this implementation)
  const airportPositions = useMemo(() => {
    if (!airports) return {};
    
    const positions: Record<string, { x: number, y: number }> = {};
    
    // Create a mapping of airport codes to x, y positions on the SVG
    airports.forEach(airport => {
      // Simple formula to map lat/long to x, y on a 1000x500 SVG
      // In a real implementation, you'd use a proper map projection
      const x = ((airport.longitude + 180) / 360) * 1000;
      const y = ((90 - airport.latitude) / 180) * 500;
      
      positions[airport.code] = { x, y };
    });
    
    return positions;
  }, [airports]);

  // Get hub position
  const hubPosition = player?.hub ? airportPositions[player.hub] : undefined;

  return (
    <div className="w-full h-full relative bg-slate-100">
      {/* World map background - using pattern instead of an image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          backgroundImage: `radial-gradient(circle, #ccc 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Draw routes if we have airport positions */}
        {routes.map((route, index) => {
          const origin = airportPositions[route.originCode];
          const destination = airportPositions[route.destinationCode];
          
          if (!origin || !destination) return null;
          
          // Get midpoint for a curved line
          const midX = (origin.x + destination.x) / 2;
          const midY = (origin.y + destination.y) / 2 - 20;
          
          return (
            <path 
              key={index}
              d={`M${origin.x},${origin.y} Q${midX},${midY} ${destination.x},${destination.y}`} 
              stroke="#0073C2" 
              strokeWidth="3" 
              fill="none" 
              strokeDasharray="5"
              className="route-path animate-pulse"
            />
          );
        })}
        
        {/* Draw airports */}
        {airports && Object.entries(airportPositions).map(([code, position]) => (
          <g key={code}>
            <circle 
              cx={position.x} 
              cy={position.y} 
              r="5" 
              fill="#FF6B35"
              className="cursor-pointer hover:r-6 transition-all"
              title={code}
            />
            
            {/* Add hub indicator */}
            {player?.hub === code && (
              <circle 
                cx={position.x} 
                cy={position.y} 
                r="10" 
                fill="none" 
                stroke="#FF6B35" 
                strokeWidth="2"
              />
            )}
            
            {/* Show airport codes in detailed view */}
            {detailed && (
              <text
                x={position.x + 8}
                y={position.y + 4}
                fontSize="10"
                fontWeight="bold"
                fill="#333"
              >
                {code}
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {hubPosition && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md text-sm">
          <div className="font-medium mb-1">
            Hub: {player?.hub} - {airports?.find(a => a.code === player?.hub)?.city}
          </div>
          <div className="text-xs text-neutral-600">{routes.length} Active Routes</div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button size="icon" variant="secondary" className="bg-white shadow-md">
          <Plus className="h-4 w-4 text-primary" />
        </Button>
        <Button size="icon" variant="secondary" className="bg-white shadow-md">
          <Search className="h-4 w-4 text-neutral-600" />
        </Button>
      </div>
    </div>
  );
}
