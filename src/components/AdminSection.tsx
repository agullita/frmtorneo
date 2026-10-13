import { useState, useEffect } from "react";
import { Shield, Users, Calendar, Check, X, Trash2, RotateCcw, Plus, UsersIcon, Download, FileText, LogIn, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddMatchForm from "./AddMatchForm";
import SendNotificationPanel from "./SendNotificationPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSectionProps {
  onAddMatch: () => void;
}

const AdminSection = ({ onAddMatch }: AdminSectionProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [helpers, setHelpers] = useState<any[]>([]);
  const [matchRequests, setMatchRequests] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    categoria: "",
    entrenador: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (showAdmin && isAdmin) {
      loadAdminData();
    }
  }, [showAdmin, isAdmin]);

  const loadAdminData = async () => {
    try {
      // Cargar ayudantes
      const { data: helpersData, error: helpersError } = await supabase
        .from('ayudantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (helpersError) throw helpersError;
      setHelpers(helpersData || []);

      // Cargar solicitudes de partidos ordenadas por partido
      const { data: requestsData, error: requestsError } = await supabase
        .from('partidos_pedidos')
        .select('*')
        .order('escuela', { ascending: true })
        .order('fecha', { ascending: true });

      if (requestsError) throw requestsError;
      setMatchRequests(requestsData || []);

      // Cargar equipos
      const { data: teamsData, error: teamsError } = await supabase
        .from('equipos')
        .select('*')
        .order('categoria', { ascending: true })
        .order('name', { ascending: true });

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Cargar partidos
      const { data: matchesData, error: matchesError } = await supabase
        .from('partidos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowAdmin(false);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const handleDeleteHelper = async (helperId: number) => {
    try {
      const { error } = await supabase
        .from('ayudantes')
        .delete()
        .eq('id', helperId);

      if (error) throw error;

      // Actualizar el estado local
      setHelpers(helpers.filter(helper => helper.id !== helperId));
    } catch (error) {
      console.error('Error deleting helper:', error);
    }
  };

  const handleDeleteMatchRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('partidos_pedidos')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      // Actualizar el estado local
      setMatchRequests(matchRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error deleting match request:', error);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.categoria) {
      toast({
        title: "Error",
        description: "Nombre del equipo y categoría son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('equipos')
        .insert([{
          name: newTeam.name,
          categoria: newTeam.categoria,
          entrenador: newTeam.entrenador || null,
          confirmed: false
        }]);

      if (error) throw error;

      toast({
        title: "Equipo añadido",
        description: `${newTeam.name} ha sido añadido al torneo`
      });

      setNewTeam({ name: "", categoria: "", entrenador: "" });
      loadAdminData();
    } catch (error) {
      console.error('Error adding team:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el equipo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      const { error } = await supabase
        .from('equipos')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado del torneo"
      });

      setTeams(teams.filter(team => team.id !== teamId));
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo",
        variant: "destructive"
      });
    }
  };

  const handleResetAllConfirmations = async () => {
    try {
      const { error } = await supabase
        .from('equipos')
        .update({ 
          confirmed: false,
          entrenador: null,
          segundo_entrenador: null,
          duracion_partido: 'completo'
        })
        .neq('id', 0); // Update all records

      if (error) throw error;

      toast({
        title: "Confirmaciones reseteadas",
        description: "Todos los equipos han sido marcados como no confirmados"
      });

      loadAdminData();
    } catch (error) {
      console.error('Error resetting confirmations:', error);
      toast({
        title: "Error",
        description: "No se pudieron resetear las confirmaciones",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('partidos')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Partido eliminado",
        description: "El partido ha sido eliminado del torneo"
      });

      setMatches(matches.filter(match => match.id !== matchId));
      onAddMatch(); // Refresh the matches in the parent component
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el partido",
        variant: "destructive"
      });
    }
  };

  const exportConfirmedTeams = () => {
    const confirmedTeams = teams.filter(team => team.confirmed);
    
    if (confirmedTeams.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay equipos confirmados para exportar",
        variant: "destructive",
      });
      return;
    }

    // Crear CSV
    const headers = ['Equipo', 'Categoría', 'Entrenador 1', 'Entrenador 2', 'Duración'];
    const csvContent = [
      headers.join(','),
      ...confirmedTeams.map(team => [
        `"${team.name}"`,
        `"${team.categoria}"`,
        `"${team.entrenador || ''}"`,
        `"${team.segundo_entrenador || ''}"`,
        `"${team.duracion_partido === 'medio' ? 'Medio partido' : 'Partido completo'}"`
      ].join(','))
    ].join('\n');

    // Crear y descargar archivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `equipos_confirmados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${confirmedTeams.length} equipos confirmados en CSV`,
    });
  };

  const exportConfirmedTeamsHTML = () => {
    const confirmedTeams = teams.filter(team => team.confirmed);
    
    if (confirmedTeams.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay equipos confirmados para exportar",
        variant: "destructive",
      });
      return;
    }

    // Crear HTML con tabla estructurada
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Equipos Confirmados - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header-info { text-align: center; margin-bottom: 20px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Equipos Confirmados para el Torneo</h1>
        <div class="header-info">
          <p>Fecha de exportación: ${new Date().toLocaleDateString()}</p>
          <p>Total de equipos confirmados: ${confirmedTeams.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Categoría</th>
              <th>Entrenador Principal</th>
              <th>Segundo Entrenador</th>
              <th>Duración del Partido</th>
            </tr>
          </thead>
          <tbody>
            ${confirmedTeams.map(team => `
              <tr>
                <td>${team.name}</td>
                <td>${team.categoria}</td>
                <td>${team.entrenador || '-'}</td>
                <td>${team.segundo_entrenador || '-'}</td>
                <td>${team.duracion_partido === 'medio' ? 'Medio partido' : 'Partido completo'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Crear y descargar archivo HTML
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `equipos_confirmados_tabla_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${confirmedTeams.length} equipos confirmados en formato tabla HTML`,
    });
  };

  // Auto-show admin panel when this component is rendered
  useEffect(() => {
    setShowAdmin(true);
  }, []);

  if (!user || !isAdmin) {
    return (
      <Card className="mb-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Acceso Administrador
            </div>
            <Button
              onClick={() => setShowAdmin(false)}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Debes iniciar sesión como administrador para acceder a esta sección
            </p>
            
            <Button
              onClick={() => navigate('/auth')}
              variant="royal"
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <Card className="bg-gradient-royal text-white">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-base sm:text-lg">Panel Administrador</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6">
          <p className="text-madrid-gold mb-4 text-sm sm:text-base">
            Gestiona los partidos del torneo desde aquí
          </p>
          
          <div className="bg-white/10 rounded-lg p-3 sm:p-4">
            <Tabs defaultValue="partidos" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white/20 h-auto gap-1 p-1">
                <TabsTrigger value="partidos" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs py-2 px-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Partidos</span>
                </TabsTrigger>
                <TabsTrigger value="equipos" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs py-2 px-1">
                  <UsersIcon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Equipos</span>
                </TabsTrigger>
                <TabsTrigger value="ayudantes" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs py-2 px-1">
                  <Users className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Ayudantes</span>
                </TabsTrigger>
                <TabsTrigger value="solicitudes" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs py-2 px-1">
                  <Shield className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Solicitudes</span>
                </TabsTrigger>
                <TabsTrigger value="notificar" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary text-xs py-2 px-1">
                  <Bell className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Notificar</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="partidos" className="mt-4">
                <div className="space-y-6">
                  <AddMatchForm onAddMatch={onAddMatch} />
                  
                  {/* Lista de partidos existentes */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 text-foreground">
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Partidos Creados ({matches.length})</h3>
                    {matches.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 text-sm">No hay partidos creados</p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {matches.map((match) => (
                          <div key={match.id} className="p-3 border rounded-lg bg-muted/30 animate-fade-in">
                            <div className="flex flex-col gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm mb-2 truncate">{match.escuela}</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
                                  <div className="truncate"><strong>Fecha:</strong> {match.fecha}</div>
                                  <div className="truncate"><strong>Hora:</strong> {match.hora}</div>
                                  <div className="truncate"><strong>Campo:</strong> {match.campo}</div>
                                  <div className="truncate"><strong>Categoría:</strong> {match.categoria}</div>
                                  <div className="truncate"><strong>Entrenador:</strong> {match.entrenador}</div>
                                  <div className="truncate"><strong>Duración:</strong> {match.duracion}</div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="min-w-[36px]"
                                  onClick={() => handleDeleteMatch(match.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="equipos" className="mt-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 text-foreground">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">Equipos del Torneo ({teams.length})</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={exportConfirmedTeams}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        CSV
                      </Button>
                      
                      <Button
                        onClick={exportConfirmedTeamsHTML}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        HTML
                      </Button>
                      
                      <Button
                        onClick={handleResetAllConfirmations}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
                      >
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Resetear</span>
                      </Button>
                    </div>
                  </div>

                  {/* Formulario para añadir equipo */}
                  <div className="bg-muted/50 p-3 sm:p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Nuevo Equipo
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="teamName" className="text-xs sm:text-sm">Nombre del Equipo</Label>
                          <Input
                            id="teamName"
                            value={newTeam.name}
                            onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                            placeholder="Ej: Real Madrid CF"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="teamCategory" className="text-xs sm:text-sm">Categoría</Label>
                          <Select value={newTeam.categoria} onValueChange={(value) => setNewTeam({...newTeam, categoria: value})}>
                            <SelectTrigger id="teamCategory" className="mt-1">
                              <SelectValue placeholder="Seleccionar categoría" />
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
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="teamCoach" className="text-xs sm:text-sm">Entrenador (opcional)</Label>
                          <Input
                            id="teamCoach"
                            value={newTeam.entrenador}
                            onChange={(e) => setNewTeam({...newTeam, entrenador: e.target.value})}
                            placeholder="Nombre del entrenador"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={handleAddTeam}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Equipo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de equipos */}
                  {teams.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">No hay equipos registrados</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {teams.map((team) => (
                        <div key={team.id} className="p-3 border rounded-lg bg-muted/30 animate-fade-in">
                          <div className="flex flex-col gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-medium text-sm truncate">{team.name}</span>
                                {team.confirmed && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                    Confirmado
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
                                <div className="truncate"><strong>Categoría:</strong> {team.categoria}</div>
                                <div className="truncate"><strong>Entrenador:</strong> {team.entrenador || '-'}</div>
                                <div className="truncate"><strong>Estado:</strong> {team.confirmed ? 'Confirmado' : 'Pendiente'}</div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="min-w-[36px]"
                                onClick={() => handleDeleteTeam(team.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ayudantes" className="mt-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 text-foreground">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Ayudantes Registrados ({helpers.length})</h3>
                  {helpers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">No hay ayudantes registrados</p>
                  ) : (
                     <div className="space-y-3 max-h-96 overflow-y-auto">
                       {helpers.map((helper) => (
                         <div key={helper.id} className="p-3 border rounded-lg bg-muted/50 animate-fade-in">
                           <div className="flex flex-col gap-3">
                             <div className="flex-1 min-w-0">
                               <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                 <div className="truncate"><strong>Nombre:</strong> {helper.nombre}</div>
                                 <div className="truncate"><strong>Email:</strong> {helper.email}</div>
                                 <div><strong>Día:</strong> {helper.dia}</div>
                                 <div><strong>Turno:</strong> {helper.turno}</div>
                               </div>
                             </div>
                             <div className="flex items-center justify-end gap-2">
                               <Button
                                 size="sm"
                                 className="bg-green-600 hover:bg-green-700 text-white min-w-[36px]"
                                 onClick={() => {
                                   const subject = encodeURIComponent("Adjudicación de Ayudantes");
                                   const body = encodeURIComponent("Has sido el elegido. Te esperamos");
                                   window.open(`mailto:${helper.email}?subject=${subject}&body=${body}`);
                                 }}
                               >
                                 <Check className="h-4 w-4" />
                               </Button>
                               <Button
                                 size="sm"
                                 className="bg-red-600 hover:bg-red-700 text-white min-w-[36px]"
                                 onClick={() => {
                                   const subject = encodeURIComponent("Adjudicación de Ayudantes");
                                   const body = encodeURIComponent("En este ocasión no has sido el seleccionado. Gracias por ofrecerte.");
                                   window.open(`mailto:${helper.email}?subject=${subject}&body=${body}`);
                                 }}
                               >
                                 <X className="h-4 w-4" />
                               </Button>
                               <Button
                                 size="sm"
                                 variant="destructive"
                                 className="min-w-[36px]"
                                 onClick={() => handleDeleteHelper(helper.id)}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="solicitudes" className="mt-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 text-foreground">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Solicitudes de Partidos ({matchRequests.length})</h3>
                  {matchRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">No hay solicitudes de partidos</p>
                  ) : (
                     <div className="space-y-4 max-h-96 overflow-y-auto">
                       {matchRequests.map((request) => (
                         <div key={request.id} className="p-3 sm:p-4 border rounded-lg bg-muted/50 animate-fade-in">
                           <div className="flex flex-col gap-3">
                             <div className="grid grid-cols-1 gap-3">
                               <div className="space-y-2">
                                 <div className="flex items-center gap-2">
                                   <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                                   <span className="font-semibold text-sm sm:text-base truncate">{request.escuela}</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm text-muted-foreground">
                                   <div><strong>Fecha:</strong> {request.fecha}</div>
                                   <div><strong>Hora:</strong> {request.hora}</div>
                                   <div><strong>Campo:</strong> {request.campo}</div>
                                   <div><strong>Categoría:</strong> {request.categoria}</div>
                                   <div className="col-span-2"><strong>Duración:</strong> {request.duracion}</div>
                                 </div>
                               </div>
                               <div className="space-y-2 border-t pt-3">
                                 <div className="flex items-center gap-2">
                                   <Users className="h-4 w-4 text-primary flex-shrink-0" />
                                   <span className="font-semibold text-sm">Entrenador Solicitante</span>
                                 </div>
                                 <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm text-muted-foreground">
                                   <div className="truncate"><strong>Nombre:</strong> {request.entrenador}</div>
                                   <div className="truncate"><strong>Email:</strong> {request.email}</div>
                                   {request.sustituto && (
                                     <div className="truncate"><strong>Sustituto:</strong> {request.sustituto}</div>
                                   )}
                                 </div>
                               </div>
                             </div>
                             <div className="flex items-center justify-end gap-2 pt-2 border-t">
                               <Button
                                 size="sm"
                                 className="bg-green-600 hover:bg-green-700 text-white min-w-[36px]"
                                 onClick={() => {
                                   const subject = encodeURIComponent(`${request.escuela} ${request.categoria} ${request.fecha} ${request.hora}`);
                                   const body = encodeURIComponent("Se te ha asignado este partido. Gracias!");
                                   window.open(`mailto:${request.email}?subject=${subject}&body=${body}`);
                                 }}
                               >
                                 <Check className="h-4 w-4" />
                               </Button>
                               <Button
                                 size="sm"
                                 className="bg-red-600 hover:bg-red-700 text-white min-w-[36px]"
                                 onClick={() => {
                                   const subject = encodeURIComponent(`${request.escuela} ${request.categoria} ${request.fecha} ${request.hora}`);
                                   const body = encodeURIComponent("No has sido seleccionado para este partido. Gracias por solicitarlo.");
                                   window.open(`mailto:${request.email}?subject=${subject}&body=${body}`);
                                 }}
                               >
                                 <X className="h-4 w-4" />
                               </Button>
                               <Button
                                 size="sm"
                                 variant="destructive"
                                 className="min-w-[36px]"
                                 onClick={() => handleDeleteMatchRequest(request.id)}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notificar" className="mt-4">
                <SendNotificationPanel />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSection;