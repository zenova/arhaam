import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Plane, 
  LayoutDashboard, 
  Route as RouteIcon, 
  Calendar, 
  BarChart, 
  Settings, 
  Save, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { player, saveGame } = useGameContext();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();

  const handleSaveGame = async () => {
    try {
      await saveGame();
      toast({
        title: "Game Saved",
        description: "Your progress has been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your game.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const navItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-5 h-5" />,
      section: "Management"
    },
    { 
      path: "/fleet", 
      label: "Fleet", 
      icon: <Plane className="w-5 h-5" />,
      section: "Management"
    },
    { 
      path: "/routes", 
      label: "Routes", 
      icon: <RouteIcon className="w-5 h-5" />,
      section: "Management"
    },
    { 
      path: "/schedule", 
      label: "Schedule", 
      icon: <Calendar className="w-5 h-5" />,
      section: "Management"
    },
    { 
      path: "/finances", 
      label: "Finances", 
      icon: <BarChart className="w-5 h-5" />,
      section: "Management"
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: <Settings className="w-5 h-5" />,
      section: "Game"
    }
  ];

  return (
    <div className={`side-pane h-full flex flex-col ${collapsed ? 'w-20' : 'w-280'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Plane className="text-[#64ffda] mr-2" size={collapsed ? 24 : 28} />
          {!collapsed && <h2 className="text-2xl">SkyTycoon</h2>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-[rgba(255,255,255,0.1)]"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <nav className="flex-grow overflow-y-auto mb-6">
        {!collapsed && (
          <div className="mb-4 text-xs text-[rgba(255,255,255,0.6)] uppercase font-semibold tracking-wider">
            Management
          </div>
        )}
        <ul className="space-y-3">
          {navItems
            .filter(item => item.section === "Management")
            .map(item => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all
                    ${location === item.path 
                      ? 'bg-[rgba(255,255,255,0.1)] text-[#64ffda]' 
                      : 'text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                >
                  <span className={`${collapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))
          }
        </ul>
        
        {!collapsed && (
          <div className="my-4 text-xs text-[rgba(255,255,255,0.6)] uppercase font-semibold tracking-wider">
            Game Options
          </div>
        )}
        <ul className="space-y-3">
          {navItems
            .filter(item => item.section === "Game")
            .map(item => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all
                    ${location === item.path 
                      ? 'bg-[rgba(255,255,255,0.1)] text-[#64ffda]' 
                      : 'text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                >
                  <span className={`${collapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))
          }
          <li>
            <button 
              className="w-full flex items-center p-3 rounded-xl text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
              onClick={handleSaveGame}
            >
              <Save className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span className="font-medium">Save Game</span>}
            </button>
          </li>
        </ul>
      </nav>
      
      {!collapsed && player && (
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#00b4d8] flex items-center justify-center mr-3">
              <span className="font-bold text-white">
                {player.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-white">{player.username}</div>
              <div className="text-xs text-[rgba(255,255,255,0.6)]">Airline CEO</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
