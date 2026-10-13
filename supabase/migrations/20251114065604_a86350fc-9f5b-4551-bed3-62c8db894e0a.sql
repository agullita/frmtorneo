-- Insert the current user as admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('8bb62603-dc63-4eb6-b525-f6b407c482a7', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;