-- Allow anyone (authenticated) to view all reservations for checking table availability
-- This is needed so the Tables page can show which tables are reserved
CREATE POLICY "Anyone can view reservations for availability check" 
ON public.reservations 
FOR SELECT 
USING (true);