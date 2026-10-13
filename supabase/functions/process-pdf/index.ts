import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, title } = await req.json();
    
    if (!fileContent || !fileName) {
      throw new Error('Contenido del archivo y nombre son requeridos');
    }

    console.log(`Procesando archivo: ${fileName}`);

    // Inicializar cliente Supabase
    const supabaseUrl = 'https://hyqtdwyijnkwmzuwebsq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cXRkd3lpam5rd216dXdlYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTkyODMsImV4cCI6MjA2OTYzNTI4M30.vhgqZlPACea7ZLp9lKQCDKRjZ0tCPdSYd6lzKPR0IGo';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Función para dividir texto en chunks más inteligente
    const splitIntoChunks = (text: string, chunkSize: number = 800): string[] => {
      console.log('Texto original recibido:', text.substring(0, 200) + '...');
      
      // Limpiar el texto y remover caracteres no imprimibles
      let cleanText = text
        .replace(/[^\x20-\x7E\u00C0-\u017F\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u2100-\u214F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('Texto limpio:', cleanText.substring(0, 200) + '...');
      console.log('Longitud del texto limpio:', cleanText.length);
      
      if (cleanText.length < 100) {
        console.log('Texto muy corto después de limpieza, intentando extracción alternativa...');
        // Si el texto es muy corto, intentar extraer de manera diferente
        cleanText = text
          .replace(/[^\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('Texto alternativo:', cleanText.substring(0, 200) + '...');
      }
      
      const chunks: string[] = [];
      const paragraphs = cleanText.split(/[\n\r]+/);
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        const sentences = paragraph.split(/[.!?]+/);
        
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence.length < 10) continue; // Ignorar frases muy cortas
          
          if ((currentChunk + trimmedSentence).length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = trimmedSentence + '.';
          } else {
            currentChunk += ' ' + trimmedSentence + '.';
          }
        }
      }
      
      if (currentChunk.trim().length > 20) { // Solo chunks con contenido significativo
        chunks.push(currentChunk.trim());
      }
      
      const finalChunks = chunks.filter(chunk => chunk.length > 30); // Filtrar chunks muy pequeños
      console.log('Chunks creados:', finalChunks.length);
      console.log('Ejemplo de chunk:', finalChunks[0] ? finalChunks[0].substring(0, 150) + '...' : 'No hay chunks');
      
      return finalChunks;
    };

    // Dividir el contenido en chunks
    const chunks = splitIntoChunks(fileContent);
    console.log(`Archivo dividido en ${chunks.length} chunks`);

    // Limpiar datos existentes del mismo archivo
    const { error: deleteError } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('file_name', fileName);

    if (deleteError) {
      console.error('Error eliminando datos existentes:', deleteError);
    }

    // Insertar los chunks en la base de datos
    const insertPromises = chunks.map((chunk, index) => 
      supabase
        .from('knowledge_base')
        .insert({
          title: title || fileName,
          content: chunk,
          file_name: fileName,
          chunk_index: index,
        })
    );

    const results = await Promise.all(insertPromises);
    
    // Verificar errores
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errores al insertar chunks:', errors);
      throw new Error(`Error insertando ${errors.length} chunks`);
    }

    console.log(`Procesamiento completado: ${chunks.length} chunks insertados`);

    return new Response(JSON.stringify({ 
      success: true,
      chunksProcessed: chunks.length,
      message: `Archivo ${fileName} procesado exitosamente. ${chunks.length} secciones añadidas a la base de conocimiento.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error procesando PDF:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});