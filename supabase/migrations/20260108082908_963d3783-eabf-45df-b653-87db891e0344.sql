-- Add RLS policy to allow admins to delete teams
CREATE POLICY "Solo admins pueden eliminar equipos"
ON public.equipos
FOR DELETE
USING (has_admin_role());