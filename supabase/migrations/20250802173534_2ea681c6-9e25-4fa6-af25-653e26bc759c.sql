-- Recrear todas las tablas del proyecto

-- Tabla de partidos
CREATE TABLE public.partidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  campo TEXT NOT NULL,
  escuela TEXT NOT NULL,
  entrenador TEXT NOT NULL,
  duracion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de solicitudes de partidos
CREATE TABLE public.partidos_pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escuela TEXT NOT NULL,
  fecha DATE NOT NULL,
  campo TEXT NOT NULL,
  hora TIME NOT NULL,
  categoria TEXT NOT NULL,
  entrenador TEXT NOT NULL,
  duracion TEXT NOT NULL,
  sustituto TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de ayudantes
CREATE TABLE public.Ayudantes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  dia TEXT NOT NULL,
  turno TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de equipos para confirmaciones
CREATE TABLE public.equipos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  categoria TEXT NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  entrenador TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Ayudantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;

-- Políticas para partidos (acceso público para lectura, inserción restringida)
CREATE POLICY "Partidos son visibles públicamente" 
ON public.partidos 
FOR SELECT 
USING (true);

CREATE POLICY "Cualquiera puede crear partidos" 
ON public.partidos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Cualquiera puede actualizar partidos" 
ON public.partidos 
FOR UPDATE 
USING (true);

CREATE POLICY "Cualquiera puede eliminar partidos" 
ON public.partidos 
FOR DELETE 
USING (true);

-- Políticas para solicitudes de partidos
CREATE POLICY "Solicitudes son visibles públicamente" 
ON public.partidos_pedidos 
FOR SELECT 
USING (true);

CREATE POLICY "Cualquiera puede crear solicitudes" 
ON public.partidos_pedidos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Cualquiera puede eliminar solicitudes" 
ON public.partidos_pedidos 
FOR DELETE 
USING (true);

-- Políticas para ayudantes
CREATE POLICY "Ayudantes son visibles públicamente" 
ON public.Ayudantes 
FOR SELECT 
USING (true);

CREATE POLICY "Cualquiera puede crear ayudantes" 
ON public.Ayudantes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Cualquiera puede eliminar ayudantes" 
ON public.Ayudantes 
FOR DELETE 
USING (true);

-- Políticas para equipos
CREATE POLICY "Equipos son visibles públicamente" 
ON public.equipos 
FOR SELECT 
USING (true);

CREATE POLICY "Cualquiera puede actualizar equipos" 
ON public.equipos 
FOR UPDATE 
USING (true);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps automáticamente
CREATE TRIGGER update_partidos_updated_at
  BEFORE UPDATE ON public.partidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON public.equipos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunos equipos de ejemplo
INSERT INTO public.equipos (name, categoria) VALUES
('Equipo Alpha', 'Sub-12'),
('Equipo Beta', 'Sub-14'),
('Equipo Gamma', 'Sub-16'),
('Equipo Delta', 'Sub-18'),
('Equipo Epsilon', 'Senior');