import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DestinationCard from "@/components/DestinationCard";
import CompareDestinations from "@/components/CompareDestinations";
import MapView from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, SlidersHorizontal, GitCompare, MapIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mountainsImg from "@/assets/destination-mountains.jpg";
import cultureImg from "@/assets/destination-culture.jpg";
import beachImg from "@/assets/destination-beach.jpg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Restaurant {
  name: string;
  rating: number;
  priceRange: string;
  cuisine: string;
}

interface HotelDetails {
  name: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  imageUrl: string;
}

interface Activity {
  name: string;
  description: string;
  rating: number;
  cost: number;
  imageUrl: string;
}

interface TravelOption {
  mode: string;
  duration: string;
  cost: number;
  details: string;
}

interface Destination {
  city: string;
  name: string;
  state: string;
  category: string;
  cost: number;
  duration: string;
  rating: number;
  image: string;
  imageUrl?: string;
  restaurants: (Restaurant | string)[];
  hotels?: HotelDetails[];
  activities?: Activity[];
  description: string;
  distance?: number;
  travelDuration?: string;
  travelOptions?: TravelOption[];
  itinerary?: Array<{ day: number; activities: string[] }>;
  budgetTips?: string[];
  weather?: { climate: string; avgTemp: string };
  bestTime?: string;
  seasonalPricing?: string;
  coordinates?: { lat: number; lng: number };
}

