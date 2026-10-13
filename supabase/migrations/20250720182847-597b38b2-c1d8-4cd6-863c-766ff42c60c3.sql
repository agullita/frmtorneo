-- Habilitar RLS en la tabla Equipos
ALTER TABLE public.Equipos ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura pública de equipos
CREATE POLICY "Equipos are viewable by everyone" 
ON public.Equipos 
FOR SELECT 
USING (true);

-- Crear política para permitir actualización pública (para confirmaciones)
CREATE POLICY "Equipos can be updated by everyone" 
ON public.Equipos 
FOR UPDATE 
USING (true);