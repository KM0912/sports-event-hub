-- Add INSERT policy for profiles table
-- This allows authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
