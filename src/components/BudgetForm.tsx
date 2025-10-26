import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BudgetForm = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState([25000]);
  const [duration, setDuration] = useState("5");
  const [mood, setMood] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [departureCity, setDepartureCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood || !cuisine || !departureCity) {
      toast.error("Please fill in all fields");
      return;
    }

    // Store preferences in sessionStorage
    const preferences = {
      budget: budget[0],
      duration,
      mood,
      cuisine,
      departureCity,
    };
    
    sessionStorage.setItem('travelPreferences', JSON.stringify(preferences));
    
    toast.success("Searching for perfect destinations...");
    navigate('/results');
  };

  return (
    <section id="budget-form" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Plan Your <span className="text-primary">Dream Trip</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tell us your preferences and let AI find the perfect destinations for you
          </p>
        </div>

        <Card className="max-w-3xl mx-auto shadow-[var(--shadow-card)] border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Travel Preferences
            </CardTitle>
            <CardDescription>
              Fill in your details and we'll create a personalized itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Budget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="budget" className="text-base font-semibold">
                    Your Budget
                  </Label>
                  <span className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <IndianRupee className="w-5 h-5" />
                    {budget[0].toLocaleString('en-IN')}
                  </span>
                </div>
                <Slider
                  id="budget"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={budget}
                  onValueChange={setBudget}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹5,000</span>
                  <span>₹2,00,000</span>
                </div>
              </div>

              {/* Departure City */}
              <div className="space-y-2">
                <Label htmlFor="departureCity" className="text-base font-semibold">
                  Departure City
                </Label>
                <Input
                  id="departureCity"
                  type="text"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-base font-semibold">
                  Trip Duration
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2-3 days</SelectItem>
                    <SelectItem value="5">5-7 days</SelectItem>
                    <SelectItem value="10">10-14 days</SelectItem>
                    <SelectItem value="21">3 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="60">2 months</SelectItem>
                    <SelectItem value="90">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mood */}
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-base font-semibold">
                  Travel Mood
                </Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="What's your vibe?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">🏔️ Adventure & Thrill</SelectItem>
                    <SelectItem value="relaxation">🏖️ Relaxation & Peace</SelectItem>
                    <SelectItem value="culture">🎭 Culture & Heritage</SelectItem>
                    <SelectItem value="nature">🌿 Nature & Wildlife</SelectItem>
                    <SelectItem value="party">🎉 Party & Nightlife</SelectItem>
                    <SelectItem value="spiritual">🕉️ Spiritual & Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cuisine */}
              <div className="space-y-2">
                <Label htmlFor="cuisine" className="text-base font-semibold">
                  Food Preference
                </Label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger id="cuisine">
                    <SelectValue placeholder="What do you like to eat?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">🥗 Vegetarian</SelectItem>
                    <SelectItem value="non-vegetarian">🍗 Non-Vegetarian</SelectItem>
                    <SelectItem value="vegan">🌱 Vegan</SelectItem>
                    <SelectItem value="street-food">🍜 Street Food Lover</SelectItem>
                    <SelectItem value="fine-dining">🍽️ Fine Dining</SelectItem>
                    <SelectItem value="local">🏘️ Local Cuisine Explorer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full text-lg"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Discover Destinations
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BudgetForm;
