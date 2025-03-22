import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane } from "lucide-react";
import { useGameContext } from "@/contexts/GameContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/gameLogic";
import { AIRCRAFT_MODELS } from "@/utils/constants";
import type { Aircraft } from "@shared/schema";

interface PurchaseAircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseAircraftModal({ isOpen, onClose }: PurchaseAircraftModalProps) {
  const { player } = useGameContext();
  const { toast } = useToast();
  
  // State for aircraft selection and customization
  const [selectedModel, setSelectedModel] = useState<"A320neo" | "A330-300">("A320neo");
  const [cabinLayout, setCabinLayout] = useState<"standard" | "business" | "economy">("standard");
  const [hasWifi, setHasWifi] = useState(false);
  const [hasEntertainment, setHasEntertainment] = useState(false);
  const [hasPremiumSeating, setHasPremiumSeating] = useState(false);
  const [registration, setRegistration] = useState("");
  const [deliveryAirport, setDeliveryAirport] = useState(player?.hub || "JFK");
  
  // Get airports data
  const { data: airports } = useQuery({
    queryKey: ['/api/airports'],
    enabled: isOpen,
  });
  
  // Calculate aircraft configuration and pricing
  const getSelectedAircraft = () => {
    const baseAircraft = AIRCRAFT_MODELS[selectedModel];
    
    // Adjust capacity based on cabin layout
    let capacity = baseAircraft.capacity;
    if (cabinLayout === "business") {
      capacity = Math.floor(capacity * 0.87); // 13% less capacity for business focus
    } else if (cabinLayout === "economy") {
      capacity = Math.floor(capacity * 1.08); // 8% more capacity for economy max
    }
    
    // Calculate additional costs for options
    const wifiCost = hasWifi ? 1200000 : 0;
    const entertainmentCost = hasEntertainment ? 3500000 : 0;
    const premiumSeatingCost = hasPremiumSeating ? 2800000 : 0;
    
    // Calculate total price
    const totalPrice = baseAircraft.price + wifiCost + entertainmentCost + premiumSeatingCost;
    
    return {
      ...baseAircraft,
      capacity,
      totalPrice,
      wifiCost,
      entertainmentCost,
      premiumSeatingCost
    };
  };
  
  const aircraft = getSelectedAircraft();
  
  // Mutation for purchasing aircraft
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      // Format the data for the API
      const maintenanceDue = new Date();
      maintenanceDue.setDate(maintenanceDue.getDate() + 30); // Maintenance due in 30 days
      
      const purchaseData = {
        playerId: player?.id,
        model: `Airbus ${selectedModel}`,
        registration: `N${registration}`,
        capacity: aircraft.capacity,
        range: aircraft.range,
        cruisingSpeed: aircraft.cruisingSpeed,
        fuelEfficiency: aircraft.fuelEfficiency,
        purchasePrice: aircraft.totalPrice.toString(),
        purchaseDate: new Date().toISOString().split('T')[0],
        maintenanceDue: maintenanceDue.toISOString().split('T')[0],
        hasWifi,
        hasEntertainment,
        hasPremiumSeating
      };
      
