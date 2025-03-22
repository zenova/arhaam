import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useGameContext } from "@/contexts/GameContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Airport } from "@shared/schema";

interface HubSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  airports: Airport[];
  currentHub: string;
}

export default function HubSelectionModal({ isOpen, onClose, airports, currentHub }: HubSelectionModalProps) {
  const { player } = useGameContext();
  const { toast } = useToast();
  const [selectedHub, setSelectedHub] = useState(currentHub);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter airports based on search query
  const filteredAirports = airports.filter(airport => {
    const query = searchQuery.toLowerCase();
    return airport.code.toLowerCase().includes(query) || 
           airport.name.toLowerCase().includes(query) ||
           airport.city.toLowerCase().includes(query) ||
           airport.country.toLowerCase().includes(query);
  });
  
  // Mutation for updating hub
  const updateHubMutation = useMutation({
    mutationFn: async () => {
      if (!player) throw new Error("Player not found");
      
      return apiRequest('PATCH', `/api/players/${player.id}`, {
        hub: selectedHub
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
      
      toast({
        title: "Hub Updated",
        description: `Your new hub is ${selectedHub}`,
        duration: 3000,
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  const handleUpdateHub = () => {
    if (selectedHub === currentHub) {
      onClose();
      return;
    }
    
    updateHubMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Hub Airport</DialogTitle>
          <DialogDescription>
            Your hub airport serves as your airline's main base of operations
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Input
            placeholder="Search airports by code, name, city, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-neutral-100 px-4 py-2 grid grid-cols-12 text-sm font-medium">
              <div className="col-span-2">Code</div>
              <div className="col-span-4">Airport</div>
              <div className="col-span-3">City</div>
              <div className="col-span-3">Country</div>
            </div>
            
            <div className="max-h-[40vh] overflow-y-auto">
              <RadioGroup 
                value={selectedHub} 
                onValueChange={setSelectedHub}
              >
                {filteredAirports.map(airport => (
                  <div 
                    key={airport.code}
                    className={`px-4 py-3 border-t border-neutral-200 grid grid-cols-12 items-center hover:bg-neutral-50 transition-colors
                      ${airport.code === selectedHub ? 'bg-primary/5' : ''}
                    `}
                  >
                    <div className="col-span-2 flex items-center">
                      <RadioGroupItem 
                        value={airport.code} 
                        id={`airport-${airport.code}`}
                        className="mr-2"
                      />
                      <Label htmlFor={`airport-${airport.code}`} className="font-mono font-medium">
                        {airport.code}
                      </Label>
                    </div>
                    <div className="col-span-4 truncate">{airport.name}</div>
                    <div className="col-span-3 truncate">{airport.city}</div>
                    <div className="col-span-3 truncate">{airport.country}</div>
                  </div>
                ))}
              </RadioGroup>
              
              {filteredAirports.length === 0 && (
                <div className="px-4 py-8 text-center text-neutral-500">
                  No airports found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateHub}
            disabled={updateHubMutation.isPending}
          >
            {updateHubMutation.isPending ? 'Updating...' : 'Change Hub'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
