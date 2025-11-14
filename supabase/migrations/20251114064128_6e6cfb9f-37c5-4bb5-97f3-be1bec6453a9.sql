-- Create trip groups table
CREATE TABLE public.trip_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  destination_name TEXT,
  total_budget NUMERIC,
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trip group members table
CREATE TABLE public.trip_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create trip invitations table
CREATE TABLE public.trip_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create destination votes table
CREATE TABLE public.destination_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_name TEXT NOT NULL,
  destination_state TEXT,
  category TEXT,
  cost NUMERIC,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id, destination_name)
);

-- Create budget splits table
CREATE TABLE public.budget_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_groups
CREATE POLICY "Users can view groups they are members of"
  ON public.trip_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = trip_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trip groups"
  ON public.trip_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners and admins can update groups"
  ON public.trip_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = trip_groups.id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Group owners can delete groups"
  ON public.trip_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = trip_groups.id 
        AND user_id = auth.uid() 
        AND role = 'owner'
    )
  );

-- RLS Policies for trip_group_members
CREATE POLICY "Users can view members of their groups"
  ON public.trip_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members m
      WHERE m.group_id = trip_group_members.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert group members"
  ON public.trip_group_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Group owners and admins can update members"
  ON public.trip_group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members m
      WHERE m.group_id = trip_group_members.group_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can leave groups"
  ON public.trip_group_members FOR DELETE
  USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.trip_group_members m
      WHERE m.group_id = trip_group_members.group_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for trip_invitations
CREATE POLICY "Users can view invitations they sent or received"
  ON public.trip_invitations FOR SELECT
  USING (
    inviter_id = auth.uid() OR 
    invitee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = trip_invitations.invitee_email
    )
  );

CREATE POLICY "Group members can create invitations"
  ON public.trip_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = trip_invitations.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invitations"
  ON public.trip_invitations FOR UPDATE
  USING (
    invitee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = trip_invitations.invitee_email
    )
  );

-- RLS Policies for destination_votes
CREATE POLICY "Group members can view votes"
  ON public.destination_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = destination_votes.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can vote"
  ON public.destination_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = destination_votes.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own votes"
  ON public.destination_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.destination_votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for budget_splits
CREATE POLICY "Group members can view budget splits"
  ON public.budget_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_group_members
      WHERE group_id = budget_splits.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create budget splits"
  ON public.budget_splits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own split payments"
  ON public.budget_splits FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to automatically add creator as owner
CREATE OR REPLACE FUNCTION public.add_group_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trip_group_created
  AFTER INSERT ON public.trip_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_group_creator_as_owner();

-- Function to calculate and update budget splits
CREATE OR REPLACE FUNCTION public.update_budget_splits(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_budget NUMERIC;
  v_member_count INTEGER;
  v_split_amount NUMERIC;
BEGIN
  -- Get total budget
  SELECT total_budget INTO v_total_budget
  FROM public.trip_groups
  WHERE id = p_group_id;

  -- Get member count
  SELECT COUNT(*) INTO v_member_count
  FROM public.trip_group_members
  WHERE group_id = p_group_id;

  -- Calculate split amount
  IF v_member_count > 0 AND v_total_budget IS NOT NULL THEN
    v_split_amount := v_total_budget / v_member_count;

    -- Update or insert splits for each member
    INSERT INTO public.budget_splits (group_id, user_id, amount)
    SELECT p_group_id, user_id, v_split_amount
    FROM public.trip_group_members
    WHERE group_id = p_group_id
    ON CONFLICT (group_id, user_id)
    DO UPDATE SET amount = v_split_amount, updated_at = now();
  END IF;
END;
$$;