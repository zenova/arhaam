import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import FlightCard from "@/components/FlightCard";
import ScheduleFlightModal from "@/components/modals/ScheduleFlightModal";

export default function Schedule() {
  const { player } = useGameContext();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    player ? new Date(player.currentDate) : new Date()
  );

  const { data: allFlights, isLoading } = useQuery({
    queryKey: ['/api/flights/player/1'],
    enabled: !!player,
  });

  const { data: upcomingFlights } = useQuery({
    queryKey: ['/api/flights/player/1/upcoming'],
    enabled: !!player,
  });

  // Categorize flights
  const scheduledFlights = allFlights?.filter(f => f.status === "scheduled") || [];
  const inProgressFlights = allFlights?.filter(f => f.status === "in-progress") || [];
  const completedFlights = allFlights?.filter(f => f.status === "completed") || [];
  
  // Filter flights for selected date
  const selectedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : "";
  const flightsOnSelectedDate = allFlights?.filter(f => f.departureDate === selectedDateStr) || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flight Schedule</h1>
        <Button onClick={() => setIsScheduleModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Flight
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Flights</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">Loading flights...</div>
            ) : upcomingFlights && upcomingFlights.length > 0 ? (
              <div className="space-y-4">
                {upcomingFlights.slice(0, 5).map(flight => (
                  <FlightCard key={flight.id} flight={flight} detailed />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-neutral-500 mb-4">No upcoming flights</p>
                <Button onClick={() => setIsScheduleModalOpen(true)}>
                  Schedule Your First Flight
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Flight Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={{ before: player ? new Date(player.currentDate) : new Date() }}
              modifiers={{
                booked: allFlights?.map(f => new Date(f.departureDate)) || [],
              }}
              modifiersStyles={{
                booked: { 
                  backgroundColor: 'rgba(0, 115, 194, 0.1)',
                  fontWeight: 'bold',
                  color: '#0073C2'
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Flight Management</CardTitle>
            <div className="text-sm text-neutral-500">
              {selectedDate && `Selected: ${selectedDate.toLocaleDateString()}`}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All Flights 
                <Badge variant="secondary" className="ml-2">{allFlights?.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled 
                <Badge variant="secondary" className="ml-2">{scheduledFlights.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress 
                <Badge variant="secondary" className="ml-2">{inProgressFlights.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed 
                <Badge variant="secondary" className="ml-2">{completedFlights.length}</Badge>
              </TabsTrigger>
              {selectedDate && (
                <TabsTrigger value="selected-date">
                  {selectedDate.toLocaleDateString()}
                  <Badge variant="secondary" className="ml-2">{flightsOnSelectedDate.length}</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {allFlights && allFlights.length > 0 ? (
                <div className="space-y-4">
                  {allFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} detailed />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-500">No flights found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="mt-4">
              {scheduledFlights.length > 0 ? (
                <div className="space-y-4">
                  {scheduledFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} detailed />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-500">No scheduled flights</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4">
              {inProgressFlights.length > 0 ? (
                <div className="space-y-4">
                  {inProgressFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} detailed />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-500">No flights in progress</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {completedFlights.length > 0 ? (
                <div className="space-y-4">
                  {completedFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} detailed />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-500">No completed flights</p>
                </div>
              )}
            </TabsContent>

            {selectedDate && (
              <TabsContent value="selected-date" className="mt-4">
                {flightsOnSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {flightsOnSelectedDate.map(flight => (
                      <FlightCard key={flight.id} flight={flight} detailed />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-500">No flights on {selectedDate.toLocaleDateString()}</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      Schedule Flight on This Day
                    </Button>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {isScheduleModalOpen && (
        <ScheduleFlightModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
          initialDate={selectedDate}
        />
      )}
    </div>
  );
}
