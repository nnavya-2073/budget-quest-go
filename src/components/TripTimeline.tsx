import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Utensils, Camera, Navigation, Sunrise, Sun, Sunset } from 'lucide-react';

interface Activity {
  time: string;
  title: string;
  description?: string;
  duration: string;
  type: 'travel' | 'food' | 'sightseeing' | 'activity' | 'rest';
  icon?: string;
}

interface DaySchedule {
  day: number;
  date?: string;
  activities: Activity[];
}

interface TripTimelineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: {
    name: string;
    duration: string;
    itinerary?: Array<{ day: number; activities: string[] }>;
  };
}

const getActivityIcon = (type: string, time: string) => {
  const hour = parseInt(time.split(':')[0]);
  
  if (type === 'travel') return <Navigation className="w-5 h-5" />;
  if (type === 'food') return <Utensils className="w-5 h-5" />;
  if (type === 'sightseeing') return <Camera className="w-5 h-5" />;
  
  if (hour < 10) return <Sunrise className="w-5 h-5" />;
  if (hour < 17) return <Sun className="w-5 h-5" />;
  return <Sunset className="w-5 h-5" />;
};

const generateSchedule = (itinerary?: Array<{ day: number; activities: string[] }>): DaySchedule[] => {
  if (!itinerary || itinerary.length === 0) {
    return [
      {
        day: 1,
        activities: [
          { time: '09:00', title: 'Arrival & Check-in', duration: '2h', type: 'travel' },
          { time: '11:00', title: 'Breakfast & Refresh', duration: '1h', type: 'food' },
          { time: '13:00', title: 'Local Sightseeing', duration: '3h', type: 'sightseeing' },
          { time: '16:00', title: 'Lunch', duration: '1h', type: 'food' },
          { time: '18:00', title: 'Explore Local Market', duration: '2h', type: 'activity' },
          { time: '20:00', title: 'Dinner', duration: '1.5h', type: 'food' },
        ]
      },
      {
        day: 2,
        activities: [
          { time: '08:00', title: 'Breakfast', duration: '1h', type: 'food' },
          { time: '09:30', title: 'Main Attraction Visit', duration: '4h', type: 'sightseeing' },
          { time: '13:30', title: 'Lunch Break', duration: '1.5h', type: 'food' },
          { time: '15:00', title: 'Adventure Activity', duration: '3h', type: 'activity' },
          { time: '18:00', title: 'Sunset Point', duration: '1h', type: 'sightseeing' },
          { time: '19:30', title: 'Dinner', duration: '1.5h', type: 'food' },
        ]
      }
    ];
  }

  return itinerary.map(day => {
    const startTime = 9;
    const avgDuration = 2;
    
    return {
      day: day.day,
      activities: day.activities.map((activity, idx) => {
        const hour = startTime + (idx * avgDuration);
        const activityLower = activity.toLowerCase();
        
        let type: Activity['type'] = 'activity';
        if (activityLower.includes('breakfast') || activityLower.includes('lunch') || activityLower.includes('dinner') || activityLower.includes('food')) {
          type = 'food';
        } else if (activityLower.includes('travel') || activityLower.includes('arrival') || activityLower.includes('check-in')) {
          type = 'travel';
        } else if (activityLower.includes('visit') || activityLower.includes('explore') || activityLower.includes('tour')) {
          type = 'sightseeing';
        }

        return {
          time: `${hour.toString().padStart(2, '0')}:00`,
          title: activity,
          duration: `${avgDuration}h`,
          type
        };
      })
    };
  });
};

export const TripTimeline = ({ open, onOpenChange, destination }: TripTimelineProps) => {
  const schedule = generateSchedule(destination.itinerary);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Trip Timeline: {destination.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Day-by-day schedule with time allocations
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {schedule.map((day) => (
            <Card key={day.day}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Day {day.day}</h3>
                  <Badge variant="outline">
                    {day.activities.length} Activities
                  </Badge>
                </div>

                <div className="space-y-4">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getActivityIcon(activity.type, activity.time)}
                        </div>
                        {idx < day.activities.length - 1 && (
                          <div className="w-0.5 h-12 bg-border my-1" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-muted-foreground">
                                {activity.time}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {activity.duration}
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{activity.title}</h4>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Start: {day.activities[0]?.time || '09:00'}</span>
                    <span>•</span>
                    <span>End: {day.activities[day.activities.length - 1]?.time || '21:00'}</span>
                    <span>•</span>
                    <span>Total: ~{day.activities.length * 2}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> This is a suggested timeline. Feel free to adjust based on your pace and preferences. Allow buffer time between activities for travel and breaks.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
