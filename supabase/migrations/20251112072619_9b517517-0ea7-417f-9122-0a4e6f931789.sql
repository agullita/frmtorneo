-- Create role enum for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table to store role assignments
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create security definer function to check if user has admin role
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop existing overly permissive policies for ayudantes table
DROP POLICY IF EXISTS "Ayudantes son visibles públicamente" ON public.ayudantes;
DROP POLICY IF EXISTS "Cualquiera puede eliminar ayudantes" ON public.ayudantes;

-- Create secure policies for ayudantes table
-- Keep public insert for volunteer registration form
CREATE POLICY "Anyone can register as volunteer" ON public.ayudantes
  FOR INSERT WITH CHECK (true);

-- Restrict SELECT to admins only to protect email addresses
CREATE POLICY "Only admins can view volunteers" ON public.ayudantes
  FOR SELECT USING (public.has_admin_role());

-- Restrict DELETE to admins only
CREATE POLICY "Only admins can delete volunteers" ON public.ayudantes
  FOR DELETE USING (public.has_admin_role());

-- Drop existing overly permissive policies for partidos_pedidos table
DROP POLICY IF EXISTS "Solicitudes son visibles públicamente" ON public.partidos_pedidos;
DROP POLICY IF EXISTS "Cualquiera puede eliminar solicitudes" ON public.partidos_pedidos;

-- Create secure policies for partidos_pedidos table
-- Keep public insert for match request form
CREATE POLICY "Anyone can submit match request" ON public.partidos_pedidos
  FOR INSERT WITH CHECK (true);

-- Restrict SELECT to admins only to protect email addresses
CREATE POLICY "Only admins can view match requests" ON public.partidos_pedidos
  FOR SELECT USING (public.has_admin_role());

-- Restrict DELETE to admins only
CREATE POLICY "Only admins can delete match requests" ON public.partidos_pedidos
  FOR DELETE USING (public.has_admin_role());