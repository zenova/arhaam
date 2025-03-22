import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/gameLogic";
import { DollarSign, CalendarDays, FastForward, Plane } from "lucide-react";
import { useLocation } from "wouter";

export default function TopBar() {
  const { player, advanceDay } = useGameContext();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Get page title from location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/fleet":
        return "Fleet Management";
      case "/routes":
        return "Route Network";
      case "/schedule":
        return "Flight Scheduling";
      case "/finances":
        return "Financial Overview";
      default:
        return "Dashboard";
    }
  };

  const handleAdvanceDay = async () => {
    try {
      const result = await advanceDay();
      
      if (result.completedFlights > 0) {
        toast({
          title: `Day Advanced`,
          description: `${result.completedFlights} flights completed, earning ${formatCurrency(result.revenue)}`,
          duration: 3000,
        });
      } else {
        toast({
          title: `Day Advanced`,
          description: "No flights were scheduled for today.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to advance the day",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Format the current date
  const formattedDate = player ? new Date(player.currentDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  return (
    <div className="bg-background/70 backdrop-blur-lg p-4 flex justify-between items-center border-b border-white/10">
      <div className="flex items-center">
        <div className="bg-primary rounded-full p-1.5 mr-3 animate-pulse-glow">
          <Plane className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-white via-primary-foreground to-white bg-clip-text text-transparent">
            Airways Manager
          </h1>
          <h2 className="text-sm text-muted-foreground">{getPageTitle()}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {player && (
          <div className="flex items-center bg-background/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md border border-white/10">
            <DollarSign className="h-4 w-4 mr-1 text-green-400" />
            <span className="font-mono font-bold text-green-400">
              {formatCurrency(parseFloat(player.money))}
            </span>
          </div>
        )}
        
        <Button 
          variant="default"
          size="sm" 
          className="bg-primary hover:bg-primary/80 text-white shadow-lg transition-all hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(149,76,233,0.5)]"
          onClick={handleAdvanceDay}
        >
          <FastForward className="h-4 w-4 mr-1" />
          Advance Day
        </Button>
        
        {player && (
          <div className="flex items-center bg-background/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md border border-white/10">
            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
