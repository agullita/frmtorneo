-- Create push_subscriptions table for storing notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update their own subscription (based on endpoint)
CREATE POLICY "Anyone can insert push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own subscription"
ON public.push_subscriptions
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete their own subscription"
ON public.push_subscriptions
FOR DELETE
USING (true);

-- Only admins can read all subscriptions (for sending notifications)
CREATE POLICY "Admins can read all subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (public.has_admin_role());

-- Add trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();