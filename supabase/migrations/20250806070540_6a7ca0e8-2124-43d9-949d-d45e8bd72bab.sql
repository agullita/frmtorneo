-- Crear tabla para almacenar contenido de PDFs de la fundación
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_name TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso público a la base de conocimiento
CREATE POLICY "Knowledge base is viewable by everyone" 
ON public.knowledge_base 
FOR SELECT 
USING (true);

CREATE POLICY "Knowledge base can be inserted by everyone" 
ON public.knowledge_base 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Knowledge base can be updated by everyone" 
ON public.knowledge_base 
FOR UPDATE 
USING (true);

CREATE POLICY "Knowledge base can be deleted by everyone" 
ON public.knowledge_base 
FOR DELETE 
USING (true);

-- Crear tabla para historial de conversaciones
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso público al historial
CREATE POLICY "Conversations are viewable by everyone" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Conversations can be inserted by everyone" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear bucket para almacenar PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdfs', 'pdfs', false);

-- Políticas para el bucket de PDFs
CREATE POLICY "PDF files are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pdfs');

CREATE POLICY "PDF files can be uploaded by everyone" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pdfs');

CREATE POLICY "PDF files can be updated by everyone" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pdfs');

CREATE POLICY "PDF files can be deleted by everyone" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pdfs');