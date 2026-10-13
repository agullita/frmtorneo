-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;

-- Create a permissive INSERT policy that allows anyone to subscribe
CREATE POLICY "Anyone can insert push subscriptions" 
ON public.push_subscriptions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Also update the UPDATE policy to be permissive
DROP POLICY IF EXISTS "Anyone can update their own subscription" ON public.push_subscriptions;

CREATE POLICY "Anyone can update their own subscription" 
ON public.push_subscriptions 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);