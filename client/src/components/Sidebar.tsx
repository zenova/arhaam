import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  const [location] = useLocation();
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
    <div 
      className={`bg-neutral-800 text-white h-full flex flex-col shadow-md transition-all duration-300 
      ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center">
          <Plane className="text-accent mr-2" />
          {!collapsed && <h1 className="text-xl font-bold">SkyTycoon</h1>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-400 hover:text-white hover:bg-neutral-700"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <nav className="p-4 flex-grow overflow-y-auto">
        {!collapsed && (
          <div className="mb-2 text-xs text-neutral-500 uppercase font-semibold">Management</div>
        )}
        <ul className="space-y-1">
          {navItems
            .filter(item => item.section === "Management")
            .map(item => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a 
                    className={`flex items-center p-2 rounded transition-colors
                      ${location === item.path 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-300 hover:bg-neutral-700'}`}
                  >
                    <span className="w-5 mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                </Link>
              </li>
            ))
          }
        </ul>
        
        {!collapsed && (
          <div className="my-2 text-xs text-neutral-500 uppercase font-semibold">Game</div>
        )}
        <ul className="space-y-1">
          {navItems
            .filter(item => item.section === "Game")
            .map(item => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a 
                    className={`flex items-center p-2 rounded transition-colors
                      ${location === item.path 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-300 hover:bg-neutral-700'}`}
                  >
                    <span className="w-5 mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                </Link>
              </li>
            ))
          }
          <li>
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 text-neutral-300 hover:bg-neutral-700 hover:text-white font-normal"
              onClick={handleSaveGame}
            >
              <Save className="w-5 h-5 mr-3" />
              {!collapsed && <span>Save Game</span>}
            </Button>
          </li>
        </ul>
      </nav>
      
      {!collapsed && player && (
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mr-2">
              <span className="font-semibold">
                {player.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium">{player.username}</div>
              <div className="text-xs text-neutral-400">CEO</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
