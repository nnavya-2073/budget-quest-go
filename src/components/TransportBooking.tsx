import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Plane, Train, Bus, Car, Trash2, Calendar, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TransportBooking {
  id: string;
  group_id: string;
  user_id: string;
  transport_type: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  return_date: string | null;
  estimated_price: number | null;
  notes: string | null;
}

interface TransportBookingProps {
  groupId: string;
}

const transportIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-5 h-5" />,
  train: <Train className="w-5 h-5" />,
  bus: <Bus className="w-5 h-5" />,
  cab: <Car className="w-5 h-5" />,
};

const transportPrices: Record<string, { min: number; max: number }> = {
  flight: { min: 3000, max: 15000 },
  train: { min: 500, max: 3000 },
  bus: { min: 200, max: 1500 },
  cab: { min: 1000, max: 5000 },
};

const TransportBookingComponent = ({ groupId }: TransportBookingProps) => {
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    transport_type: "flight",
    from_location: "",
    to_location: "",
    departure_date: "",
    return_date: "",
    estimated_price: "",
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
  }, [groupId]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("transport_bookings")
      .select("*")
      .eq("group_id", groupId)
      .order("departure_date", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
      return;
    }

    setBookings(data || []);
  };

  const calculateEstimatedPrice = (type: string, hasReturn: boolean) => {
    const priceRange = transportPrices[type];
    if (!priceRange) return 0;
    const basePrice = Math.floor(Math.random() * (priceRange.max - priceRange.min) + priceRange.min);
    return hasReturn ? basePrice * 1.8 : basePrice;
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hasReturn = !!formData.return_date;
    const estimatedPrice = formData.estimated_price 
      ? parseFloat(formData.estimated_price) 
      : calculateEstimatedPrice(formData.transport_type, hasReturn);

    const { error } = await supabase
      .from("transport_bookings")
      .insert([{
        group_id: groupId,
        user_id: user.id,
        transport_type: formData.transport_type,
        from_location: formData.from_location,
        to_location: formData.to_location,
        departure_date: formData.departure_date,
        return_date: formData.return_date || null,
        estimated_price: estimatedPrice,
        notes: formData.notes || null,
      }]);

    if (error) {
      toast.error("Failed to add transport booking");
      console.error(error);
    } else {
      toast.success("Transport booking added!");
      setShowAddForm(false);
      setFormData({
        transport_type: "flight",
        from_location: "",
        to_location: "",
        departure_date: "",
        return_date: "",
        estimated_price: "",
        notes: "",
      });
      fetchBookings();
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("transport_bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to delete booking");
    } else {
      toast.success("Booking deleted");
      fetchBookings();
    }
  };

  const totalCost = bookings.reduce((sum, b) => sum + (b.estimated_price || 0), 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Transport Bookings</h3>
          <p className="text-sm text-muted-foreground">Total estimated: ₹{totalCost.toLocaleString()}</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transport
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-accent/50">
          <form onSubmit={handleAddBooking} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="transport_type">Transport Type</Label>
                <select
                  id="transport_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.transport_type}
                  onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
                >
                  <option value="flight">✈️ Flight</option>
                  <option value="train">🚂 Train</option>
                  <option value="bus">🚌 Bus</option>
                  <option value="cab">🚕 Cab</option>
                </select>
              </div>
              <div>
                <Label htmlFor="estimated_price">Est. Price (₹)</Label>
                <Input
                  id="estimated_price"
                  type="number"
                  value={formData.estimated_price}
                  onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from_location">From</Label>
                <Input
                  id="from_location"
                  value={formData.from_location}
                  onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                  placeholder="Delhi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="to_location">To</Label>
                <Input
                  id="to_location"
                  value={formData.to_location}
                  onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                  placeholder="Mumbai"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="departure_date">Departure Date</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_date">Return Date (Optional)</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Booking reference, preferences..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Add Booking</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No transport bookings yet. Plan your journey!
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {transportIcons[booking.transport_type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{booking.from_location}</h4>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">{booking.to_location}</h4>
                      {booking.return_date && (
                        <>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-semibold">{booking.from_location}</h4>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline" className="capitalize">
                        {booking.transport_type}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(booking.departure_date), "MMM d, yyyy")}
                        {booking.return_date && (
                          <> - {format(parseISO(booking.return_date), "MMM d, yyyy")}</>
                        )}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{booking.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{booking.estimated_price?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.return_date ? "Round trip" : "One way"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TransportBookingComponent;
