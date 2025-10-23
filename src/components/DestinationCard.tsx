import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, IndianRupee, Calendar, Star, Utensils } from "lucide-react";

interface DestinationCardProps {
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

const DestinationCard = ({
  name,
  state,
  category,
  cost,
  duration,
  rating,
  image,
  restaurants,
  description,
}: DestinationCardProps) => {
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
            <CardDescription className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {state}
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

        {/* View Details Button */}
        <Button variant="default" className="w-full mt-4">
          View Full Itinerary
        </Button>
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
