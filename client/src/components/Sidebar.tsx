import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Plane, 
  LayoutDashboard, 
  Route as RouteIcon, 
  Calendar, 
  BarChart4, 
  Settings, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Globe
} from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
      section: "Operations"
    },
    { 
      path: "/fleet", 
      label: "Fleet Management", 
      icon: <Plane className="w-5 h-5" />,
      section: "Operations"
    },
    { 
      path: "/routes", 
      label: "Route Network", 
      icon: <Globe className="w-5 h-5" />,
      section: "Operations"
    },
    { 
      path: "/schedule", 
      label: "Flight Scheduling", 
      icon: <Calendar className="w-5 h-5" />,
      section: "Operations"
    },
    { 
      path: "/finances", 
      label: "Financial Overview", 
      icon: <BarChart4 className="w-5 h-5" />,
      section: "Operations"
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: <Settings className="w-5 h-5" />,
      section: "System"
    }
  ];

  return (
    <div 
      className={cn(
        "bg-background/50 backdrop-blur-lg border-r border-white/5 text-foreground h-full flex flex-col transition-all duration-300 glass-panel shadow-lg",
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center">
          <div className="bg-primary rounded-full p-2 mr-3 animate-pulse-glow">
            <Plane className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <h1 className="font-bold text-lg bg-gradient-to-r from-white via-primary-foreground to-white bg-clip-text text-transparent">
              Airways Manager
            </h1>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <nav className="p-4 flex-grow overflow-y-auto">
        {!collapsed && (
          <div className="mb-4 pl-4 text-xs text-primary/70 uppercase font-semibold tracking-wider">Operations</div>
        )}
        <ul className="space-y-2 px-2">
          {navItems
            .filter(item => item.section === "Operations")
            .map(item => (
              <li key={item.path} className="group">
                <Link href={item.path}>
                  <a 
                    className={cn(
                      "flex items-center p-3 rounded-lg transition-all duration-200",
                      location === item.path 
                        ? 'bg-primary/20 text-white shadow-[0_0_10px_rgba(149,76,233,0.3)]' 
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span className={cn(
                      "flex-shrink-0 mr-3 transition-transform duration-200",
                      location === item.path && "text-primary"
                    )}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={cn(
                        "transition-all duration-200",
                        location === item.path ? "font-medium" : ""
                      )}>
                        {item.label}
                      </span>
                    )}
                    
                    {location === item.path && (
                      <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                    )}
                  </a>
                </Link>
              </li>
            ))
          }
        </ul>
        
        {!collapsed && (
          <div className="my-4 pl-4 text-xs text-primary/70 uppercase font-semibold tracking-wider">System</div>
        )}
        <ul className="space-y-2 px-2">
          {navItems
            .filter(item => item.section === "System")
            .map(item => (
              <li key={item.path} className="group">
                <Link href={item.path}>
                  <a 
                    className={cn(
                      "flex items-center p-3 rounded-lg transition-all duration-200",
                      location === item.path 
                        ? 'bg-primary/20 text-white shadow-[0_0_10px_rgba(149,76,233,0.3)]' 
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span className={cn(
                      "flex-shrink-0 mr-3 transition-transform duration-200",
                      location === item.path && "text-primary"
                    )}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={cn(
                        "transition-all duration-200",
                        location === item.path ? "font-medium" : ""
                      )}>
                        {item.label}
                      </span>
                    )}
                    
                    {location === item.path && (
                      <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                    )}
                  </a>
                </Link>
              </li>
            ))
          }
          <li>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start p-3 text-muted-foreground hover:text-white border-white/10 hover:bg-primary/20 font-normal rounded-lg mt-2 transition-all duration-200",
                !collapsed ? "pl-3" : "px-2"
              )}
              onClick={handleSaveGame}
            >
              <Save className="w-5 h-5 mr-3" />
              {!collapsed && <span>Save Game</span>}
            </Button>
          </li>
        </ul>
      </nav>
      
      {!collapsed && player && (
        <div className="p-4 mx-2 mb-4 rounded-lg border-t border-white/10 bg-white/5">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center mr-3 border border-primary/50">
              <span className="font-bold text-white">
                {player.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-white">{player.username}</div>
              <div className="text-xs text-primary/80">Chief Executive Officer</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
