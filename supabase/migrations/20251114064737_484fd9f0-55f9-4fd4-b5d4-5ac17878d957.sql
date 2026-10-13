-- Clean up duplicate policies
DROP POLICY IF EXISTS "Cualquiera puede crear ayudantes" ON public.ayudantes;
DROP POLICY IF EXISTS "Cualquiera puede crear solicitudes" ON public.partidos_pedidos;