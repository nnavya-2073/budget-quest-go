import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DestinationCard from "@/components/DestinationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mountainsImg from "@/assets/destination-mountains.jpg";
import cultureImg from "@/assets/destination-culture.jpg";
import beachImg from "@/assets/destination-beach.jpg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [filterCategory, setFilterCategory] = useState<string>("all");

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
        setFilteredDestinations(data.destinations);
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
      setFilteredDestinations([
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

  useEffect(() => {
    let filtered = [...destinations];

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(dest => 
        dest.category.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }

    // Sort destinations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "cost-low":
          return a.cost - b.cost;
        case "cost-high":
          return b.cost - a.cost;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredDestinations(filtered);
  }, [destinations, sortBy, filterCategory]);

  const getTotalBudget = () => preferences?.budget || 0;
  const getAverageCost = () => {
    if (destinations.length === 0) return 0;
    return destinations.reduce((sum, dest) => sum + dest.cost, 0) / destinations.length;
  };
  const getCategories = () => {
    const cats = new Set(destinations.map(d => d.category));
    return Array.from(cats);
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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Your <span className="text-primary">Personalized</span> Destinations
              </h1>
              {preferences && (
                <p className="text-lg text-muted-foreground">
                  Based on your budget of ₹{preferences.budget.toLocaleString('en-IN')} for {preferences.duration} days
                </p>
              )}
            </div>

            {/* Budget Overview */}
            {preferences && destinations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      ₹{getTotalBudget().toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Average Trip Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-secondary">
                      ₹{Math.round(getAverageCost()).toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Options Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-accent">
                      {destinations.length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center mb-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Filter & Sort:</span>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="cost-low">Price: Low to High</SelectItem>
                  <SelectItem value="cost-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination, index) => (
                <DestinationCard key={index} {...destination} />
              ))}
            </div>

            {filteredDestinations.length === 0 && destinations.length > 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No destinations match your filters. Try adjusting them.
                </p>
              </div>
            )}

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
