import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudSnow, CloudDrizzle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CurrentWeather {
  temp: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

interface DailyForecast {
  date: string;
  dayOfWeek: string;
  high: number;
  low: number;
  condition: string;
  description: string;
  precipitation: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
  location: {
    city: string;
    country: string;
  };
}

interface WeatherForecastProps {
  city: string;
  compact?: boolean;
}

const WeatherForecast = ({ city, compact = false }: WeatherForecastProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-forecast', {
        body: { city, days: 7 }
      });

      if (error) throw error;
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast.error("Failed to load weather forecast");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (cond.includes('cloud')) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (cond.includes('sun') || cond.includes('clear')) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (cond.includes('snow')) return <CloudSnow className="w-6 h-6 text-blue-300" />;
    if (cond.includes('drizzle')) return <CloudDrizzle className="w-6 h-6 text-blue-400" />;
    return <Sun className="w-6 h-6 text-yellow-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Weather data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.current.condition)}
              <div>
                <p className="text-2xl font-bold">{Math.round(weather.current.temp)}°C</p>
                <p className="text-sm text-muted-foreground">{weather.current.condition}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Feels like {Math.round(weather.current.feelsLike)}°C</p>
              <p className="text-muted-foreground">Humidity: {weather.current.humidity}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Forecast - {weather.location.city}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Weather */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Current Weather</p>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weather.current.condition)}
              <div>
                <p className="text-4xl font-bold">{Math.round(weather.current.temp)}°C</p>
                <p className="text-lg">{weather.current.condition}</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">{weather.current.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-muted-foreground">Humidity</p>
                <p className="font-semibold">{weather.current.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-muted-foreground">Wind</p>
                <p className="font-semibold">{weather.current.windSpeed} km/h</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Feels Like</p>
              <p className="font-semibold">{Math.round(weather.current.feelsLike)}°C</p>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <h3 className="font-semibold mb-4">7-Day Forecast</h3>
          <div className="space-y-3">
            {weather.forecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <p className="font-medium">{day.dayOfWeek}</p>
                    <p className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground min-w-[100px]">{day.description}</p>
                  
                  {day.precipitation > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Droplets className="w-3 h-3 mr-1" />
                      {day.precipitation}%
                    </Badge>
                  )}
                  
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold">{Math.round(day.high)}°</p>
                    <p className="text-sm text-muted-foreground">{Math.round(day.low)}°</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
