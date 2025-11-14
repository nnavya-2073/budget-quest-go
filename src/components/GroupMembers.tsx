import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserMinus, Shield, User, Crown } from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

interface GroupMembersProps {
  groupId: string;
  userRole: string;
}

const GroupMembers = ({ groupId, userRole }: GroupMembersProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchMembers();
  }, [groupId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("trip_group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
      setIsLoading(false);
      return;
    }

    // Fetch profile info for each member
    const membersWithProfiles = await Promise.all(
      (data || []).map(async (member) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", member.user_id)
          .single();
        
        return {
          ...member,
          profiles: profile || { email: "", full_name: "" },
        };
      })
    );

    setMembers(membersWithProfiles);
    setIsLoading(false);
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === currentUserId) {
      if (!confirm("Are you sure you want to leave this group?")) return;
    }

    const { error } = await supabase
      .from("trip_group_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast.error("Failed to remove member");
    } else {
      toast.success("Member removed successfully");
      fetchMembers();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <Card className="p-6">Loading members...</Card>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Group Members ({members.length})</h3>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {member.profiles?.full_name?.[0] || member.profiles?.email?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.profiles?.full_name || member.profiles?.email || "Unknown User"}
                  {member.user_id === currentUserId && (
                    <span className="text-sm text-muted-foreground ml-2">(You)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </Badge>
              {(userRole === "owner" || userRole === "admin" || member.user_id === currentUserId) &&
                member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.user_id)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GroupMembers;
