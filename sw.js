const CACHE_NAME = 'phonepe-mock-v2';

// Un sabhi files aur images ke naam jo hume offline chalane hain
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/home.html',
  '/search.html',
  '/alerts.html',
  '/history.html',
  '/QRScan.html',
  '/pay.html',
  '/upipay.html',
  '/trans.html',
  '/managepp.html',
  '/manifest.json',
  
  // Images (Aapke folder me jo bhi images hain, unke naam yahan likhe hain)
  '/logo.png',
  '/topbanner.png',
  '/1.png',
  '/2.png',
  '/3.png',
  '/4.png',
  '/5.png',
  '/6.png',
  '/7.png',
  '/8.png',
  '/qr-code.png',
  '/mailbox.png',
  '/bhim.png',
  '/upilogo.png'
];

// 1. INSTALL EVENT: Saari files ko pehli baar me phone ki memory (Cache) me save karna
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and saving files...');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting(); // Naya service worker turant activate ho jaye
});

// 2. ACTIVATE EVENT: Agar koi purana cache hai toh use delete karke memory clean karna
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH EVENT: Jab bhi app koi file/image maange, toh pehle Offline Cache check karo
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Agar file cache me mil gayi (Offline), toh wahin se turant de do
        if (response) {
          return response;
        }
        
        // Agar file cache me nahi hai, toh Internet (Network) se laao
        // Aur future ke liye use bhi cache me save kar lo (Jaise Google Fonts ya Flaticon)
        return fetch(event.request).then(
          function(networkResponse) {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Response ko clone karke cache me daal do
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      }).catch(err => {
        // Agar net bhi band hai aur file cache me bhi nahi hai (Error handling)
        console.log('Offline mode and file not in cache', err);
      })
  );
});
