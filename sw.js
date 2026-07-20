const CACHE = 'lecturapdf-v74';

/* Recursos propios: sin ellos la app no existe. Si uno falla, es un error real. */
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Librerías externas: se cachean si se puede, pero NO bloquean la instalación. */
const VENDOR = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

/* ═══════════════════════════════════════════════════════════════════
   POR QUÉ DESAPARECIÓ EL BOTÓN DE INSTALAR

   Antes el install hacía `cache.addAll([...core, ...cdn])`. addAll() es
   ATÓMICO: si UNA sola petición falla, la promesa entera se rechaza, el
   service worker no llega a instalarse, y Chrome deja de considerar la web
   instalable — el icono de la barra de direcciones desaparece sin más.

   Bastaba con que cdnjs fuera lento, diera un 403, o estuvieras sin conexión
   un segundo, para tumbar la instalación. Ahora los recursos propios se cachean
   con addAll (si esos fallan sí es un problema de verdad) y las librerías
   externas se cachean una a una, ignorando las que fallen.
   ═══════════════════════════════════════════════════════════════════ */
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);                       // imprescindible
    await Promise.allSettled(                   // opcional: nunca rechaza
      VENDOR.map(u =>
        fetch(u, { mode: 'cors' })
          .then(r => (r.ok ? c.put(u, r) : null))
          .catch(() => null)
      )
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isShell = e.request.mode === 'navigate'
    || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/');

  if (isShell) {
    /* NETWORK-FIRST para la app: siempre intenta bajar la versión nueva;
       la caché solo se usa sin conexión. Chrome además EXIGE un handler que
       responda estando offline para considerar la app instalable: el fallback
       a caché lo cumple. */
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request).then(h => h || caches.match('./index.html')))
    );
    return;
  }

  /* Resto (librerías, iconos): cache-first, no cambian. */
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
