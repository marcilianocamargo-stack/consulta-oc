/* Consulta OC Prime — service worker (app shell só, sem cache de dados —
   os dados vêm sempre da rede: JSONs de produção e programacao-hoje.xlsx do GitHub).
   Para forçar atualização nos aparelhos: mude o número da versão e faça o commit.
   O nome do cache começa com "consulta-oc-app-" e só os caches com esse começo são apagados aqui:
   todos os apps da Prime ficam no mesmo endereço (github.io) e dividem o mesmo armazenamento. */
const VERSAO = 'consulta-oc-app-v1';
const ARQUIVOS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('consulta-oc-app-') && k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Só o app em si: as requisições de dados (outra origem, atualizadas a cada minuto)
  // passam direto pela rede — se entrassem no cache ele cresceria sem parar.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
