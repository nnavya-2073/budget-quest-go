-- Add unique constraint to prevent duplicate saved trips
ALTER TABLE public.saved_trips
ADD CONSTRAINT unique_user_destination 
UNIQUE (user_id, destination_name, destination_state);