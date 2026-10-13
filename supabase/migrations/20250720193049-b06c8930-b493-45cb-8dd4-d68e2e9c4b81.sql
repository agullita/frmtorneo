-- Habilitar RLS en la tabla partidos_pedidos
ALTER TABLE public.partidos_pedidos ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserciones públicas (cualquiera puede solicitar un partido)
CREATE POLICY "Permitir inserción pública de solicitudes" 
ON public.partidos_pedidos 
FOR INSERT 
WITH CHECK (true);

-- Crear política para permitir lectura pública (para que los administradores puedan ver las solicitudes)
CREATE POLICY "Permitir lectura pública de solicitudes" 
ON public.partidos_pedidos 
FOR SELECT 
USING (true);