import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, IndianRupee, Calendar, Star, Utensils, Heart, ExternalLink, Trash2, TrendingUp, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CostBreakdown from "./CostBreakdown";

interface DestinationCardProps {
  city: string;
  name: string;
  state: string;
  category: string;
  cost: number;
  duration: string;
  rating: number;
  image: string;
  restaurants: string[];
  description: string;
  distance?: number;
  travelDuration?: string;
  savedTripId?: string;
  onDelete?: (id: string) => void;
}

const DestinationCard = ({
  city,
  name,
  state,
  category,
  cost,
  duration,
  rating,
  image,
  restaurants,
  description,
  distance,
  travelDuration,
  savedTripId,
  onDelete,
}: DestinationCardProps) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleSaveTrip = async () => {
    if (!user) {
      toast.error("Please sign in to save trips");
      navigate("/auth");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("saved_trips").insert({
      user_id: user.id,
      destination_name: city || name,
      destination_state: state,
      category,
      cost,
      duration,
      rating,
      description,
      restaurants,
      image_url: image,
    });

    setIsSaving(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("Trip already saved");
      } else {
        toast.error("Failed to save trip");
      }
    } else {
      toast.success("Trip saved successfully!");
    }
  };

  const handleBooking = () => {
    const searchQuery = encodeURIComponent(`${name} ${state} travel booking`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
  };
  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.02] group">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary/90 backdrop-blur-sm">{category}</Badge>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl mb-2">{name}</CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {city}, {state}
              </div>
              {distance && travelDuration && (
                <div className="flex items-center gap-1 text-xs">
                  <Navigation className="w-3 h-3" />
                  {distance.toLocaleString()} km • {travelDuration}
                </div>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {/* Cost and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-primary" />
            <div>
              <div className="font-semibold text-primary">₹{cost.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-secondary" />
            <div>
              <div className="font-semibold">{duration}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
        </div>

        {/* Restaurants */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Utensils className="w-4 h-4 text-accent" />
            Top Restaurants
          </div>
          <div className="flex flex-wrap gap-2">
            {restaurants.slice(0, 3).map((restaurant, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {restaurant}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {savedTripId && onDelete ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Breakdown
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{name} - Cost Details</DialogTitle>
                  </DialogHeader>
                  <CostBreakdown totalCost={cost} />
                </DialogContent>
              </Dialog>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => onDelete(savedTripId)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSaveTrip}
                disabled={isSaving}
              >
                <Heart className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Breakdown
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{name} - Cost Details</DialogTitle>
                  </DialogHeader>
                  <CostBreakdown totalCost={cost} />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        <Button variant="default" className="w-full mt-2" onClick={handleBooking}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
