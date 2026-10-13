-- Create table to store sent notifications
CREATE TABLE public.notificaciones_enviadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  enviadas_a integer NOT NULL DEFAULT 0,
  fallidas integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notificaciones_enviadas ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications history
CREATE POLICY "Solo admins pueden ver notificaciones"
ON public.notificaciones_enviadas
FOR SELECT
USING (has_admin_role());

-- Only admins can insert notifications
CREATE POLICY "Solo admins pueden crear notificaciones"
ON public.notificaciones_enviadas
FOR INSERT
WITH CHECK (has_admin_role());