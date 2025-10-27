import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Calendar, Star, MapPin, CloudSun, Navigation } from 'lucide-react';

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
}

interface CompareDestinationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinations: Destination[];
}

const CompareDestinations = ({ open, onOpenChange, destinations }: CompareDestinationsProps) => {
  if (destinations.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Destinations ({destinations.length})</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg mb-1">{dest.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  {dest.city}, {dest.state}
                </div>
                <Badge className="mb-2">{dest.category}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Cost</span>
                  </div>
                  <span className="font-bold text-primary">₹{dest.cost.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-accent" />
                    <span className="font-semibold">Rating</span>
                  </div>
                  <span className="font-bold">{dest.rating}/5.0</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span className="font-semibold">Duration</span>
                  </div>
                  <span className="font-bold">{dest.duration}</span>
                </div>

                {dest.distance && dest.travelDuration && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4" />
                      <span className="font-semibold">Travel</span>
                    </div>
                    <span className="text-xs text-right">{dest.travelDuration}</span>
                  </div>
                )}

                {dest.weather && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <CloudSun className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">Climate</span>
                    </div>
                    <span className="text-xs text-right">{dest.weather.climate}</span>
                  </div>
                )}

                {dest.bestTime && (
                  <div className="py-2">
                    <div className="text-sm font-semibold mb-1">Best Time</div>
                    <div className="text-xs text-muted-foreground">{dest.bestTime}</div>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground pt-2 border-t">{dest.description}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompareDestinations;