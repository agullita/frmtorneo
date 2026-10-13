-- Disable RLS completely for push_subscriptions since it doesn't contain sensitive data
-- Push subscription endpoints are not personal data and can be public
ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;