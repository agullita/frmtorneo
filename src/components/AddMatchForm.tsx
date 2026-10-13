import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddMatchFormProps {
  onAddMatch: () => void;
}

const AddMatchForm = ({ onAddMatch }: AddMatchFormProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    campo: "",
    equipo: "",
    entrenador: "",
    duracion: "",
    categoria: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.campo || !formData.equipo || !formData.entrenador || !formData.duracion || !formData.categoria) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting match data:', formData);
      
      // Insertar en la base de datos - usar fecha en formato YYYY-MM-DD que es el estándar SQL
      const { error } = await supabase
        .from('partidos')
        .insert({
          fecha: formData.date, // Mantener formato YYYY-MM-DD
          hora: formData.time,
          campo: formData.campo,
          escuela: formData.equipo,
          entrenador: formData.entrenador,
          duracion: formData.duracion,
          categoria: formData.categoria,
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Llamar al callback para actualizar la lista
      onAddMatch();
      
      setFormData({
        date: "",
        time: "",
        campo: "",
        equipo: "",
        entrenador: "",
        duracion: "",
        categoria: "",
      });
      setIsOpen(false);
      
      toast({
        title: "Partido agregado",
        description: "El partido ha sido agregado exitosamente",
      });
    } catch (error) {
      console.error('Error adding match:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el partido",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <Card className="border-dashed border-2 border-border hover:border-primary transition-colors">
        <CardContent className="flex items-center justify-center p-8">
          <Button
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-primary"
          >
            <Plus className="h-6 w-6 mr-2" />
            Agregar Nuevo Partido
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Agregar Nuevo Partido
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campo">Campo</Label>
            <Input
              id="campo"
              placeholder="Ej: Campo 1, Campo Central"
              value={formData.campo}
              onChange={(e) => handleInputChange("campo", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipo">Equipo</Label>
            <Input
              id="equipo"
              placeholder="Ej: Real Madrid Sub-12"
              value={formData.equipo}
              onChange={(e) => handleInputChange("equipo", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrenador">Entrenador</Label>
            <Input
              id="entrenador"
              placeholder="Ej: Carlos Martínez"
              value={formData.entrenador}
              onChange={(e) => handleInputChange("entrenador", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion">Duración</Label>
            <Select value={formData.duracion} onValueChange={(value) => handleInputChange("duracion", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/4">1/4</SelectItem>
                <SelectItem value="1/2">1/2</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="Completo">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pre5">Pre5</SelectItem>
                <SelectItem value="Prebenjamín">Prebenjamín</SelectItem>
                <SelectItem value="Benjamín">Benjamín</SelectItem>
                <SelectItem value="Alevín">Alevín</SelectItem>
                <SelectItem value="Infantil">Infantil</SelectItem>
                <SelectItem value="Cadete/Juvenil">Cadete/Juvenil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" variant="royal" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar Partido
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddMatchForm;