-- Create itinerary items table
CREATE TABLE public.itinerary_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transport bookings table
CREATE TABLE public.transport_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transport_type TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  estimated_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;

-- Itinerary items policies
CREATE POLICY "Group members can view itinerary" ON public.itinerary_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM trip_group_members WHERE group_id = itinerary_items.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can add itinerary items" ON public.itinerary_items
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM trip_group_members WHERE group_id = itinerary_items.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own items" ON public.itinerary_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.itinerary_items
  FOR DELETE USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Group members can view messages" ON public.group_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM trip_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can send messages" ON public.group_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM trip_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  ));

-- Transport bookings policies
CREATE POLICY "Group members can view transport bookings" ON public.transport_bookings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM trip_group_members WHERE group_id = transport_bookings.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can add transport bookings" ON public.transport_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM trip_group_members WHERE group_id = transport_bookings.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own bookings" ON public.transport_bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON public.transport_bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Add triggers for updated_at
CREATE TRIGGER update_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_bookings_updated_at
  BEFORE UPDATE ON public.transport_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();