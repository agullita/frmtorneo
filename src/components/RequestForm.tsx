import { useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RequestFormProps {
  match: any;
  onClose: () => void;
}

const RequestForm = ({ match, onClose }: RequestFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('partidos_pedidos')
        .insert({
          escuela: match.equipo,
          fecha: match.date,
          campo: match.campo,
          hora: match.time,
          categoria: match.categoria,
          entrenador: formData.nombre,
          duracion: match.duracion,
          sustituto: null,
          email: formData.email,
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud para el partido del ${match.equipo} ha sido enviada correctamente`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Solicitar Partido
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">{match.equipo}</p>
          <p className="text-sm text-muted-foreground">
            {match.date} a las {match.time} - {match.campo}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Entrenador</Label>
            <Input
              id="nombre"
              placeholder="Tu nombre completo"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu.email@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full"
            />
          </div>


          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              variant="royal" 
              className="flex-1"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestForm;