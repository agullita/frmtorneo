import { useState, useEffect } from "react";
import { Bell, Send, Users, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NotificacionEnviada {
  id: string;
  titulo: string;
  mensaje: string;
  enviadas_a: number;
  fallidas: number;
  created_at: string;
}

const SendNotificationPanel = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [historial, setHistorial] = useState<NotificacionEnviada[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchSubscriberCount();
      fetchHistorial();
    }
  }, [isAdmin]);

  const fetchSubscriberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setSubscriberCount(count || 0);
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const fetchHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistorial(data || []);
    } catch (error) {
      console.error('Error fetching notification history:', error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Error",
        description: "El título y el mensaje son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    let sent = 0;
    let failed = 0;
    let success = false;

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim(),
          url: window.location.origin,
          icon: '/icon-192.png'
        }
      });

      if (error) {
        failed = subscriberCount || 0;
      } else {
        sent = data?.sent || 0;
        failed = data?.failed || 0;
        success = true;
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      failed = subscriberCount || 0;
    }

    // Guardar siempre en historial
    const { error: insertError } = await supabase
      .from('notificaciones_enviadas')
      .insert({
        titulo: title.trim(),
        mensaje: body.trim(),
        enviadas_a: sent,
        fallidas: failed
      });

    if (insertError) {
      console.error('Error saving notification history:', insertError);
    }

    if (success) {
      toast({
        title: "Notificaciones enviadas",
        description: `Se enviaron ${sent} notificaciones correctamente`,
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudieron enviar las notificaciones",
        variant: "destructive",
      });
    }

    // Limpiar formulario
    setTitle("");
    setBody("");
    
    // Refrescar contador e historial
    fetchSubscriberCount();
    fetchHistorial();
    setIsSending(false);
  };

  if (!isAdmin) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Solo los administradores pueden enviar notificaciones</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-royal text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span className="text-base sm:text-lg">Enviar Notificación</span>
            </div>
            {subscriberCount !== null && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Users className="h-3 w-3 mr-1" />
                {subscriberCount} suscritos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notification-title" className="text-white/90 text-sm">
              Título
            </Label>
            <Input
              id="notification-title"
              placeholder="Ej: Nuevo partido disponible"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              maxLength={50}
            />
            <p className="text-xs text-white/60 mt-1">{title.length}/50 caracteres</p>
          </div>
          
          <div>
            <Label htmlFor="notification-body" className="text-white/90 text-sm">
              Mensaje
            </Label>
            <Textarea
              id="notification-body"
              placeholder="Ej: Se ha publicado un nuevo partido para la categoría Benjamín"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
              maxLength={200}
            />
            <p className="text-xs text-white/60 mt-1">{body.length}/200 caracteres</p>
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isSending || !title.trim() || !body.trim() || subscriberCount === 0}
            className="w-full bg-white text-primary hover:bg-white/90"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar a {subscriberCount || 0} dispositivos
              </>
            )}
          </Button>

          {subscriberCount === 0 && (
            <p className="text-xs text-white/70 text-center">
              No hay dispositivos suscritos a las notificaciones
            </p>
          )}
        </CardContent>
      </Card>

      {/* Historial de notificaciones */}
      <Card className="bg-white text-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Historial de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistorial ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : historial.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No hay notificaciones enviadas
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {historial.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{notif.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.mensaje}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {notif.enviadas_a}
                          </Badge>
                          {notif.fallidas > 0 && (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              {notif.fallidas}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notif.created_at), "d MMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SendNotificationPanel;
