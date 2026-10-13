-- Add column to track match duration preference for teams
ALTER TABLE public.equipos 
ADD COLUMN duracion_partido text DEFAULT 'completo' CHECK (duracion_partido IN ('completo', 'medio'));