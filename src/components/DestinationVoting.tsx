import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ThumbsUp, Plus } from "lucide-react";

interface Vote {
  id: string;
  destination_name: string;
  destination_state: string;
  category: string;
  cost: number;
  duration: string;
  user_id: string;
  vote_count?: number;
  user_voted?: boolean;
}

interface DestinationVotingProps {
  groupId: string;
}

const DestinationVoting = ({ groupId }: DestinationVotingProps) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [formData, setFormData] = useState({
    destination_name: "",
    destination_state: "",
    category: "",
    cost: "",
    duration: "",
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchVotes();
  }, [groupId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchVotes = async () => {
    const { data, error } = await supabase
      .from("destination_votes")
      .select("*")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error fetching votes:", error);
      return;
    }

    // Group by destination and count votes
    const voteCounts = (data || []).reduce((acc: any, vote) => {
      const key = vote.destination_name;
      if (!acc[key]) {
        acc[key] = {
          ...vote,
          vote_count: 0,
          user_voted: false,
          voters: [],
        };
      }
      acc[key].vote_count++;
      acc[key].voters.push(vote.user_id);
      if (vote.user_id === currentUserId) {
        acc[key].user_voted = true;
      }
      return acc;
    }, {});

    setVotes(Object.values(voteCounts));
  };

  const handleAddVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("destination_votes")
      .insert([{
        group_id: groupId,
        user_id: user.id,
        destination_name: formData.destination_name,
        destination_state: formData.destination_state,
        category: formData.category,
        cost: parseFloat(formData.cost) || null,
        duration: formData.duration,
      }]);

    if (error) {
      if (error.code === "23505") {
        toast.error("You've already voted for this destination");
      } else {
        toast.error("Failed to add vote");
      }
    } else {
      toast.success("Vote added successfully!");
      setShowAddForm(false);
      setFormData({
        destination_name: "",
        destination_state: "",
        category: "",
        cost: "",
        duration: "",
      });
      fetchVotes();
    }
  };

  const handleVote = async (destinationName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get the first vote for this destination to copy its details
    const existingVote = votes.find(v => v.destination_name === destinationName);
    if (!existingVote) return;

    const { error } = await supabase
      .from("destination_votes")
      .insert([{
        group_id: groupId,
        user_id: user.id,
        destination_name: existingVote.destination_name,
        destination_state: existingVote.destination_state,
        category: existingVote.category,
        cost: existingVote.cost,
        duration: existingVote.duration,
      }]);

    if (error) {
      if (error.code === "23505") {
        toast.error("You've already voted for this destination");
      } else {
        toast.error("Failed to vote");
      }
    } else {
      toast.success("Vote recorded!");
      fetchVotes();
    }
  };

  const getTotalVotes = () => {
    return votes.reduce((sum, vote) => sum + (vote.vote_count || 0), 0);
  };

  const totalVotes = getTotalVotes();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Vote on Destinations</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Propose Destination
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-accent/50">
          <form onSubmit={handleAddVote} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dest_name">Destination Name</Label>
                <Input
                  id="dest_name"
                  value={formData.destination_name}
                  onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                  placeholder="Paris"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dest_state">State/Country</Label>
                <Input
                  id="dest_state"
                  value={formData.destination_state}
                  onChange={(e) => setFormData({ ...formData, destination_state: e.target.value })}
                  placeholder="France"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Cultural"
                />
              </div>
              <div>
                <Label htmlFor="cost">Est. Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="5 days"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Add Vote</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {votes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No destinations proposed yet. Be the first to suggest one!
        </p>
      ) : (
        <div className="space-y-4">
          {votes
            .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
            .map((vote) => {
              const percentage = totalVotes > 0 ? ((vote.vote_count || 0) / totalVotes) * 100 : 0;
              return (
                <Card key={vote.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{vote.destination_name}</h4>
                      <p className="text-sm text-muted-foreground">{vote.destination_state}</p>
                      <div className="flex gap-2 mt-2">
                        {vote.category && <Badge variant="outline">{vote.category}</Badge>}
                        {vote.cost && <Badge variant="secondary">₹{vote.cost.toLocaleString()}</Badge>}
                        {vote.duration && <Badge variant="outline">{vote.duration}</Badge>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={vote.user_voted ? "secondary" : "default"}
                      onClick={() => !vote.user_voted && handleVote(vote.destination_name)}
                      disabled={vote.user_voted}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {vote.user_voted ? "Voted" : "Vote"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {vote.vote_count} vote{vote.vote_count !== 1 ? "s" : ""}
                      </span>
                      <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </Card>
  );
};

export default DestinationVoting;
