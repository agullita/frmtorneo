-- Agregar la columna entrenador a la tabla Equipos
ALTER TABLE public.Equipos 
ADD COLUMN IF NOT EXISTS entrenador TEXT;