const Results = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Destination[]>([]);
  const [showMap, setShowMap] = useState(false);

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
          departureCity: prefs.departureCity,
          surpriseMe: prefs.surpriseMe,
          travelMode: prefs.travelMode || 'any',
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
          city: "Manali",
          name: "Manali",
          state: "Himachal Pradesh",
          category: "Adventure",
          cost: prefs.budget * 0.8,
          duration: `${prefs.duration} days`,
          rating: 4.7,
          image: mountainsImg,
          restaurants: ["Johnson's Cafe", "The Lazy Dog", "Cafe 1947"],
          description: "A paradise for adventure seekers with stunning Himalayan landscapes, snow-capped peaks, and thrilling activities.",
          distance: 500,
          travelDuration: "12 hours by car",
          itinerary: [
            { day: 1, activities: ["Arrival and check-in", "Explore Mall Road", "Visit Hadimba Temple", "Evening at Old Manali"] },
            { day: 2, activities: ["Solang Valley adventure sports", "Paragliding experience", "Cable car ride", "Dinner at Cafe 1947"] }
          ],
          budgetTips: ["Book hotels in advance for better rates", "Use local buses instead of taxis", "Eat at local dhabas", "Visit during off-season for discounts"],
          weather: { climate: "Cold Mountain Climate", avgTemp: "10°C - 25°C" },
          bestTime: "March to June, September to November",
          coordinates: { lat: 32.2432, lng: 77.1892 }
        },
        {
          city: "Panaji",
          name: "Goa",
          state: "Goa",
          category: "Beach & Relaxation",
          cost: prefs.budget * 0.7,
          duration: `${prefs.duration} days`,
          rating: 4.5,
          image: beachImg,
          restaurants: ["Thalassa", "Pousada by the Beach", "Fisherman's Wharf"],
          description: "Sun, sand, and sea! Perfect blend of beach relaxation, vibrant nightlife, and Portuguese heritage.",
          distance: 600,
          travelDuration: "1.5 hours by flight",
          itinerary: [
            { day: 1, activities: ["Arrival at Goa airport", "Check-in to beach resort", "Calangute Beach sunset", "Beach shack dinner"] },
            { day: 2, activities: ["Water sports at Baga Beach", "Visit Fort Aguada", "Old Goa church tour", "Nightlife at Tito's Lane"] },
            { day: 3, activities: ["South Goa beaches", "Palolem Beach relaxation", "Cabo de Rama Fort", "Beachside seafood dinner"] }
          ],
          budgetTips: ["Visit during monsoon for 50% cheaper rates", "Rent a scooter for affordable transport", "Stay in hostels or guesthouses", "Eat at beach shacks instead of fancy restaurants", "Book flight tickets in advance"],
          weather: { climate: "Tropical Coastal", avgTemp: "25°C - 35°C" },
          bestTime: "November to February",
          coordinates: { lat: 15.2993, lng: 74.1240 }
        },
        {
          city: "Jaipur",
          name: "Jaipur",
          state: "Rajasthan",
          category: "Culture & Heritage",
          cost: prefs.budget * 0.6,
          duration: `${prefs.duration} days`,
          rating: 4.6,
          image: cultureImg,
          restaurants: ["Laxmi Mishthan Bhandar", "Peacock Rooftop", "Handi Restaurant"],
          description: "The Pink City showcases magnificent forts, palaces, and rich Rajasthani culture and cuisine.",
          distance: 400,
          travelDuration: "1 hour by flight",
          itinerary: [
            { day: 1, activities: ["Amber Fort morning visit", "Elephant ride experience", "City Palace tour", "Evening at Hawa Mahal", "Shopping at Johari Bazaar"] },
            { day: 2, activities: ["Jantar Mantar Observatory", "Albert Hall Museum", "Nahargarh Fort sunset", "Traditional Rajasthani dinner"] }
          ],
          budgetTips: ["Use metro and local buses", "Book combo tickets for forts", "Stay in budget hotels in C-Scheme area", "Eat at Laxmi Mishthan Bhandar for authentic cheap food", "Bargain in markets"],
          weather: { climate: "Hot Semi-arid", avgTemp: "20°C - 40°C" },
          bestTime: "October to March",
          coordinates: { lat: 26.9124, lng: 75.7873 }
        },
      ]);
      setFilteredDestinations([
        {
          city: "Manali",
          name: "Manali",
          state: "Himachal Pradesh",
          category: "Adventure",
          cost: prefs.budget * 0.8,
          duration: `${prefs.duration} days`,
          rating: 4.7,
          image: mountainsImg,
          restaurants: ["Johnson's Cafe", "The Lazy Dog", "Cafe 1947"],
          description: "A paradise for adventure seekers with stunning Himalayan landscapes, snow-capped peaks, and thrilling activities.",
          distance: 500,
          travelDuration: "12 hours by car",
          itinerary: [
            { day: 1, activities: ["Arrival and check-in", "Explore Mall Road", "Visit Hadimba Temple", "Evening at Old Manali"] },
            { day: 2, activities: ["Solang Valley adventure sports", "Paragliding experience", "Cable car ride", "Dinner at Cafe 1947"] }
          ],
          budgetTips: ["Book hotels in advance for better rates", "Use local buses instead of taxis", "Eat at local dhabas", "Visit during off-season for discounts"]
        },
        {
          city: "Panaji",
          name: "Goa",
          state: "Goa",
          category: "Beach & Relaxation",
          cost: prefs.budget * 0.7,
          duration: `${prefs.duration} days`,
          rating: 4.5,
          image: beachImg,
          restaurants: ["Thalassa", "Pousada by the Beach", "Fisherman's Wharf"],
          description: "Sun, sand, and sea! Perfect blend of beach relaxation, vibrant nightlife, and Portuguese heritage.",
          distance: 600,
          travelDuration: "1.5 hours by flight",
          itinerary: [
            { day: 1, activities: ["Arrival at Goa airport", "Check-in to beach resort", "Calangute Beach sunset", "Beach shack dinner"] },
            { day: 2, activities: ["Water sports at Baga Beach", "Visit Fort Aguada", "Old Goa church tour", "Nightlife at Tito's Lane"] },
            { day: 3, activities: ["South Goa beaches", "Palolem Beach relaxation", "Cabo de Rama Fort", "Beachside seafood dinner"] }
          ],
          budgetTips: ["Visit during monsoon for 50% cheaper rates", "Rent a scooter for affordable transport", "Stay in hostels or guesthouses", "Eat at beach shacks instead of fancy restaurants", "Book flight tickets in advance"]
        },
        {
          city: "Jaipur",
          name: "Jaipur",
          state: "Rajasthan",
          category: "Culture & Heritage",
          cost: prefs.budget * 0.6,
          duration: `${prefs.duration} days`,
          rating: 4.6,
          image: cultureImg,
          restaurants: ["Laxmi Mishthan Bhandar", "Peacock Rooftop", "Handi Restaurant"],
          description: "The Pink City showcases magnificent forts, palaces, and rich Rajasthani culture and cuisine.",
          distance: 400,
          travelDuration: "1 hour by flight",
          itinerary: [
            { day: 1, activities: ["Amber Fort morning visit", "Elephant ride experience", "City Palace tour", "Evening at Hawa Mahal", "Shopping at Johari Bazaar"] },
            { day: 2, activities: ["Jantar Mantar Observatory", "Albert Hall Museum", "Nahargarh Fort sunset", "Traditional Rajasthani dinner"] }
          ],
          budgetTips: ["Use metro and local buses", "Book combo tickets for forts", "Stay in budget hotels in C-Scheme area", "Eat at Laxmi Mishthan Bhandar for authentic cheap food", "Bargain in markets"]
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

  const toggleCompareSelection = (dest: Destination) => {
    setSelectedForCompare(prev => {
      const exists = prev.find(d => d.name === dest.name);
      if (exists) {
        return prev.filter(d => d.name !== dest.name);
      }
      if (prev.length >= 4) {
        toast.error("You can compare up to 4 destinations");
        return prev;
      }
      return [...prev, dest];
    });
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
                  Based on your budget of ₹{preferences.budget.toLocaleString('en-IN')} for {preferences.duration} days from {preferences.departureCity}
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

            {/* Action Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-wrap gap-4 items-center">
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

              <div className="flex gap-2">
                <Button
                  variant={compareMode ? "default" : "outline"}
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (compareMode) setSelectedForCompare([]);
                  }}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare {selectedForCompare.length > 0 && `(${selectedForCompare.length})`}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowMap(true)}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map View
                </Button>
              </div>
            </div>

            {selectedForCompare.length > 0 && (
              <div className="mb-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {selectedForCompare.length} destination{selectedForCompare.length > 1 ? 's' : ''} selected for comparison
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedForCompare.length < 2) {
                      toast.error("Select at least 2 destinations to compare");
                      return;
                    }
                    setCompareMode(false);
                  }}
                >
                  View Comparison
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination, index) => (
                <DestinationCard 
                  key={index} 
                  {...destination}
                  isCompareMode={compareMode}
                  isSelected={selectedForCompare.some(d => d.name === destination.name)}
                  onToggleCompare={() => toggleCompareSelection(destination)}
                />
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

            <CompareDestinations 
              open={!compareMode && selectedForCompare.length >= 2}
              onOpenChange={(open) => {
                if (!open) setSelectedForCompare([]);
              }}
              destinations={selectedForCompare}
            />

            <MapView
              open={showMap}
              onOpenChange={setShowMap}
              destinations={filteredDestinations}
              departureCity={preferences?.departureCity}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
