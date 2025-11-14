import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Plus, Calendar, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TripGroup {
  id: string;
  name: string;
  description: string;
  destination_name: string;
  total_budget: number;
  start_date: string;
  end_date: string;
  created_at: string;
  member_count?: number;
  user_role?: string;
}

const CollaborativeTrips = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<TripGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    destination_name: "",
    total_budget: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    checkAuthAndFetchGroups();
  }, []);

  const checkAuthAndFetchGroups = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view collaborative trips");
      navigate("/auth");
      return;
    }

    fetchGroups();
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("trip_groups")
      .select(`
        *,
        trip_group_members!inner(role)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load trip groups");
    } else {
      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        (data || []).map(async (group: any) => {
          const { count } = await supabase
            .from("trip_group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
          
          return {
            ...group,
            member_count: count || 0,
            user_role: group.trip_group_members[0]?.role,
          };
        })
      );
      setGroups(groupsWithCounts);
    }
    setIsLoading(false);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("trip_groups")
      .insert([{
        name: formData.name,
        description: formData.description,
        destination_name: formData.destination_name,
        total_budget: parseFloat(formData.total_budget) || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create trip group");
      console.error(error);
    } else {
      toast.success("Trip group created successfully!");
      setShowCreateDialog(false);
      setFormData({
        name: "",
        description: "",
        destination_name: "",
        total_budget: "",
        start_date: "",
        end_date: "",
      });
      fetchGroups();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Collaborative Trips</h1>
              <p className="text-muted-foreground">Plan trips together with friends and family</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Trip Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Summer Vacation 2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What's this trip about?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination (Optional)</Label>
                    <Input
                      id="destination"
                      value={formData.destination_name}
                      onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                      placeholder="Paris, France"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Total Budget (Optional)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.total_budget}
                      onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Create Group</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-2">No trip groups yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first group to start planning together!</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/collaborative-trips/${group.id}`)}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {group.description}
                      </p>
                    )}
                  </div>
                  
                  {group.destination_name && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{group.destination_name}</span>
                    </div>
                  )}
                  
                  {group.total_budget && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span>₹{group.total_budget.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
                  </div>

                  {group.start_date && group.end_date && (
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(group.start_date), "MMM d")} - {format(new Date(group.end_date), "MMM d, yyyy")}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs font-medium text-primary capitalize">
                      {group.user_role}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeTrips;
