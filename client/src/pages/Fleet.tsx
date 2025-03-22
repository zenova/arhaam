import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import AircraftCard from "@/components/AircraftCard";
import PurchaseAircraftModal from "@/components/modals/PurchaseAircraftModal";

export default function Fleet() {
  const { player } = useGameContext();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data: aircraft, isLoading } = useQuery({
    queryKey: ['/api/aircraft/player/1'],
    enabled: !!player,
  });

  const activeAircraft = aircraft?.filter(a => a.status === "active") || [];
  const maintenanceAircraft = aircraft?.filter(a => a.status === "maintenance") || [];
  const enRouteAircraft = aircraft?.filter(a => a.status === "en-route") || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fleet Management</h1>
        <Button onClick={() => setIsPurchaseModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Purchase Aircraft
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-100 p-4 rounded">
              <div className="text-sm text-neutral-600">Total Aircraft</div>
              <div className="text-2xl font-semibold">{aircraft?.length || 0}</div>
            </div>
            <div className="bg-neutral-100 p-4 rounded">
              <div className="text-sm text-neutral-600">A320neo</div>
              <div className="text-2xl font-semibold">
                {aircraft?.filter(a => a.model === "Airbus A320neo").length || 0}
              </div>
            </div>
            <div className="bg-neutral-100 p-4 rounded">
              <div className="text-sm text-neutral-600">A330-300</div>
              <div className="text-2xl font-semibold">
                {aircraft?.filter(a => a.model === "Airbus A330-300").length || 0}
              </div>
            </div>
            <div className="bg-neutral-100 p-4 rounded">
              <div className="text-sm text-neutral-600">Total Capacity</div>
              <div className="text-2xl font-semibold">
                {aircraft?.reduce((sum, a) => sum + a.capacity, 0) || 0} seats
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            All Aircraft 
            <Badge variant="secondary" className="ml-2">{aircraft?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active 
            <Badge variant="secondary" className="ml-2">{activeAircraft.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance 
            <Badge variant="secondary" className="ml-2">{maintenanceAircraft.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="en-route">
            En Route 
            <Badge variant="secondary" className="ml-2">{enRouteAircraft.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="text-center py-10">Loading aircraft...</div>
          ) : aircraft && aircraft.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aircraft.map(aircraft => (
                <AircraftCard 
                  key={aircraft.id} 
                  aircraft={aircraft} 
                  detailed 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-neutral-500 mb-4">No aircraft in your fleet yet</p>
              <Button onClick={() => setIsPurchaseModalOpen(true)}>
                Purchase Your First Aircraft
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {activeAircraft.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAircraft.map(aircraft => (
                <AircraftCard 
                  key={aircraft.id} 
                  aircraft={aircraft} 
                  detailed 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-neutral-500">No active aircraft</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          {maintenanceAircraft.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maintenanceAircraft.map(aircraft => (
                <AircraftCard 
                  key={aircraft.id} 
                  aircraft={aircraft} 
                  detailed 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-neutral-500">No aircraft in maintenance</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="en-route" className="mt-4">
          {enRouteAircraft.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enRouteAircraft.map(aircraft => (
                <AircraftCard 
                  key={aircraft.id} 
                  aircraft={aircraft} 
                  detailed 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-neutral-500">No aircraft en route</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isPurchaseModalOpen && (
        <PurchaseAircraftModal 
          isOpen={isPurchaseModalOpen} 
          onClose={() => setIsPurchaseModalOpen(false)} 
        />
      )}
    </div>
  );
}
