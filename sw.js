const CACHE_NAME = 'extensao-cache-v2';  // Mude a versão para forçar novo cache (v1 -> v2)
const URLS_TO_CACHE = [
  './',
  './index.html',
  './main.js',
  './manifest.webmanifest',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js'
  // Adicione mais se precisar: './icons/icon-192.png', etc.
];

self.addEventListener('install', (event) => {
  console.log('SW: Instalando... Cache name:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache aberto. Adicionando arquivos:', URLS_TO_CACHE);
        return cache.addAll(URLS_TO_CACHE)
          .then(() => console.log('SW: Todos arquivos cacheados com sucesso!'))
          .catch(err => console.error('SW: Erro ao cachear arquivos:', err));
      })
  );
  self.skipWaiting();  // Ativa imediatamente
});

self.addEventListener('activate', (event) => {
  console.log('SW: Ativando...');
  event.waitUntil(
    caches.keys().then(keys => {
      console.log('SW: Caches existentes:', keys);
      return Promise.all(
        keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : undefined))
      );
    })
  );
  self.clients.claim();  // Toma controle das páginas
});

self.addEventListener('fetch', (event) => {
  console.log('SW: Fetch para:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          console.log('SW: Servido do cache:', event.request.url);
          return cached;
        }
        console.log('SW: Não encontrado no cache. Tentando rede:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Cache dinâmico: Adiciona novas responses ao cache (útil para assets extras)
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
                console.log('SW: Adicionado ao cache dinamicamente:', event.request.url);
              });
            }
            return response;
          })
          .catch((err) => {
            console.error('SW: Fetch falhou (provavelmente offline):', err);
            // Opcional: Retorne uma fallback page se quiser (ex: um HTML simples offline)
            return new Response('<h1>Offline</h1><p>Conecte-se para carregar.</p>', {
              headers: { 'Content-Type': 'text/html' }
            });
          });
      })
  );
});