      return apiRequest('POST', '/api/aircraft', purchaseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/aircraft/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/player/1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players/1'] });
      
      toast({
        title: "Purchase Successful",
        description: `You have purchased a new Airbus ${selectedModel}.`,
        duration: 5000,
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  });
  
  // Validate purchase form
  const validateForm = () => {
    if (!registration || registration.length < 3 || registration.length > 5) {
      toast({
        title: "Invalid Registration",
        description: "Registration must be 3-5 characters",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!deliveryAirport) {
      toast({
        title: "Invalid Delivery Airport",
        description: "Please select a delivery airport",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!player || parseFloat(player.money) < aircraft.totalPrice) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${formatCurrency(aircraft.totalPrice)} to purchase this aircraft`,
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    return true;
  };
  
  // Handle purchase submission
  const handlePurchase = () => {
    if (validateForm()) {
      purchaseMutation.mutate();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Purchase New Aircraft</DialogTitle>
          <DialogDescription>
            Select an aircraft model and customize its configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h4 className="text-lg font-medium mb-4">Select Aircraft Model</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* A320neo Card */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all
                ${selectedModel === "A320neo" 
                  ? "border-primary bg-primary/5" 
                  : "border-neutral-200 hover:border-primary/50"}`}
              onClick={() => setSelectedModel("A320neo")}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Plane className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-medium">Airbus A320neo</h5>
                  <p className="text-xs text-neutral-600">Narrow-body aircraft</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`${selectedModel === "A320neo" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Capacity</div>
                  <div className="font-medium">180 passengers</div>
                </div>
                <div className={`${selectedModel === "A320neo" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Range</div>
                  <div className="font-medium">6,500 km</div>
                </div>
                <div className={`${selectedModel === "A320neo" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Cruising Speed</div>
                  <div className="font-medium">870 km/h</div>
                </div>
                <div className={`${selectedModel === "A320neo" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Fuel Efficiency</div>
                  <div className="font-medium">2.4 l/passenger/100km</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="text-2xl font-bold">{formatCurrency(AIRCRAFT_MODELS.A320neo.price)}</div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-success mr-1"></span>
                  <span className="text-sm">Available now</span>
                </div>
              </div>
              
              <div className="text-xs text-neutral-600 mb-4">
                The A320neo (new engine option) is one of the best-selling single-aisle aircraft offering excellent fuel efficiency and passenger comfort.
              </div>
            </div>
            
            {/* A330-300 Card */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all
                ${selectedModel === "A330-300" 
                  ? "border-primary bg-primary/5" 
                  : "border-neutral-200 hover:border-primary/50"}`}
              onClick={() => setSelectedModel("A330-300")}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Plane className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-medium">Airbus A330-300</h5>
                  <p className="text-xs text-neutral-600">Wide-body aircraft</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`${selectedModel === "A330-300" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Capacity</div>
                  <div className="font-medium">295 passengers</div>
                </div>
                <div className={`${selectedModel === "A330-300" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Range</div>
                  <div className="font-medium">11,300 km</div>
                </div>
                <div className={`${selectedModel === "A330-300" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Cruising Speed</div>
                  <div className="font-medium">871 km/h</div>
                </div>
                <div className={`${selectedModel === "A330-300" ? "bg-white" : "bg-neutral-100"} p-2 rounded`}>
                  <div className="text-xs text-neutral-500">Fuel Efficiency</div>
                  <div className="font-medium">3.2 l/passenger/100km</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="text-2xl font-bold">{formatCurrency(AIRCRAFT_MODELS.A330300.price)}</div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-warning mr-1"></span>
                  <span className="text-sm">4 week delivery</span>
                </div>
              </div>
              
              <div className="text-xs text-neutral-600 mb-4">
                The A330-300 is a wide-body twin-engine aircraft offering excellent range and passenger capacity for long-haul international routes.
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="py-4">
          <h4 className="text-lg font-medium mb-4">Customize Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2 text-sm">Cabin Layout</h5>
              <RadioGroup 
                value={cabinLayout} 
                onValueChange={(value) => setCabinLayout(value as "standard" | "business" | "economy")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="layout-standard" />
                  <Label htmlFor="layout-standard">
                    Standard ({aircraft.capacity} seats)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="layout-business" />
                  <Label htmlFor="layout-business">
                    Business Focus ({Math.floor(AIRCRAFT_MODELS[selectedModel].capacity * 0.87)} seats)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="economy" id="layout-economy" />
                  <Label htmlFor="layout-economy">
                    Economy Max ({Math.floor(AIRCRAFT_MODELS[selectedModel].capacity * 1.08)} seats)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h5 className="font-medium mb-2 text-sm">Customization Options</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="option-wifi" 
                      checked={hasWifi}
                      onCheckedChange={(checked) => setHasWifi(!!checked)}
                    />
                    <Label htmlFor="option-wifi">In-flight WiFi</Label>
                  </div>
                  <span className="text-sm">+$1.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="option-entertainment" 
                      checked={hasEntertainment}
                      onCheckedChange={(checked) => setHasEntertainment(!!checked)}
                    />
                    <Label htmlFor="option-entertainment">Entertainment System</Label>
                  </div>
                  <span className="text-sm">+$3.5M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="option-seats" 
                      checked={hasPremiumSeating}
                      onCheckedChange={(checked) => setHasPremiumSeating(!!checked)}
                    />
                    <Label htmlFor="option-seats">Premium Seating</Label>
                  </div>
                  <span className="text-sm">+$2.8M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="py-4">
          <h4 className="text-lg font-medium mb-4">Registration & Delivery</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="registration" className="block text-sm font-medium mb-1">Aircraft Registration</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-md text-sm text-neutral-600">
                  N
                </span>
                <Input 
                  id="registration"
                  className="rounded-l-none"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                  placeholder="e.g. 123ST"
                  maxLength={5}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">Registration must be 3-5 characters (letters and numbers)</p>
            </div>
            
            <div>
              <Label htmlFor="delivery-airport" className="block text-sm font-medium mb-1">Delivery Airport</Label>
              <Select 
                value={deliveryAirport} 
                onValueChange={setDeliveryAirport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an airport" />
                </SelectTrigger>
                <SelectContent>
                  {airports?.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      {airport.code} - {airport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-100 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-medium">Summary</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(aircraft.totalPrice)}</div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Airbus {selectedModel} (Base)</span>
              <span>{formatCurrency(AIRCRAFT_MODELS[selectedModel].price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{cabinLayout.charAt(0).toUpperCase() + cabinLayout.slice(1)} Layout ({aircraft.capacity} seats)</span>
              <span>Included</span>
            </div>
            {(hasWifi || hasEntertainment || hasPremiumSeating) && (
              <div className="flex justify-between text-sm font-medium">
                <span>Customization Options</span>
                <span>{formatCurrency(
                  (hasWifi ? 1200000 : 0) + 
                  (hasEntertainment ? 3500000 : 0) + 
                  (hasPremiumSeating ? 2800000 : 0)
                )}</span>
              </div>
            )}
            {hasWifi && (
              <div className="flex justify-between text-sm pl-4">
                <span>- In-flight WiFi</span>
                <span>$1,200,000</span>
              </div>
            )}
            {hasEntertainment && (
              <div className="flex justify-between text-sm pl-4">
                <span>- Entertainment System</span>
                <span>$3,500,000</span>
              </div>
            )}
            {hasPremiumSeating && (
              <div className="flex justify-between text-sm pl-4">
                <span>- Premium Seating</span>
                <span>$2,800,000</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>Included</span>
            </div>
          </div>
          
          <div className="text-sm text-neutral-600">
            <span className="inline-block mr-1">ℹ️</span>
            Estimated weekly operating cost: {formatCurrency(selectedModel === "A320neo" ? 285000 : 450000)}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
