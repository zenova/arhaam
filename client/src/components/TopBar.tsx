import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/gameLogic";
import { DollarSign, CalendarDays, FastForward } from "lucide-react";

export default function TopBar() {
  const { player, advanceDay } = useGameContext();
  const { toast } = useToast();

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
    <div className="bg-white p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {player && (
          <div className="flex items-center text-success">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-mono font-medium">
              {formatCurrency(parseFloat(player.money))}
            </span>
          </div>
        )}
        
        <Button 
          size="sm" 
          className="bg-primary text-white hover:bg-primary/90"
          onClick={handleAdvanceDay}
        >
          <FastForward className="h-4 w-4 mr-1" />
          Advance Day
        </Button>
        
        {player && (
          <div className="flex items-center bg-neutral-200 rounded-full px-3 py-1 text-sm">
            <CalendarDays className="h-4 w-4 mr-1 text-neutral-600" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
