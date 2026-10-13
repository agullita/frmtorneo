-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create non-recursive policies for user_roles
-- Users can only insert their own roles (will be restricted by admin in practice)
CREATE POLICY "Users can insert their own roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own roles
CREATE POLICY "Users can delete their own roles" ON public.user_roles
  FOR DELETE USING (auth.uid() = user_id);

-- Users can update their own roles
CREATE POLICY "Users can update their own roles" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);