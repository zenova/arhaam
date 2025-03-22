import { Aircraft } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react";
import { formatCurrency } from "@/utils/gameLogic";

interface AircraftCardProps {
  aircraft: Aircraft;
  detailed?: boolean;
  className?: string;
}

export default function AircraftCard({ aircraft, detailed = false, className = "" }: AircraftCardProps) {
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-white";
      case "maintenance":
        return "bg-warning text-white";
      case "en-route":
        return "bg-primary text-white";
      default:
        return "bg-neutral-500 text-white";
    }
  };

  // Get maintenance status text
  const getMaintenanceStatus = () => {
    if (aircraft.status === "maintenance") {
      // Calculate hours remaining in maintenance (mock implementation)
      return "3h remaining";
    }
    
    // Calculate days until next maintenance
    const today = new Date();
    const maintenanceDue = new Date(aircraft.maintenanceDue);
    const diffTime = Math.abs(maintenanceDue.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} to maintenance`;
  };

  return (
    <Card className={`bg-background/70 backdrop-blur-sm border border-white/10 hover:border-primary/50 shadow-md transition-all hover:shadow-[0_0_15px_rgba(149,76,233,0.3)] ${className}`}>
      <CardContent className="p-0">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Plane className="text-primary mr-3" />
            <div>
              <div className="font-medium">{aircraft.model}</div>
              <div className="text-xs text-muted-foreground font-mono">{aircraft.registration}</div>
            </div>
          </div>
          <Badge className={getStatusColor(aircraft.status)}>
            {aircraft.status.charAt(0).toUpperCase() + aircraft.status.slice(1)}
          </Badge>
        </div>
        
        <div className="px-3 pb-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Range</div>
            <div className="font-medium">{aircraft.range.toLocaleString()} km</div>
          </div>
          <div>
            <div className="text-muted-foreground">Capacity</div>
            <div className="font-medium">{aircraft.capacity} seats</div>
          </div>
          <div>
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">
              {aircraft.status === "en-route" ? "En Route" : getMaintenanceStatus()}
            </div>
          </div>
        </div>
        
        {detailed && (
          <div className="px-3 pb-3 border-t border-white/10 pt-3 text-xs">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-muted-foreground">Purchase Date</div>
                <div className="font-medium">
                  {new Date(aircraft.purchaseDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Purchase Price</div>
                <div className="font-medium">
                  {formatCurrency(parseFloat(aircraft.purchasePrice))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-muted-foreground">Speed</div>
                <div className="font-medium">{aircraft.cruisingSpeed} km/h</div>
              </div>
              <div>
                <div className="text-muted-foreground">Fuel Efficiency</div>
                <div className="font-medium">{aircraft.fuelEfficiency} l/p/100km</div>
              </div>
              <div>
                <div className="text-muted-foreground">Maintenance</div>
                <div className="font-medium">
                  {new Date(aircraft.maintenanceDue).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {(aircraft.hasWifi || aircraft.hasEntertainment || aircraft.hasPremiumSeating) && (
              <div className="flex gap-2 mt-2">
                {aircraft.hasWifi && (
                  <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                    Wi-Fi
                  </Badge>
                )}
                {aircraft.hasEntertainment && (
                  <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                    Entertainment
                  </Badge>
                )}
                {aircraft.hasPremiumSeating && (
                  <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                    Premium Seating
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
