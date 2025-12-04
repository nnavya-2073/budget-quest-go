import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { format, parseISO, addDays, eachDayOfInterval } from "date-fns";

interface ItineraryItem {
  id: string;
  group_id: string;
  user_id: string;
  day_date: string;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
}

interface ItineraryBuilderProps {
  groupId: string;
  startDate?: string;
  endDate?: string;
}

const ItineraryBuilder = ({ groupId, startDate, endDate }: ItineraryBuilderProps) => {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState({
    day_date: "",
    start_time: "",
    end_time: "",
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const tripDays = startDate && endDate 
    ? eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
    : [];

  useEffect(() => {
    fetchItems();
  }, [groupId]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("group_id", groupId)
      .order("day_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching itinerary:", error);
      return;
    }

    setItems(data || []);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("itinerary_items")
      .insert([{
        group_id: groupId,
        user_id: user.id,
        day_date: formData.day_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        category: formData.category || null,
      }]);

    if (error) {
      toast.error("Failed to add activity");
      console.error(error);
    } else {
      toast.success("Activity added!");
      setShowAddForm(false);
      setFormData({
        day_date: "",
        start_time: "",
        end_time: "",
        title: "",
        description: "",
        location: "",
        category: "",
      });
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from("itinerary_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast.error("Failed to delete activity");
    } else {
      toast.success("Activity deleted");
      fetchItems();
    }
  };

  const groupedByDate = items.reduce((acc: Record<string, ItineraryItem[]>, item) => {
    const date = item.day_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const categoryColors: Record<string, string> = {
    sightseeing: "bg-blue-500",
    food: "bg-orange-500",
    transport: "bg-green-500",
    accommodation: "bg-purple-500",
    activity: "bg-pink-500",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Trip Itinerary</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-accent/50">
          <form onSubmit={handleAddItem} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="day_date">Date</Label>
                <Input
                  id="day_date"
                  type="date"
                  value={formData.day_date}
                  onChange={(e) => setFormData({ ...formData, day_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Visit Eiffel Tower"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food & Dining</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Paris, France"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Notes about this activity..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Add Activity</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {Object.keys(groupedByDate).length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No activities planned yet. Start building your itinerary!
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayItems]) => (
              <div key={date} className="border-l-2 border-primary pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">{format(parseISO(date), "EEEE, MMMM d, yyyy")}</h4>
                </div>
                <div className="space-y-3">
                  {dayItems.map((item) => (
                    <Card key={item.id} className="p-3 bg-card/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{item.title}</h5>
                            {item.category && (
                              <Badge className={`${categoryColors[item.category] || "bg-gray-500"} text-white text-xs`}>
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {(item.start_time || item.end_time) && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.start_time?.slice(0, 5)}{item.end_time && ` - ${item.end_time.slice(0, 5)}`}
                              </span>
                            )}
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.location}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </Card>
  );
};

export default ItineraryBuilder;
