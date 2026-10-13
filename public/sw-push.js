self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  // Default values
  let data = {
    title: 'Torneo FRM',
    body: 'Tienes una nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-transp.png',
    url: '/',
    vibrate: [100, 50, 100],
  };

  try {
    if (event.data) {
      console.log('[SW] Push has data');
      const text = event.data.text();
      console.log('[SW] Raw data:', text.substring(0, 100));
      
      try {
        const payload = JSON.parse(text);
        console.log('[SW] Parsed payload:', payload);
        data = { ...data, ...payload };
      } catch (parseError) {
        console.log('[SW] Could not parse as JSON, using as body text');
        data.body = text;
      }
    } else {
      console.log('[SW] Push event has no data');
    }
  } catch (e) {
    console.error('[SW] Error processing push data:', e);
    if (event.data) {
      try {
        data.body = event.data.text();
      } catch (textError) {
        console.error('[SW] Could not get text from data:', textError);
      }
    }
  }

  console.log('[SW] Showing notification:', data.title, data.body);

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate,
    tag: 'torneo-frm-notification',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch((err) => console.error('[SW] Error showing notification:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Listen for install
self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installed');
  self.skipWaiting();
});

// Listen for activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  event.waitUntil(clients.claim());
});
