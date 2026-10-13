import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamConfirmation {
  id: number;
  name: string;
  categoria: string;
  confirmed: boolean;
  entrenador?: string;
  segundo_entrenador?: string;
  duracion_partido?: string;
}

const MatchConfirmationSection = () => {
  const [teams, setTeams] = useState<TeamConfirmation[]>([]);
  const [trainerNames, setTrainerNames] = useState<{[key: number]: string}>({});
  const [secondTrainerNames, setSecondTrainerNames] = useState<{[key: number]: string}>({});
  const [halfMatchSelection, setHalfMatchSelection] = useState<{[key: number]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmationFilter, setConfirmationFilter] = useState("todos");
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('equipos')
        .select('*');

      if (error) throw error;

      const teamsData = (data as any)?.map((team: any) => ({
        id: team.id,
        name: team.name || `Equipo ${team.id}`,
        categoria: team.categoria || "General",
        confirmed: team.confirmed || false,
        entrenador: team.entrenador || undefined,
        segundo_entrenador: team.segundo_entrenador || undefined,
        duracion_partido: team.duracion_partido || 'completo'
      })) || [];

      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive",
      });
    }
  };

  const handleConfirmation = async (teamId: number) => {
    const trainerName = trainerNames[teamId];
    if (!trainerName?.trim()) {
      return;
    }

    const duracionPartido = halfMatchSelection[teamId] ? 'medio' : 'completo';

    try {
      // Actualizar en la base de datos
      const { error } = await (supabase as any)
        .from('equipos')
        .update({ 
          confirmed: true, 
          entrenador: trainerName,
          duracion_partido: duracionPartido
        })
        .eq('id', teamId);

      if (error) throw error;

      // Actualizar el estado local
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, confirmed: true, entrenador: trainerName, duracion_partido: duracionPartido }
          : team
      ));

      toast({
        title: "Éxito",
        description: "Primer entrenador confirmado correctamente",
      });
    } catch (error) {
      console.error('Error confirming team:', error);
      toast({
        title: "Error",
        description: "No se pudo confirmar el equipo",
        variant: "destructive",
      });
    }
  };

  const handleSecondTrainerConfirmation = async (teamId: number) => {
    const secondTrainerName = secondTrainerNames[teamId];
    if (!secondTrainerName?.trim()) {
      return;
    }

    try {
      // Actualizar en la base de datos
      const { error } = await (supabase as any)
        .from('equipos')
        .update({ segundo_entrenador: secondTrainerName })
        .eq('id', teamId);

      if (error) throw error;

      // Actualizar el estado local
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, segundo_entrenador: secondTrainerName }
          : team
      ));

      toast({
        title: "Éxito",
        description: "Segundo entrenador agregado correctamente",
      });
    } catch (error) {
      console.error('Error adding second trainer:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el segundo entrenador",
        variant: "destructive",
      });
    }
  };

  const handleTrainerNameChange = (teamId: number, name: string) => {
    setTrainerNames(prev => ({
      ...prev,
      [teamId]: name
    }));
  };

  const handleSecondTrainerNameChange = (teamId: number, name: string) => {
    setSecondTrainerNames(prev => ({
      ...prev,
      [teamId]: name
    }));
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConfirmation = confirmationFilter === "todos" ? true :
      confirmationFilter === "confirmados" ? team.confirmed :
      confirmationFilter === "no-confirmados" ? !team.confirmed : true;
    
    return matchesSearch && matchesConfirmation;
  });

  const groupedTeams = filteredTeams.reduce((acc, team) => {
    if (!acc[team.categoria]) {
      acc[team.categoria] = [];
    }
    acc[team.categoria].push(team);
    return acc;
  }, {} as {[key: string]: TeamConfirmation[]});

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Confirmación de Partidos</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Los entrenadores deben confirmar su participación por equipo</p>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar equipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Select value={confirmationFilter} onValueChange={setConfirmationFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los equipos</SelectItem>
                <SelectItem value="confirmados">Solo confirmados</SelectItem>
                <SelectItem value="no-confirmados">Solo no confirmados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {Object.entries(groupedTeams).map(([categoria, categoryTeams]) => (
        <Card key={categoria} className="mb-6 bg-warm-accent/5">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{categoria}</Badge>
              <span className="text-base sm:text-lg">Equipos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {categoryTeams.map((team) => (
                <div 
                  key={team.id} 
                  className={`flex flex-col gap-3 p-3 sm:p-4 rounded-lg border ${
                    team.confirmed ? 'bg-green-50 border-green-200' : 'bg-card'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{team.name}</h3>
                    {team.confirmed && team.entrenador && (
                      <div className="space-y-0.5 mt-1">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Entrenador 1: {team.entrenador}
                        </p>
                        {team.segundo_entrenador && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Entrenador 2: {team.segundo_entrenador}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Duración: {team.duracion_partido === 'medio' ? 'Medio partido' : 'Partido completo'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {team.confirmed ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-medium text-sm sm:text-base">Confirmado</span>
                      </div>
                      {!team.segundo_entrenador && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Input
                            placeholder="Segundo entrenador"
                            value={secondTrainerNames[team.id] || ''}
                            onChange={(e) => handleSecondTrainerNameChange(team.id, e.target.value)}
                            className="flex-1 text-sm"
                          />
                          <Button
                            variant="outline"
                            onClick={() => handleSecondTrainerConfirmation(team.id)}
                            disabled={!secondTrainerNames[team.id]?.trim()}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            Agregar
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                          placeholder="Nombre del entrenador"
                          value={trainerNames[team.id] || ''}
                          onChange={(e) => handleTrainerNameChange(team.id, e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="royal"
                          onClick={() => handleConfirmation(team.id)}
                          disabled={!trainerNames[team.id]?.trim()}
                          className="w-full sm:w-auto"
                        >
                          Confirmar
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Checkbox
                          id={`half-match-${team.id}`}
                          checked={halfMatchSelection[team.id] || false}
                          onCheckedChange={(checked) => 
                            setHalfMatchSelection(prev => ({
                              ...prev,
                              [team.id]: checked as boolean
                            }))
                          }
                        />
                        <label htmlFor={`half-match-${team.id}`} className="cursor-pointer">
                          Medio partido
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchConfirmationSection;