import { Clock, MapPin, Users2, Calendar, User, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import RequestForm from "./RequestForm";

interface Match {
  id: string;
  date: string;
  time: string;
  campo: string;
  equipo: string;
  entrenador: string;
  duracion: string;
  categoria: string;
}

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const getCategoryVariant = (categoria: string) => {
    const categoryColors: Record<string, string> = {
      'Benjamín': 'bg-emerald-500 text-white',
      'Alevín': 'bg-blue-500 text-white',
      'Infantil': 'bg-purple-500 text-white',
      'Cadete': 'bg-orange-500 text-white',
      'Juvenil': 'bg-red-500 text-white',
      'Senior': 'bg-gray-700 text-white',
    };
    
    return categoryColors[categoria] || 'bg-primary text-primary-foreground';
  };

  if (showRequestForm) {
    return <RequestForm match={match} onClose={() => setShowRequestForm(false)} />;
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-royal animate-fade-in bg-warm-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          {match.equipo}
        </CardTitle>
        <Badge className={`w-fit ${getCategoryVariant(match.categoria)}`}>
          {match.categoria}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{match.date}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{match.time}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{match.campo}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm">{match.entrenador}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className="text-sm">{match.duracion}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => setShowRequestForm(true)}
          variant="royal"
          className="w-full"
        >
          <Users2 className="h-4 w-4 mr-2" />
          Solicitar Partido
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatchCard;