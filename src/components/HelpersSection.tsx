import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HelpersSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newHelper, setNewHelper] = useState({
    nombre: "",
    email: "",
    dia: "",
    turno: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  const handleAddHelper = async () => {
    if (newHelper.nombre && newHelper.email && selectedDate && newHelper.turno) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('ayudantes')
          .insert([{
            nombre: newHelper.nombre,
            email: newHelper.email,
            dia: format(selectedDate, "dd/MM/yyyy"),
            turno: newHelper.turno
          }]);

        if (error) throw error;

        setNewHelper({ nombre: "", email: "", dia: "", turno: "" });
        setSelectedDate(undefined);
        toast({
          title: "Éxito",
          description: "Tu solicitud ha sido enviada correctamente",
        });
      } catch (error) {
        console.error('Error adding helper:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar la solicitud",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Ayudantes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Regístrate como ayudante para el torneo</p>
      </div>

      <Card className="bg-warm-accent/5">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Registrarse como Ayudante</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="text-sm">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Nombre del ayudante"
                  value={newHelper.nombre}
                  onChange={(e) => setNewHelper(prev => ({ ...prev, nombre: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email del ayudante"
                  value={newHelper.email}
                  onChange={(e) => setNewHelper(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dia" className="text-sm">Día</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="turno" className="text-sm">Turno</Label>
                <Select value={newHelper.turno} onValueChange={(value) => setNewHelper(prev => ({ ...prev, turno: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1º">1º</SelectItem>
                    <SelectItem value="2º">2º</SelectItem>
                    <SelectItem value="3º">3º</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddHelper}
            className="mt-4 w-full"
            variant="royal"
            disabled={!newHelper.nombre || !newHelper.email || !selectedDate || !newHelper.turno || isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpersSection;