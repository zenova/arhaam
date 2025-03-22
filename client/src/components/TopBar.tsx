import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/gameLogic";
import { DollarSign, CalendarDays, FastForward, TrendingUp, TrendingDown } from "lucide-react";

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
    <div className="taskbar">
      <div className="taskbar-left">
        <div className="taskbar-item">
          <CalendarDays className="text-[#64ffda]" size={18} />
          <span className="taskbar-text">{formattedDate}</span>
        </div>
      </div>
      
      <div className="taskbar-center">
        <button 
          id="timeToggle" 
          className="flex items-center justify-center"
          onClick={handleAdvanceDay}
        >
          <FastForward size={20} />
        </button>
      </div>
      
      <div className="taskbar-right">
        {player && (
          <div className="taskbar-item">
            <DollarSign className="text-[#64ffda]" size={18} />
            <span className="taskbar-text font-bold">
              {formatCurrency(parseFloat(player.money))}
            </span>
            <div className="money-trend">
              <div className="trend-item gain">
                <TrendingUp size={12} />
                <span className="trend-value">+$1.2M</span>
                <span>today</span>
              </div>
              <div className="trend-item loss">
                <TrendingDown size={12} />
                <span className="trend-value">-$250K</span>
                <span>costs</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
