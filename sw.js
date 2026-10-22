// Service worker do Loner: existe só para o jogo poder ser instalado / virar APK.
// Não guarda nada em cache de propósito: as atualizações chegam pelo versao.json (ver js/10-inicio.js).
'use strict';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
