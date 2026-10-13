-- Agregar solo la columna J1 ya que 'nombre' ya existe
ALTER TABLE public.Equipos 
ADD COLUMN IF NOT EXISTS J1 BOOLEAN DEFAULT false;