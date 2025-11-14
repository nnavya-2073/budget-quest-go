import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { DollarSign, CheckCircle2 } from "lucide-react";

interface BudgetSplit {
  id: string;
  user_id: string;
  amount: number;
  paid_amount: number;
  profiles?: {
    email: string;
    full_name: string;
  };
}

interface BudgetSplitViewProps {
  groupId: string;
  totalBudget: number;
}

const BudgetSplitView = ({ groupId, totalBudget }: BudgetSplitViewProps) => {
  const [splits, setSplits] = useState<BudgetSplit[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    calculateSplits();
  }, [groupId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const calculateSplits = async () => {
    setIsLoading(true);
    
    // Call the database function to calculate splits
    const { error: calcError } = await supabase.rpc("update_budget_splits", {
      p_group_id: groupId,
    });

    if (calcError) {
      console.error("Error calculating splits:", calcError);
    }

    // Fetch the calculated splits
    const { data, error } = await supabase
      .from("budget_splits")
      .select("*")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error fetching splits:", error);
      toast.error("Failed to load budget splits");
      setIsLoading(false);
      return;
    }

    // Fetch profile info for each split
    const splitsWithProfiles = await Promise.all(
      (data || []).map(async (split) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", split.user_id)
          .single();
        
        return {
          ...split,
          profiles: profile || { email: "", full_name: "" },
        };
      })
    );

    setSplits(splitsWithProfiles);
    setIsLoading(false);
  };

  const handleMarkAsPaid = async (splitId: string, amount: number) => {
    const { error } = await supabase
      .from("budget_splits")
      .update({ paid_amount: amount })
      .eq("id", splitId);

    if (error) {
      toast.error("Failed to update payment");
    } else {
      toast.success("Payment marked as complete!");
      calculateSplits();
    }
  };

  const getTotalPaid = () => {
    return splits.reduce((sum, split) => sum + split.paid_amount, 0);
  };

  const getTotalRemaining = () => {
    return splits.reduce((sum, split) => sum + (split.amount - split.paid_amount), 0);
  };

  if (isLoading) {
    return <Card className="p-6">Calculating budget splits...</Card>;
  }

  if (!totalBudget) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center py-8">
          No budget set for this trip. Update the group details to add a budget.
        </p>
      </Card>
    );
  }

  const totalPaid = getTotalPaid();
  const totalRemaining = getTotalRemaining();
  const overallProgress = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Budget Split</h3>

      <Card className="p-4 mb-6 bg-accent/50">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-orange-600">₹{totalRemaining.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-muted-foreground">{overallProgress.toFixed(1)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </Card>

      <div className="space-y-4">
        {splits.map((split) => {
          const progress = split.amount > 0 ? (split.paid_amount / split.amount) * 100 : 0;
          const isFullyPaid = split.paid_amount >= split.amount;
          const isCurrentUser = split.user_id === currentUserId;

          return (
            <Card key={split.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {split.profiles?.full_name || split.profiles?.email || "Unknown User"}
                    </h4>
                    {isCurrentUser && (
                      <span className="text-sm text-muted-foreground">(You)</span>
                    )}
                    {isFullyPaid && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{split.profiles?.email}</p>
                </div>
                {!isFullyPaid && isCurrentUser && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsPaid(split.id, split.amount)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{split.paid_amount.toLocaleString()} / ₹{split.amount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

export default BudgetSplitView;
