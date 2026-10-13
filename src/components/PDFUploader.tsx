import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';

const PDFUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo PDF válido",
        variant: "destructive",
      });
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Configurar PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Cargar el documento PDF
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      console.log(`PDF cargado con ${pdf.numPages} páginas`);
      
      // Extraer texto de cada página
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Extraer y limpiar el texto de los elementos
          const pageText = textContent.items
            .filter((item: any) => 'str' in item && item.str && typeof item.str === 'string')
            .map((item: any) => item.str.trim())
            .filter(text => text.length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
            console.log(`Página ${pageNum}: ${pageText.substring(0, 100)}...`);
          }
        } catch (pageError) {
          console.warn(`Error procesando página ${pageNum}:`, pageError);
          continue;
        }
      }
      
      // Limpiar y normalizar el texto final
      fullText = fullText
        .replace(/\s+/g, ' ') // Normalizar espacios múltiples
        .replace(/\n\s*\n/g, '\n') // Normalizar saltos de línea
        .replace(/[^\w\s\u00C0-\u017F\u0100-\u024F.,;:!?()[\]{}'"°%€$-]/g, ' ') // Mantener solo caracteres válidos
        .trim();
      
      console.log(`Texto extraído: ${fullText.length} caracteres`);
      console.log(`Muestra del texto: ${fullText.substring(0, 200)}...`);
      
      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('No se pudo extraer texto del PDF. Verifica que el archivo no esté corrupto o protegido.');
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo y proporciona un título",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('Extrayendo texto del PDF...');
      const fileContent = await extractTextFromPDF(file);
      
      if (fileContent.length < 10) {
        throw new Error('No se pudo extraer texto del PDF. El archivo podría estar vacío, corrupto o protegido.');
      }

      console.log(`Texto extraído exitosamente: ${fileContent.length} caracteres`);

      console.log('Enviando a procesar...');
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          fileContent,
          fileName: file.name,
          title: title.trim(),
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: data.message,
        });
        
        // Limpiar el formulario
        setFile(null);
        setTitle("");
        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.error || 'Error procesando el archivo');
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error procesando el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Cargar Documento PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título del documento</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Manual de entrenamiento"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pdf-upload">Archivo PDF</Label>
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {file && (
          <div className="text-sm text-muted-foreground">
            Archivo seleccionado: {file.name}
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!file || !title.trim() || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Cargar y Procesar
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Los documentos PDF se procesarán y agregarán a la base de conocimiento del chatbot.
        </p>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;