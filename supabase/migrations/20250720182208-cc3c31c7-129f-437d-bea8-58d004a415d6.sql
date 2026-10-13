-- Eliminar la tabla antigua si existe y crear una nueva con la estructura correcta
DROP TABLE IF EXISTS public.Equipos;

-- Crear la tabla Equipos con la estructura correcta
CREATE TABLE public.Equipos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT,
  categoria TEXT DEFAULT 'General'
);

-- Insertar algunos equipos de ejemplo sin la palabra "Alevín"
INSERT INTO public.Equipos (nombre, categoria) VALUES 
('Torrejón A', 'Alevín'),
('Chopera A', 'Alevín'),
('Orcasur A', 'Infantil'),
('San Fernando A', 'Juvenil'),
('Luís Aragonés A', 'Alevín'),
('Madrid Norte', 'Infantil'),
('Villa de Vallecas', 'Juvenil'),
('Carabanchel', 'Alevín');