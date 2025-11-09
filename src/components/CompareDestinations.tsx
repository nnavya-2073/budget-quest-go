import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, Calendar, Star, MapPin, CloudSun, Navigation, Plane, Hotel, Utensils, Activity as ActivityIcon } from 'lucide-react';

interface Destination {
  city: string;
  name: string;
  state: string;
  category: string;
  cost: number;
  duration: string;
  rating: number;
  description: string;
  distance?: number;
  travelDuration?: string;
  weather?: { climate: string; avgTemp: string };
  bestTime?: string;
  hotels?: Array<{ pricePerNight: number }>;
  activities?: Array<{ cost: number }>;
  restaurants?: any[];
  travelOptions?: Array<{ mode: string; cost: number }>;
}

interface CompareDestinationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinations: Destination[];
}

const CompareDestinations = ({ open, onOpenChange, destinations }: CompareDestinationsProps) => {
  if (destinations.length === 0) return null;

  const getAvgHotelPrice = (dest: Destination) => {
    if (!dest.hotels || dest.hotels.length === 0) return 'N/A';
    const avg = dest.hotels.reduce((sum, h) => sum + h.pricePerNight, 0) / dest.hotels.length;
    return `₹${Math.round(avg).toLocaleString('en-IN')}`;
  };

  const getAvgActivityCost = (dest: Destination) => {
    if (!dest.activities || dest.activities.length === 0) return 'N/A';
    const avg = dest.activities.reduce((sum, a) => sum + a.cost, 0) / dest.activities.length;
    return `₹${Math.round(avg).toLocaleString('en-IN')}`;
  };

  const getCheapestTravel = (dest: Destination) => {
    if (!dest.travelOptions || dest.travelOptions.length === 0) return 'N/A';
    const cheapest = dest.travelOptions.reduce((min, opt) => opt.cost < min.cost ? opt : min);
    return `${cheapest.mode}: ₹${cheapest.cost.toLocaleString('en-IN')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Destinations ({destinations.length})</DialogTitle>
          <p className="text-sm text-muted-foreground">Side-by-side comparison with detailed metrics</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="pb-3 border-b">
                  <h3 className="font-bold text-xl mb-2">{dest.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {dest.city}, {dest.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{dest.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-bold">{dest.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3">
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="w-5 h-5 text-primary" />
                      <span className="text-sm font-semibold">Total Trip Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">₹{dest.cost.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Duration</span>
                      </div>
                      <p className="text-sm font-bold">{dest.duration}</p>
                    </div>

                    {dest.distance && (
                      <div className="border rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Navigation className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Distance</span>
                        </div>
                        <p className="text-sm font-bold">{dest.distance} km</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-xs">
                      <Hotel className="w-4 h-4 text-secondary" />
                      <span>Avg Hotel/Night</span>
                    </div>
                    <span className="text-sm font-semibold">{getAvgHotelPrice(dest)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-xs">
                      <ActivityIcon className="w-4 h-4 text-accent" />
                      <span>Avg Activity</span>
                    </div>
                    <span className="text-sm font-semibold">{getAvgActivityCost(dest)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-xs">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      <span>Restaurants</span>
                    </div>
                    <span className="text-sm font-semibold">{dest.restaurants?.length || 0} options</span>
                  </div>

                  {dest.travelOptions && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2 text-xs">
                        <Plane className="w-4 h-4 text-primary" />
                        <span>Cheapest Travel</span>
                      </div>
                      <span className="text-xs font-semibold text-right">{getCheapestTravel(dest)}</span>
                    </div>
                  )}
                </div>

                {/* Weather & Timing */}
                {(dest.weather || dest.bestTime) && (
                  <div className="space-y-2 pt-2 border-t">
                    {dest.weather && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CloudSun className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-semibold">Climate</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dest.weather.climate}</p>
                        <p className="text-xs text-muted-foreground">{dest.weather.avgTemp}</p>
                      </div>
                    )}

                    {dest.bestTime && (
                      <div>
                        <div className="text-xs font-semibold mb-1">Best Time to Visit</div>
                        <p className="text-xs text-muted-foreground">{dest.bestTime}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed">{dest.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {destinations.length > 1 && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Quick Comparison:</strong> {destinations[0].name} is{' '}
              {destinations[0].cost < destinations[1].cost ? 'cheaper' : 'more expensive'} than{' '}
              {destinations[1].name} by ₹{Math.abs(destinations[0].cost - destinations[1].cost).toLocaleString('en-IN')}.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompareDestinations;