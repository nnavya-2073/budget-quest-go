import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import DestinationCard from "@/components/DestinationCard";
import WeatherForecast from "@/components/WeatherForecast";
import { toast } from "sonner";
import { Loader2, CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SavedTrip {
  id: string;
  destination_name: string;
  destination_state: string;
  category: string;
  cost: number;
  duration: string;
  rating: number;
  description: string;
  restaurants: string[];
  image_url: string;
}

const SavedTrips = () => {
  const navigate = useNavigate();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showWeather, setShowWeather] = useState(false);

  useEffect(() => {
    checkAuthAndFetchTrips();
  }, []);

  const checkAuthAndFetchTrips = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view saved trips");
      navigate("/auth");
      return;
    }

    fetchSavedTrips();
  };

  const fetchSavedTrips = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("saved_trips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved trips:", error);
      toast.error("Failed to load saved trips");
    } else {
      setSavedTrips(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("saved_trips")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove trip");
    } else {
      toast.success("Trip removed from saved");
      setSavedTrips(savedTrips.filter(trip => trip.id !== id));
    }
  };

  const handleViewWeather = (cityName: string) => {
    setSelectedCity(cityName);
    setShowWeather(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Saved Trips</h1>
            <p className="text-muted-foreground">Your collection of dream destinations</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">No saved trips yet</p>
              <p className="text-sm text-muted-foreground">Start exploring and save your favorite destinations!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="relative">
                  <DestinationCard
                    city={trip.destination_name}
                    name={trip.destination_name}
                    state={trip.destination_state}
                    category={trip.category}
                    cost={trip.cost}
                    duration={trip.duration}
                    rating={trip.rating}
                    image={trip.image_url}
                    restaurants={trip.restaurants}
                    description={trip.description}
                    savedTripId={trip.id}
                    onDelete={handleDelete}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleViewWeather(trip.destination_name)}
                  >
                    <CloudSun className="w-4 h-4 mr-2" />
                    View Weather
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weather Dialog */}
      <Dialog open={showWeather} onOpenChange={setShowWeather}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Weather Forecast</DialogTitle>
          </DialogHeader>
          {selectedCity && <WeatherForecast city={selectedCity} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedTrips;
