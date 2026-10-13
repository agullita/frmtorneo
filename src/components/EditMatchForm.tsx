import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MatchData {
  id: string;
  fecha?: string | null;
  hora?: string | null;
  campo?: string | null;
  escuela?: string | null;
  entrenador?: string | null;
  duracion?: string | null;
  categoria?: string | null;
}

interface EditMatchFormProps {
  match: MatchData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const EditMatchForm = ({ match, open, onOpenChange, onSaved }: EditMatchFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    campo: "",
    escuela: "",
    entrenador: "",
    duracion: "",
    categoria: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (match) {
      setFormData({
        fecha: match.fecha || "",
        hora: (match.hora || "").slice(0, 5),
        campo: match.campo || "",
        escuela: match.escuela || "",
        entrenador: match.entrenador || "",
        duracion: match.duracion || "",
        categoria: match.categoria || "",
      });
    }
  }, [match]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!match) return;

    if (!formData.fecha || !formData.hora || !formData.campo || !formData.escuela || !formData.entrenador || !formData.duracion || !formData.categoria) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("partidos")
        .update({
          fecha: formData.fecha,
          hora: formData.hora,
          campo: formData.campo,
          escuela: formData.escuela,
          entrenador: formData.entrenador,
          duracion: formData.duracion,
          categoria: formData.categoria,
        })
        .eq("id", match.id);

      if (error) throw error;

      toast({
        title: "Partido actualizado",
        description: "Los cambios han sido guardados correctamente",
      });

      onOpenChange(false);
      onSaved();
    } catch (error) {
      console.error("Error updating match:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el partido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Partido</DialogTitle>
          <DialogDescription>Modifica los datos del partido y guarda los cambios</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fecha">Fecha</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hora">Hora</Label>
              <Input
                id="edit-hora"
                type="time"
                value={formData.hora}
                onChange={(e) => handleInputChange("hora", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-campo">Campo</Label>
            <Input
              id="edit-campo"
              value={formData.campo}
              onChange={(e) => handleInputChange("campo", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-escuela">Equipo</Label>
            <Input
              id="edit-escuela"
              value={formData.escuela}
              onChange={(e) => handleInputChange("escuela", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-entrenador">Entrenador</Label>
            <Input
              id="edit-entrenador"
              value={formData.entrenador}
              onChange={(e) => handleInputChange("entrenador", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-duracion">Duración</Label>
            <Select value={formData.duracion} onValueChange={(value) => handleInputChange("duracion", value)}>
              <SelectTrigger id="edit-duracion">
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
            <Label htmlFor="edit-categoria">Categoría</Label>
            <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
              <SelectTrigger id="edit-categoria">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="royal" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatchForm;
