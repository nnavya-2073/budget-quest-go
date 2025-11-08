import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plane, TrendingUp, TrendingDown, Calendar, Loader2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FlightPriceTrackerProps {
  destination: string;
  departureCity: string;
}

export const FlightPriceTracker = ({ destination, departureCity }: FlightPriceTrackerProps) => {
  const [departureDate, setDepartureDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [priceInfo, setPriceInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!departureDate) {
      toast({
        title: "Missing Information",
        description: "Please enter a departure date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('flight-price-tracker', {
        body: {
          from: departureCity,
          to: destination,
          departureDate,
          returnDate: returnDate || null,
        },
      });

      if (error) throw error;
      setPriceInfo(data);
    } catch (error) {
      console.error('Flight price tracking error:', error);
      toast({
        title: "Tracking Failed",
        description: "Unable to fetch flight price information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.toLowerCase().includes('falling')) return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (trend.toLowerCase().includes('rising')) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Price Tracker</CardTitle>
        <CardDescription>Get price estimates and booking recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="departure">Departure Date</Label>
            <Input
              id="departure"
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="return">Return Date (Optional)</Label>
            <Input
              id="return"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleTrack} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Prices...
            </>
          ) : (
            <>
              <Plane className="mr-2 h-4 w-4" />
              Track Flight Prices
            </>
          )}
        </Button>

        {priceInfo && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Estimated Price Range</span>
                <Badge className={getPriceLevelColor(priceInfo.priceLevel)}>
                  {priceInfo.priceLevel}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                ₹{priceInfo.estimatedPrice.min.toLocaleString()} - ₹{priceInfo.estimatedPrice.max.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Average: ₹{priceInfo.estimatedPrice.average.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {getTrendIcon(priceInfo.trend)}
              <span className="text-sm font-medium">Price Trend: {priceInfo.trend}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-semibold">Best Time to Book</div>
                  <div className="text-sm text-muted-foreground">{priceInfo.bestTimeToBook}</div>
                </div>
              </div>

              {priceInfo.airlines && priceInfo.airlines.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Airlines on This Route</div>
                  <div className="space-y-2">
                    {priceInfo.airlines.map((airline: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium">{airline.name}</div>
                          <div className="text-xs text-muted-foreground">{airline.type}</div>
                        </div>
                        <div className="text-sm font-semibold">
                          ₹{airline.estimatedPrice.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Money-Saving Tips
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {priceInfo.savingTips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-semibold mb-2">Booking Recommendations</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {priceInfo.bookingRecommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
