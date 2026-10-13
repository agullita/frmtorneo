import { Bell, BellOff, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const PushNotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    isiOS,
    isPWA,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // iOS not in PWA mode - show install instructions
  if (isiOS && !isPWA) {
    return (
      <Card className="bg-warm-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Smartphone className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Para recibir notificaciones en iOS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Para recibir notificaciones push en tu iPhone o iPad, primero debes añadir esta app a tu pantalla de inicio:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
            <li>Toca el botón de compartir <span className="inline-block">⬆️</span></li>
            <li>Selecciona "Añadir a pantalla de inicio"</li>
            <li>Abre la app desde tu pantalla de inicio</li>
            <li>Vuelve aquí para activar las notificaciones</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  // Not supported
  if (!isSupported) {
    return (
      <Card className="bg-warm-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            Notificaciones Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tu navegador no soporta notificaciones push.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-warm-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Bell className={`h-5 w-5 ${isSubscribed ? 'text-green-500' : ''}`} />
          Notificaciones Push
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Recibe alertas sobre el torneo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {isSubscribed 
            ? "Las notificaciones están activadas. Recibirás alertas sobre partidos y actualizaciones del torneo."
            : "Activa las notificaciones para recibir alertas sobre partidos y actualizaciones del torneo."}
        </p>
        
        <Button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          variant={isSubscribed ? "outline" : "royal"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : isSubscribed ? (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Desactivar Notificaciones
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Activar Notificaciones
            </>
          )}
        </Button>

        {/* Debug info - temporary */}
        <div className="text-[10px] text-muted-foreground/60 mt-2 p-2 bg-muted/30 rounded">
          <p>Debug: iOS={isiOS ? 'sí' : 'no'}, PWA={isPWA ? 'sí' : 'no'}, Soportado={isSupported ? 'sí' : 'no'}, Suscrito={isSubscribed ? 'sí' : 'no'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
