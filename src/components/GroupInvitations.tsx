import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, UserPlus, Check, X } from "lucide-react";

interface Invitation {
  id: string;
  invitee_email: string;
  status: string;
  created_at: string;
}

interface GroupInvitationsProps {
  groupId: string;
  userRole: string;
}

const GroupInvitations = ({ groupId, userRole }: GroupInvitationsProps) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, [groupId]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("trip_invitations")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
    } else {
      setInvitations(data || []);
    }
    setIsLoading(false);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim())
      .single();

    const { error } = await supabase
      .from("trip_invitations")
      .insert([{
        group_id: groupId,
        inviter_id: user.id,
        invitee_email: email.trim(),
        invitee_id: existingUser?.id || null,
      }]);

    if (error) {
      toast.error("Failed to send invitation");
      console.error(error);
    } else {
      toast.success("Invitation sent successfully!");
      setEmail("");
      fetchInvitations();
    }
    setIsSending(false);
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update invitation status
    const { error: updateError } = await supabase
      .from("trip_invitations")
      .update({ status: "accepted", invitee_id: user.id })
      .eq("id", invitationId);

    if (updateError) {
      toast.error("Failed to accept invitation");
      return;
    }

    // Add user to group
    const { error: memberError } = await supabase
      .from("trip_group_members")
      .insert([{
        group_id: groupId,
        user_id: user.id,
        role: "member",
      }]);

    if (memberError) {
      toast.error("Failed to join group");
    } else {
      toast.success("Successfully joined the group!");
      fetchInvitations();
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from("trip_invitations")
      .update({ status: "declined" })
      .eq("id", invitationId);

    if (error) {
      toast.error("Failed to decline invitation");
    } else {
      toast.success("Invitation declined");
      fetchInvitations();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="p-6">
      {userRole !== "member" && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Invite Members</h3>
          <form onSubmit={handleSendInvitation} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <Button type="submit" disabled={isSending}>
              <UserPlus className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Invite"}
            </Button>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4">Invitations</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <p className="text-muted-foreground">No invitations sent yet</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invitation.invitee_email}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(invitation.status)}
                  {invitation.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupInvitations;
