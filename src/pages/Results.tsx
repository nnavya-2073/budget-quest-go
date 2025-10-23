import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DestinationCard from "@/components/DestinationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mountainsImg from "@/assets/destination-mountains.jpg";
import cultureImg from "@/assets/destination-culture.jpg";
import beachImg from "@/assets/destination-beach.jpg";

interface Destination {
  name: string;
  state: string;
  category: string;
  cost: number;
  duration: string;
  rating: number;
  image: string;
  restaurants: string[];
  description: string;
}

const Results = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    const prefsStr = sessionStorage.getItem('travelPreferences');
    
    if (!prefsStr) {
      toast.error("No preferences found. Please fill the form first.");
      navigate('/');
      return;
    }

    const prefs = JSON.parse(prefsStr);
    setPreferences(prefs);
    fetchRecommendations(prefs);
  }, [navigate]);

  const fetchRecommendations = async (prefs: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('travel-recommendations', {
        body: {
          budget: prefs.budget,
          duration: prefs.duration,
          mood: prefs.mood,
          cuisine: prefs.cuisine,
        },
      });

      if (error) throw error;

      if (data?.destinations) {
        setDestinations(data.destinations);
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast.error("Failed to fetch recommendations. Showing sample data.");
      
      // Fallback sample data
      setDestinations([
        {
          name: "Manali",
          state: "Himachal Pradesh",
          category: "Adventure",
          cost: prefs.budget * 0.8,
          duration: `${prefs.duration} days`,
          rating: 4.7,
          image: mountainsImg,
          restaurants: ["Johnson's Cafe", "The Lazy Dog", "Cafe 1947"],
          description: "A paradise for adventure seekers with stunning Himalayan landscapes, snow-capped peaks, and thrilling activities.",
        },
        {
          name: "Goa",
          state: "Goa",
          category: "Beach & Relaxation",
          cost: prefs.budget * 0.7,
          duration: `${prefs.duration} days`,
          rating: 4.5,
          image: beachImg,
          restaurants: ["Thalassa", "Pousada by the Beach", "Fisherman's Wharf"],
          description: "Sun, sand, and sea! Perfect blend of beach relaxation, vibrant nightlife, and Portuguese heritage.",
        },
        {
          name: "Jaipur",
          state: "Rajasthan",
          category: "Culture & Heritage",
          cost: prefs.budget * 0.6,
          duration: `${prefs.duration} days`,
          rating: 4.6,
          image: cultureImg,
          restaurants: ["Laxmi Mishthan Bhandar", "Peacock Rooftop", "Handi Restaurant"],
          description: "The Pink City showcases magnificent forts, palaces, and rich Rajasthani culture and cuisine.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">
              Finding perfect destinations for you...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Your <span className="text-primary">Personalized</span> Destinations
              </h1>
              {preferences && (
                <p className="text-lg text-muted-foreground">
                  Based on your budget of ₹{preferences.budget.toLocaleString('en-IN')} for {preferences.duration} days
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((destination, index) => (
                <DestinationCard key={index} {...destination} />
              ))}
            </div>

            {destinations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No destinations found. Please adjust your preferences.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
