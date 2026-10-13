-- Agregar la tabla Equipos si no existe
CREATE TABLE IF NOT EXISTS public.Equipos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT,
  categoria TEXT DEFAULT 'General'
);

-- Insertar algunos equipos de ejemplo
INSERT INTO public.Equipos (nombre, categoria) VALUES 
('Torrejón A', 'Alevín'),
('Chopera A', 'Alevín'),
('Orcasur A', 'Infantil'),
('San Fernando A', 'Juvenil'),
('Luís Aragonés A', 'Alevín')
ON CONFLICT DO NOTHING;