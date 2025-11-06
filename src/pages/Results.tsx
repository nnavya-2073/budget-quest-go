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
          restaurants: [
            { name: "Johnson's Cafe", rating: 4.6, priceRange: "₹₹", cuisine: "Continental" },
            { name: "The Lazy Dog", rating: 4.5, priceRange: "₹₹₹", cuisine: "Multi-cuisine" },
            { name: "Cafe 1947", rating: 4.7, priceRange: "₹₹", cuisine: "Italian" }
          ],
          hotels: [
            { name: "Snow Valley Resort", rating: 4.5, pricePerNight: 3500, amenities: ["Mountain View", "Heater", "WiFi", "Breakfast"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" },
            { name: "Manali Heights", rating: 4.3, pricePerNight: 2500, amenities: ["Free Parking", "Restaurant", "Room Service"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ],
          activities: [
            { name: "Paragliding", description: "Soar over Solang Valley", rating: 4.8, cost: 2500, imageUrl: "https://images.unsplash.com/photo-1535581652167-8c362c5e90d2" },
            { name: "River Rafting", description: "Beas River adventure", rating: 4.7, cost: 1500, imageUrl: "https://images.unsplash.com/photo-1564489971959-745a35a6e8ea" },
            { name: "Trekking", description: "Himalayan trails", rating: 4.6, cost: 1000, imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306" }
          ],
          description: "A paradise for adventure seekers with stunning Himalayan landscapes, snow-capped peaks, and thrilling activities.",
          distance: 500,
          travelDuration: "12 hours by car",
          travelOptions: [
            { mode: "flight", duration: "1.5 hours", cost: 5000, details: "Delhi to Kullu, then 1 hour taxi" },
            { mode: "bus", duration: "14 hours", cost: 1200, details: "Overnight Volvo from Delhi" },
            { mode: "car", duration: "12 hours", cost: 3000, details: "Self-drive via NH44" }
          ],
          itinerary: [
            { day: 1, activities: ["Arrival and check-in", "Explore Mall Road", "Visit Hadimba Temple", "Evening at Old Manali"] },
            { day: 2, activities: ["Solang Valley adventure sports", "Paragliding experience", "Cable car ride", "Dinner at Cafe 1947"] }
          ],
          budgetTips: ["Book hotels in advance for better rates", "Use local buses instead of taxis", "Eat at local dhabas", "Visit during off-season for discounts"],
          weather: { climate: "Cold Mountain Climate", avgTemp: "10°C - 25°C" },
          bestTime: "March to June, September to November",
          seasonalPricing: "Peak: Apr-Jun (+35%), Off-season: Jan-Feb (-20%)",
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
          restaurants: [
            { name: "Thalassa", rating: 4.8, priceRange: "₹₹₹", cuisine: "Greek" },
            { name: "Pousada by the Beach", rating: 4.6, priceRange: "₹₹", cuisine: "Goan" },
            { name: "Fisherman's Wharf", rating: 4.7, priceRange: "₹₹₹", cuisine: "Seafood" }
          ],
          hotels: [
            { name: "Taj Exotica", rating: 4.9, pricePerNight: 8000, amenities: ["Beach Access", "Pool", "Spa", "Restaurant"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945" },
            { name: "Casa Palacio", rating: 4.4, pricePerNight: 3500, amenities: ["Pool", "WiFi", "Breakfast", "Parking"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" }
          ],
          activities: [
            { name: "Water Sports", description: "Jet ski, parasailing, banana boat", rating: 4.7, cost: 2000, imageUrl: "https://images.unsplash.com/photo-1535581652167-8c362c5e90d2" },
            { name: "Scuba Diving", description: "Explore underwater life", rating: 4.8, cost: 3500, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5" },
            { name: "Sunset Cruise", description: "Evening cruise on Mandovi", rating: 4.6, cost: 1200, imageUrl: "https://images.unsplash.com/photo-1544551763-92ab472180c5" }
          ],
          description: "Sun, sand, and sea! Perfect blend of beach relaxation, vibrant nightlife, and Portuguese heritage.",
          distance: 600,
          travelDuration: "1.5 hours by flight",
          travelOptions: [
            { mode: "flight", duration: "1.5 hours", cost: 4500, details: "Direct flights from major cities" },
            { mode: "train", duration: "12 hours", cost: 1800, details: "Overnight express trains available" },
            { mode: "bus", duration: "16 hours", cost: 1500, details: "Luxury sleeper buses" }
          ],
          itinerary: [
            { day: 1, activities: ["Arrival at Goa airport", "Check-in to beach resort", "Calangute Beach sunset", "Beach shack dinner"] },
            { day: 2, activities: ["Water sports at Baga Beach", "Visit Fort Aguada", "Old Goa church tour", "Nightlife at Tito's Lane"] },
            { day: 3, activities: ["South Goa beaches", "Palolem Beach relaxation", "Cabo de Rama Fort", "Beachside seafood dinner"] }
          ],
          budgetTips: ["Visit during monsoon for 50% cheaper rates", "Rent a scooter for affordable transport", "Stay in hostels or guesthouses", "Eat at beach shacks instead of fancy restaurants", "Book flight tickets in advance"],
          weather: { climate: "Tropical Coastal", avgTemp: "25°C - 35°C" },
          bestTime: "November to February",
          seasonalPricing: "Peak: Dec-Jan (+40%), Off-season: Jun-Aug (-30%)",
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
          restaurants: [
            { name: "Laxmi Mishthan Bhandar", rating: 4.7, priceRange: "₹", cuisine: "Traditional Rajasthani" },
            { name: "Peacock Rooftop", rating: 4.5, priceRange: "₹₹", cuisine: "Indian" },
            { name: "Handi Restaurant", rating: 4.6, priceRange: "₹₹", cuisine: "Mughlai" }
          ],
          hotels: [
            { name: "Raj Palace", rating: 4.7, pricePerNight: 4500, amenities: ["Heritage Property", "Pool", "Cultural Shows", "Restaurant"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" },
            { name: "Hotel Pearl Palace", rating: 4.4, pricePerNight: 2000, amenities: ["Rooftop", "WiFi", "Breakfast", "Travel Desk"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ],
          activities: [
            { name: "Amber Fort Tour", description: "Explore majestic fort", rating: 4.8, cost: 1500, imageUrl: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9" },
            { name: "Elephant Ride", description: "Traditional fort entry", rating: 4.5, cost: 1200, imageUrl: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44" },
            { name: "City Palace Visit", description: "Royal heritage tour", rating: 4.7, cost: 800, imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41" }
          ],
          description: "The Pink City showcases magnificent forts, palaces, and rich Rajasthani culture and cuisine.",
          distance: 400,
          travelDuration: "1 hour by flight",
          travelOptions: [
            { mode: "flight", duration: "1 hour", cost: 3500, details: "Frequent flights from Delhi/Mumbai" },
            { mode: "train", duration: "5 hours", cost: 800, details: "Shatabdi Express from Delhi" },
            { mode: "car", duration: "5 hours", cost: 2500, details: "Highway via NH48" }
          ],
          itinerary: [
            { day: 1, activities: ["Amber Fort morning visit", "Elephant ride experience", "City Palace tour", "Evening at Hawa Mahal", "Shopping at Johari Bazaar"] },
            { day: 2, activities: ["Jantar Mantar Observatory", "Albert Hall Museum", "Nahargarh Fort sunset", "Traditional Rajasthani dinner"] }
          ],
          budgetTips: ["Use metro and local buses", "Book combo tickets for forts", "Stay in budget hotels in C-Scheme area", "Eat at Laxmi Mishthan Bhandar for authentic cheap food", "Bargain in markets"],
          weather: { climate: "Hot Semi-arid", avgTemp: "20°C - 40°C" },
          bestTime: "October to March",
          seasonalPricing: "Peak: Oct-Mar (+25%), Off-season: Apr-Jun (-15%)",
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
          restaurants: [
            { name: "Johnson's Cafe", rating: 4.6, priceRange: "₹₹", cuisine: "Continental" },
            { name: "The Lazy Dog", rating: 4.5, priceRange: "₹₹₹", cuisine: "Multi-cuisine" },
            { name: "Cafe 1947", rating: 4.7, priceRange: "₹₹", cuisine: "Italian" }
          ],
          hotels: [
            { name: "Snow Valley Resort", rating: 4.5, pricePerNight: 3500, amenities: ["Mountain View", "Heater", "WiFi", "Breakfast"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" },
            { name: "Manali Heights", rating: 4.3, pricePerNight: 2500, amenities: ["Free Parking", "Restaurant", "Room Service"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ],
          activities: [
            { name: "Paragliding", description: "Soar over Solang Valley", rating: 4.8, cost: 2500, imageUrl: "https://images.unsplash.com/photo-1535581652167-8c362c5e90d2" },
            { name: "River Rafting", description: "Beas River adventure", rating: 4.7, cost: 1500, imageUrl: "https://images.unsplash.com/photo-1564489971959-745a35a6e8ea" },
            { name: "Trekking", description: "Himalayan trails", rating: 4.6, cost: 1000, imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306" }
          ],
          description: "A paradise for adventure seekers with stunning Himalayan landscapes, snow-capped peaks, and thrilling activities.",
          distance: 500,
          travelDuration: "12 hours by car",
          travelOptions: [
            { mode: "flight", duration: "1.5 hours", cost: 5000, details: "Delhi to Kullu, then 1 hour taxi" },
            { mode: "bus", duration: "14 hours", cost: 1200, details: "Overnight Volvo from Delhi" },
            { mode: "car", duration: "12 hours", cost: 3000, details: "Self-drive via NH44" }
          ],
          itinerary: [
            { day: 1, activities: ["Arrival and check-in", "Explore Mall Road", "Visit Hadimba Temple", "Evening at Old Manali"] },
            { day: 2, activities: ["Solang Valley adventure sports", "Paragliding experience", "Cable car ride", "Dinner at Cafe 1947"] }
          ],
          budgetTips: ["Book hotels in advance for better rates", "Use local buses instead of taxis", "Eat at local dhabas", "Visit during off-season for discounts"],
          weather: { climate: "Cold Mountain Climate", avgTemp: "10°C - 25°C" },
          bestTime: "March to June, September to November",
          seasonalPricing: "Peak: Apr-Jun (+35%), Off-season: Jan-Feb (-20%)",
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
          restaurants: [
            { name: "Thalassa", rating: 4.8, priceRange: "₹₹₹", cuisine: "Greek" },
            { name: "Pousada by the Beach", rating: 4.6, priceRange: "₹₹", cuisine: "Goan" },
            { name: "Fisherman's Wharf", rating: 4.7, priceRange: "₹₹₹", cuisine: "Seafood" }
          ],
          hotels: [
            { name: "Taj Exotica", rating: 4.9, pricePerNight: 8000, amenities: ["Beach Access", "Pool", "Spa", "Restaurant"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945" },
            { name: "Casa Palacio", rating: 4.4, pricePerNight: 3500, amenities: ["Pool", "WiFi", "Breakfast", "Parking"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" }
          ],
          activities: [
            { name: "Water Sports", description: "Jet ski, parasailing, banana boat", rating: 4.7, cost: 2000, imageUrl: "https://images.unsplash.com/photo-1535581652167-8c362c5e90d2" },
            { name: "Scuba Diving", description: "Explore underwater life", rating: 4.8, cost: 3500, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5" },
            { name: "Sunset Cruise", description: "Evening cruise on Mandovi", rating: 4.6, cost: 1200, imageUrl: "https://images.unsplash.com/photo-1544551763-92ab472180c5" }
          ],
          description: "Sun, sand, and sea! Perfect blend of beach relaxation, vibrant nightlife, and Portuguese heritage.",
          distance: 600,
          travelDuration: "1.5 hours by flight",
          travelOptions: [
            { mode: "flight", duration: "1.5 hours", cost: 4500, details: "Direct flights from major cities" },
            { mode: "train", duration: "12 hours", cost: 1800, details: "Overnight express trains available" },
            { mode: "bus", duration: "16 hours", cost: 1500, details: "Luxury sleeper buses" }
          ],
          itinerary: [
            { day: 1, activities: ["Arrival at Goa airport", "Check-in to beach resort", "Calangute Beach sunset", "Beach shack dinner"] },
            { day: 2, activities: ["Water sports at Baga Beach", "Visit Fort Aguada", "Old Goa church tour", "Nightlife at Tito's Lane"] },
            { day: 3, activities: ["South Goa beaches", "Palolem Beach relaxation", "Cabo de Rama Fort", "Beachside seafood dinner"] }
          ],
          budgetTips: ["Visit during monsoon for 50% cheaper rates", "Rent a scooter for affordable transport", "Stay in hostels or guesthouses", "Eat at beach shacks instead of fancy restaurants", "Book flight tickets in advance"],
          weather: { climate: "Tropical Coastal", avgTemp: "25°C - 35°C" },
          bestTime: "November to February",
          seasonalPricing: "Peak: Dec-Jan (+40%), Off-season: Jun-Aug (-30%)",
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
          restaurants: [
            { name: "Laxmi Mishthan Bhandar", rating: 4.7, priceRange: "₹", cuisine: "Traditional Rajasthani" },
            { name: "Peacock Rooftop", rating: 4.5, priceRange: "₹₹", cuisine: "Indian" },
            { name: "Handi Restaurant", rating: 4.6, priceRange: "₹₹", cuisine: "Mughlai" }
          ],
          hotels: [
            { name: "Raj Palace", rating: 4.7, pricePerNight: 4500, amenities: ["Heritage Property", "Pool", "Cultural Shows", "Restaurant"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" },
            { name: "Hotel Pearl Palace", rating: 4.4, pricePerNight: 2000, amenities: ["Rooftop", "WiFi", "Breakfast", "Travel Desk"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ],
          activities: [
            { name: "Amber Fort Tour", description: "Explore majestic fort", rating: 4.8, cost: 1500, imageUrl: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9" },
            { name: "Elephant Ride", description: "Traditional fort entry", rating: 4.5, cost: 1200, imageUrl: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44" },
            { name: "City Palace Visit", description: "Royal heritage tour", rating: 4.7, cost: 800, imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41" }
          ],
          description: "The Pink City showcases magnificent forts, palaces, and rich Rajasthani culture and cuisine.",
          distance: 400,
          travelDuration: "1 hour by flight",
          travelOptions: [
            { mode: "flight", duration: "1 hour", cost: 3500, details: "Frequent flights from Delhi/Mumbai" },
            { mode: "train", duration: "5 hours", cost: 800, details: "Shatabdi Express from Delhi" },
            { mode: "car", duration: "5 hours", cost: 2500, details: "Highway via NH48" }
          ],
          itinerary: [
            { day: 1, activities: ["Amber Fort morning visit", "Elephant ride experience", "City Palace tour", "Evening at Hawa Mahal", "Shopping at Johari Bazaar"] },
            { day: 2, activities: ["Jantar Mantar Observatory", "Albert Hall Museum", "Nahargarh Fort sunset", "Traditional Rajasthani dinner"] }
          ],
          budgetTips: ["Use metro and local buses", "Book combo tickets for forts", "Stay in budget hotels in C-Scheme area", "Eat at Laxmi Mishthan Bhandar for authentic cheap food", "Bargain in markets"],
          weather: { climate: "Hot Semi-arid", avgTemp: "20°C - 40°C" },
          bestTime: "October to March",
          seasonalPricing: "Peak: Oct-Mar (+25%), Off-season: Apr-Jun (-15%)",
          coordinates: { lat: 26.9124, lng: 75.7873 }
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
                  fullDestination={destination}
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
