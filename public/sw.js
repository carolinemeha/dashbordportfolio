/* Service worker admin — notifications push navigateur */
self.addEventListener('push', (event) => {
  let data = { title: 'Portfolio Admin', body: '', url: '/admin/dashboard' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    data.body = event.data?.text() || '';
  }
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: data.url || '/admin/dashboard' },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/admin/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
