-- Agregar la columna J1 como booleano para marcar equipos confirmados
ALTER TABLE public.Equipos 
ADD COLUMN J1 BOOLEAN DEFAULT false;

-- Cambiar el nombre de la columna nombre a Nombre para mantener consistencia
ALTER TABLE public.Equipos 
RENAME COLUMN nombre TO Nombre;