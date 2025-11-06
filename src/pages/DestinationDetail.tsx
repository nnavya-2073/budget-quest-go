import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, IndianRupee, MapPin, Calendar, CloudSun, Utensils, Hotel, Sparkles, Navigation as NavigationIcon, TrendingUp } from "lucide-react";
import CostBreakdown from "@/components/CostBreakdown";

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
  description: string;
  restaurants: Restaurant[];
  hotels: HotelDetails[];
  activities: Activity[];
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

const DestinationDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.destination as Destination;

  if (!destination) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl mb-4">Destination not found</h1>
          <Button onClick={() => navigate("/results")}>Back to Results</Button>
        </div>
      </div>
    );
  }

  const displayImage = destination.imageUrl || destination.image;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>

        {/* Hero Section */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          <img 
            src={displayImage} 
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
            <div className="flex items-center gap-4 text-lg">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {destination.city}, {destination.state}
              </span>
              <Badge className="bg-primary/90">{destination.category}</Badge>
              <span className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-accent text-accent" />
                {destination.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">₹{destination.cost.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{destination.duration}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {destination.weather && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CloudSun className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-lg font-bold">{destination.weather.climate}</p>
                    <p className="text-sm text-muted-foreground">{destination.weather.avgTemp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {destination.bestTime && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-lg font-bold">Best Time</p>
                    <p className="text-sm text-muted-foreground">{destination.bestTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About {destination.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{destination.description}</p>
            {destination.seasonalPricing && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">💰 Seasonal Pricing</p>
                <p className="text-sm">{destination.seasonalPricing}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="travel" className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="travel">Travel</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="restaurants">Dining</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          {/* Travel Options */}
          <TabsContent value="travel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NavigationIcon className="w-5 h-5" />
                  Travel Options from Departure City
                </CardTitle>
              </CardHeader>
              <CardContent>
                {destination.travelOptions && destination.travelOptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {destination.travelOptions.map((option, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg capitalize">{option.mode}</h3>
                            <Badge variant="outline">₹{option.cost.toLocaleString('en-IN')}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Duration: {option.duration}</p>
                          <p className="text-sm">{option.details}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Distance: {destination.distance?.toLocaleString()} km • Travel time: {destination.travelDuration}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hotels */}
          <TabsContent value="hotels" className="space-y-4">
            {destination.hotels && destination.hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.hotels.map((hotel, idx) => (
                  <Card key={idx}>
                    {hotel.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="font-semibold">{hotel.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-primary mb-3">₹{hotel.pricePerNight.toLocaleString('en-IN')}/night</p>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, aIdx) => (
                          <Badge key={aIdx} variant="outline">{amenity}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Hotel recommendations will be displayed here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Restaurants */}
          <TabsContent value="restaurants" className="space-y-4">
            {destination.restaurants && destination.restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.restaurants.map((restaurant, idx) => {
                  const restaurantName = typeof restaurant === 'string' ? restaurant : restaurant.name;
                  const restaurantRating = typeof restaurant === 'object' ? restaurant.rating : undefined;
                  const restaurantPrice = typeof restaurant === 'object' ? restaurant.priceRange : undefined;
                  const restaurantCuisine = typeof restaurant === 'object' ? restaurant.cuisine : undefined;
                  
                  return (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{restaurantName}</CardTitle>
                          {restaurantRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-accent text-accent" />
                              <span className="font-semibold">{restaurantRating}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {typeof restaurant === 'object' && (
                        <CardContent>
                          <div className="flex gap-4">
                            {restaurantPrice && <Badge variant="outline">{restaurantPrice}</Badge>}
                            {restaurantCuisine && <span className="text-sm text-muted-foreground">{restaurantCuisine}</span>}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Restaurant recommendations will be displayed here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activities */}
          <TabsContent value="activities" className="space-y-4">
            {destination.activities && destination.activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destination.activities.map((activity, idx) => (
                  <Card key={idx}>
                    {activity.imageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{activity.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm font-semibold">{activity.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <p className="text-lg font-bold text-primary">₹{activity.cost.toLocaleString('en-IN')}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Activity recommendations will be displayed here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Itinerary */}
          <TabsContent value="itinerary" className="space-y-4">
            {destination.itinerary && destination.itinerary.length > 0 ? (
              destination.itinerary.map((day) => (
                <Card key={day.day}>
                  <CardHeader>
                    <CardTitle>Day {day.day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Itinerary will be displayed here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Budget */}
          <TabsContent value="budget" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CostBreakdown totalCost={destination.cost} />
              
              {destination.budgetTips && destination.budgetTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Money-Saving Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {destination.budgetTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DestinationDetail;
