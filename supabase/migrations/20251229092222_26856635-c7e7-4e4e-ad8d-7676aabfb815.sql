-- Drop ALL existing policies on push_subscriptions
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete their own subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can update their own subscription" ON public.push_subscriptions;

-- Create new PERMISSIVE policies (default is PERMISSIVE when not specified as RESTRICTIVE)
CREATE POLICY "Anyone can insert push subscriptions" 
ON public.push_subscriptions 
AS PERMISSIVE
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update subscriptions" 
ON public.push_subscriptions 
AS PERMISSIVE
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete subscriptions" 
ON public.push_subscriptions 
AS PERMISSIVE
FOR DELETE 
TO public
USING (true);

CREATE POLICY "Admins can read all subscriptions" 
ON public.push_subscriptions 
AS PERMISSIVE
FOR SELECT 
TO public
USING (has_admin_role());