import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import GroupMembers from "@/components/GroupMembers";
import GroupInvitations from "@/components/GroupInvitations";
import DestinationVoting from "@/components/DestinationVoting";
import BudgetSplitView from "@/components/BudgetSplitView";
import ItineraryBuilder from "@/components/ItineraryBuilder";
import GroupChat from "@/components/GroupChat";
import TransportBookingComponent from "@/components/TransportBooking";

interface TripGroup {
  id: string;
  name: string;
  description: string;
  destination_name: string;
  total_budget: number;
  start_date: string;
  end_date: string;
  created_by: string;
}

const TripGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<TripGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    checkAuthAndFetchGroup();
  }, [groupId]);

  const checkAuthAndFetchGroup = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view this group");
      navigate("/auth");
      return;
    }

    fetchGroup();
  };

  const fetchGroup = async () => {
    if (!groupId) return;

    setIsLoading(true);
    
    // Fetch group details
    const { data: groupData, error: groupError } = await supabase
      .from("trip_groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError) {
      console.error("Error fetching group:", groupError);
      toast.error("Failed to load trip group");
      navigate("/collaborative-trips");
      return;
    }

    // Fetch user's role in the group
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: memberData } = await supabase
        .from("trip_group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

      if (memberData) {
        setUserRole(memberData.role);
      }
    }

    setGroup(groupData);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/collaborative-trips")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>

          <Card className="p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground mb-4">{group.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {group.destination_name && (
                <p>
                  <span className="font-medium">Destination:</span> {group.destination_name}
                </p>
              )}
              {group.total_budget && (
                <p>
                  <span className="font-medium">Total Budget:</span> ₹{group.total_budget.toLocaleString()}
                </p>
              )}
              {group.start_date && group.end_date && (
                <p>
                  <span className="font-medium">Dates:</span> {group.start_date} to {group.end_date}
                </p>
              )}
            </div>
          </Card>

          <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="transport">Transport</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="voting">Voting</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="invitations">Invites</TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary">
              <ItineraryBuilder 
                groupId={groupId!} 
                startDate={group.start_date} 
                endDate={group.end_date} 
              />
            </TabsContent>

            <TabsContent value="chat">
              <GroupChat groupId={groupId!} />
            </TabsContent>

            <TabsContent value="transport">
              <TransportBookingComponent groupId={groupId!} />
            </TabsContent>

            <TabsContent value="members">
              <GroupMembers groupId={groupId!} userRole={userRole} />
            </TabsContent>

            <TabsContent value="voting">
              <DestinationVoting groupId={groupId!} />
            </TabsContent>

            <TabsContent value="budget">
              <BudgetSplitView groupId={groupId!} totalBudget={group.total_budget} />
            </TabsContent>

            <TabsContent value="invitations">
              <GroupInvitations groupId={groupId!} userRole={userRole} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TripGroupDetail;
