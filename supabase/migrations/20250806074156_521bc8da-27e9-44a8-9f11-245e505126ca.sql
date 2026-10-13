-- Crear política RLS para permitir insertar equipos
CREATE POLICY "Cualquiera puede crear equipos" 
ON public.equipos 
FOR INSERT 
WITH CHECK (true);