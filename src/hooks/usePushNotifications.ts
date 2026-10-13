import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - MUST match the VAPID_PUBLIC_KEY secret in Supabase
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BD1Z7wj3tTMXsDAZfsSO4cpYm-iDPASdJ6xr6HqCMf_97tvNR87qxKkxiwZKcV3h7sytbtzgJtgPjYVfKJks6zw';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isiOS, setIsiOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsiOS(isIOSDevice);

    // Check PWA mode - multiple methods for iOS compatibility
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    // Also check if running in fullscreen or minimal-ui
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    
    const isPWAMode = isStandalone || isIOSStandalone || isFullscreen || isMinimalUI;
    setIsPWA(isPWAMode);

    console.log('[Push] Device check:', { 
      isIOSDevice, 
      isStandalone, 
      isIOSStandalone, 
      isFullscreen,
      isMinimalUI,
      isPWAMode,
      userAgent: navigator.userAgent.substring(0, 50)
    });

    const checkSupport = () => {
      const hasSW = 'serviceWorker' in navigator;
      const hasPush = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      
      console.log('[Push] Support check:', { hasSW, hasPush, hasNotification, isIOSDevice, isPWAMode });
      
      // For iOS, we need to be more lenient - allow if basic APIs exist
      if (isIOSDevice) {
        // iOS 16.4+ supports push in PWA mode
        const supported = hasSW && hasPush && hasNotification;
        console.log('[Push] iOS support:', supported, 'isPWA:', isPWAMode);
        setIsSupported(supported);
        return;
      }

      const supported = hasSW && hasPush && hasNotification;
      console.log('[Push] Final support:', supported);
      setIsSupported(supported);
    };

    checkSupport();

    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      console.log('[Push] Current permission:', Notification.permission);
    }

    // Check if already subscribed
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      console.log('[Push] Existing registration:', !!registration);
      
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        console.log('[Push] Existing subscription:', !!subscription);
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('[Push] Error checking subscription:', error);
    }
  };

  const subscribe = useCallback(async () => {
    console.log('[Push] Subscribe called. isSupported:', isSupported, 'isiOS:', isiOS, 'isPWA:', isPWA);
    
    if (!isSupported) {
      toast({
        title: "No soportado",
        description: isiOS && !isPWA 
          ? "En iOS, primero añade la app a tu pantalla de inicio"
          : "Tu navegador no soporta notificaciones push",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    let step = "inicio";

    try {
      // Step 1: Request permission
      step = "permiso";
      console.log('[Push] Step 1: Requesting permission...');
      const permissionResult = await Notification.requestPermission();
      console.log('[Push] Permission result:', permissionResult);
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast({
          title: "Permiso denegado",
          description: "Debes permitir las notificaciones para recibirlas",
          variant: "destructive",
        });
        return false;
      }

      // Step 2: Register service worker
      step = "service-worker";
      console.log('[Push] Step 2: Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/'
      });
      console.log('[Push] Service worker registered:', registration.scope);

      // Step 3: Wait for service worker to be ready
      step = "sw-ready";
      console.log('[Push] Step 3: Waiting for service worker ready...');
      await navigator.serviceWorker.ready;
      console.log('[Push] Service worker ready');

      // Step 4: Subscribe to push
      step = "push-subscribe";
      console.log('[Push] Step 4: Subscribing to push with VAPID key...');
      console.log('[Push] VAPID key length:', VAPID_PUBLIC_KEY.length);
      
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      console.log('[Push] Application server key created, length:', applicationServerKey.length);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
      console.log('[Push] Subscription created:', subscription.endpoint.substring(0, 50));

      // Step 5: Save subscription to Supabase
      step = "guardar-db";
      const subscriptionJSON = subscription.toJSON();
      console.log('[Push] Step 5: Saving to Supabase...');
      console.log('[Push] Subscription keys present:', !!subscriptionJSON.keys?.p256dh, !!subscriptionJSON.keys?.auth);
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscriptionJSON.endpoint,
          p256dh: subscriptionJSON.keys?.p256dh,
          auth: subscriptionJSON.keys?.auth,
          user_agent: navigator.userAgent,
        }, {
          onConflict: 'endpoint'
        });

      if (error) {
        console.error('[Push] Supabase error:', error);
        throw new Error(`Error guardando: ${error.message}`);
      }

      console.log('[Push] Subscription saved successfully');
      setIsSubscribed(true);
      toast({
        title: "¡Notificaciones activadas!",
        description: "Recibirás alertas sobre el torneo",
      });

      return true;
    } catch (error: any) {
      console.error('[Push] Error subscribing:', error);
      console.error('[Push] Error name:', error?.name);
      console.error('[Push] Error message:', error?.message);
      console.error('[Push] Error stack:', error?.stack);
      
      let errorMessage = "No se pudieron activar las notificaciones";
      let errorDetail = "";
      
      if (error?.name === 'InvalidStateError') {
        errorMessage = "Error de estado";
        errorDetail = "Cierra la app completamente y vuelve a abrirla";
      } else if (error?.name === 'NotAllowedError') {
        errorMessage = "Permiso denegado";
        errorDetail = "Ve a Ajustes > Notificaciones y permite las notificaciones para esta app";
      } else if (error?.name === 'AbortError') {
        errorMessage = "Operación cancelada";
        errorDetail = "Intenta de nuevo";
      } else if (error?.message?.includes('VAPID') || error?.message?.includes('applicationServerKey')) {
        errorMessage = "Error de configuración";
        errorDetail = "Clave VAPID inválida. Contacta al administrador.";
      } else if (error?.message?.includes('push service')) {
        errorMessage = "Servicio no disponible";
        errorDetail = "El servicio de push no está disponible. Intenta más tarde.";
      } else if (error?.message) {
        errorDetail = error.message.substring(0, 100);
      }
      
      toast({
        title: errorMessage,
        description: errorDetail || "Intenta de nuevo más tarde",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isiOS, isPWA, toast]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Remove from Supabase
          await (supabase as any)
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);

          // Unsubscribe
          await subscription.unsubscribe();
        }
      }

      setIsSubscribed(false);
      toast({
        title: "Notificaciones desactivadas",
        description: "Ya no recibirás alertas",
      });

      return true;
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "No se pudieron desactivar las notificaciones",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    isiOS,
    isPWA,
    subscribe,
    unsubscribe,
  };
}
