let CACHE = 'cache-and-update';

function precache() {
  return caches.open(CACHE).then(function(cache) {
    return cache.addAll([
      '/',
      '/index.html',
      '/css/style.css',
      '/js/svgs.min.js',
      '/js/app.min.js',
      '/sounds/correct1.m4a',
      '/sounds/correct2.m4a',
      '/sounds/wrong.m4a',
      '/sounds/gameover.m4a',
      '/sounds/newlevel.m4a'
    ]);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(request).then(function(matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request) {
  return caches.open(CACHE).then(function(cache) {
    return fetch(request).then(function(response) {
      return cache.put(request, response);
    });
  });
}

self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');
  evt.waitUntil(precache());
});

self.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.');
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(update(evt.request));
});
