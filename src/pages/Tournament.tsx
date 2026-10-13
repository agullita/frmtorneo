import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import AdminSection from "@/components/AdminSection";
import MatchConfirmationSection from "@/components/MatchConfirmationSection";
import HelpersSection from "@/components/HelpersSection";
import PushNotificationSettings from "@/components/PushNotificationSettings";
import MobileNavigation from "@/components/MobileNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Tournament = () => {
  const [currentSection, setCurrentSection] = useState("partidos");
  const [matches, setMatches] = useState([]);
  const { loading: authLoading, isAdmin } = useAuth();

  const loadMatches = async () => {
    try {
      console.log('Loading matches...');
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw data from database:', data);

      const formattedMatches = data?.map(match => ({
        id: match.id,
        date: match.fecha,
        time: match.hora,
        campo: match.campo,
        equipo: match.escuela,
        entrenador: match.entrenador,
        duracion: match.duracion,
        categoria: match.categoria,
      })) || [];

      console.log('Formatted matches:', formattedMatches);
      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleAddMatch = () => {
    loadMatches();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-3 py-4">
        {/* Content based on selected section */}
        {currentSection === "partidos" && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground">Partidos del Torneo</h2>
              <p className="text-sm text-muted-foreground">Solicita partidos disponibles</p>
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 gap-4">
              {matches.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No hay partidos disponibles</p>
                </div>
              ) : (
                matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                  />
                ))
              )}
            </div>
          </>
        )}

        {currentSection === "confirmacion" && <MatchConfirmationSection />}
        
        {currentSection === "ayudantes" && <HelpersSection />}

        {currentSection === "notificaciones" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Notificaciones</h2>
              <p className="text-sm text-muted-foreground">Configura las alertas del torneo</p>
            </div>
            
            <PushNotificationSettings />
          </div>
        )}

        {currentSection === "admin" && (
          <AdminSection onAddMatch={handleAddMatch} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
    </div>
  );
};

export default Tournament;
