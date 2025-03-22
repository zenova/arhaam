import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";
import RouteMap from "@/components/RouteMap";
import HubSelectionModal from "@/components/modals/HubSelectionModal";
import CreateRouteModal from "@/components/modals/CreateRouteModal";

export default function Routes() {
  const { player } = useGameContext();
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);

  const { data: routes, isLoading } = useQuery({
    queryKey: ['/api/routes/player/1'],
    enabled: !!player,
  });

  const { data: airports } = useQuery({
    queryKey: ['/api/airports'],
    enabled: !!player,
  });

  // Get hub airport details
  const hubAirport = airports?.find(a => a.code === player?.hub);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Route Network</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsHubModalOpen(true)}>
            Change Hub
          </Button>
          <Button onClick={() => setIsCreateRouteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Network Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: "500px" }} className="relative">
            <RouteMap routes={routes || []} detailed />
            
            {hubAirport && (
              <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md text-sm">
                <div className="font-medium mb-1">Hub: {hubAirport.code} - {hubAirport.city}</div>
                <div className="text-xs text-neutral-600">{routes?.length || 0} Active Routes</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading routes...</div>
          ) : routes && routes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Flight Time</TableHead>
                  <TableHead>Demand</TableHead>
                  <TableHead>Established</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map(route => {
                  const hours = Math.floor(route.estimatedTime / 60);
                  const minutes = route.estimatedTime % 60;
                  const formattedTime = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
                  
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium font-mono">
                        {route.originCode} → {route.destinationCode}
                      </TableCell>
                      <TableCell>{route.distance.toLocaleString()} km</TableCell>
                      <TableCell>{formattedTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">{route.demand}%</span>
                          <div className="w-24 h-2 bg-neutral-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${route.demand > 70 ? 'bg-success' : route.demand > 40 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${route.demand}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(route.established).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-neutral-500 mb-4">No routes established yet</p>
              <Button onClick={() => setIsCreateRouteModalOpen(true)}>
                Create Your First Route
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isHubModalOpen && (
        <HubSelectionModal 
          isOpen={isHubModalOpen} 
          onClose={() => setIsHubModalOpen(false)} 
          airports={airports || []}
          currentHub={player?.hub || ""}
        />
      )}

      {isCreateRouteModalOpen && (
        <CreateRouteModal 
          isOpen={isCreateRouteModalOpen} 
          onClose={() => setIsCreateRouteModalOpen(false)} 
          airports={airports || []}
          hub={player?.hub || ""}
        />
      )}
    </div>
  );
}
