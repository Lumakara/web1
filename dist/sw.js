/**
 * Digital Services Store - Service Worker
 * A comprehensive PWA service worker for React Vite application
 * 
 * Features:
 * - Static asset caching with Cache First strategy
 * - API calls with Network First strategy
 * - Offline mode support with fallback page
 * - Background sync for form submissions
 * - Cache versioning and cleanup
 * - App shell caching
 */

// ============================================
// CACHE CONFIGURATION
// ============================================

const CACHE_VERSION = 'v1';
const CACHE_NAME = `digital-services-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`;
const API_CACHE_NAME = `${CACHE_NAME}-api`;

// Cache duration for API responses (in milliseconds)
const API_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

// ============================================
// ASSETS TO CACHE
// ============================================

// App Shell - Core HTML and critical assets
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html'
];

// Static asset file extensions to cache
const STATIC_FILE_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.woff',
  '.woff2',
  '.webp',
  '.ico',
  '.json',
  '.map'
];

// Image extensions for specialized image caching
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

// API endpoint patterns (Network First strategy)
const API_PATTERNS = [
  /\/api\//,
  /\/rest\/v1\//,           // Supabase REST API
  /\/auth\/v1\//,           // Supabase Auth API
  /\/storage\/v1\//,        // Supabase Storage API
  /\/functions\/v1\//,      // Supabase Functions
  /graphql/
];

// External domains to cache (CDNs, etc.)
const EXTERNAL_CACHE_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com'
];

// Routes that should never be cached
const NEVER_CACHE_PATTERNS = [
  /\/api\/auth\/(signout|logout)/,
  /\/api\/webhook/
];

// ============================================
// BACKGROUND SYNC CONFIGURATION
// ============================================

const SYNC_TAG = 'form-submission';
const QUEUED_REQUESTS_STORE = 'queued-requests';

// ============================================
// INSTALL EVENT - Cache App Shell & Static Assets
// ============================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    Promise.all([
      // Cache app shell
      cacheAppShell(),
      // Pre-cache critical static assets
      cacheCriticalAssets(),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Cache the app shell (index.html and critical resources)
 */
async function cacheAppShell() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Add all app shell assets
    await cache.addAll(APP_SHELL_ASSETS);
    console.log('[Service Worker] App shell cached successfully');
  } catch (error) {
    console.error('[Service Worker] Failed to cache app shell:', error);
    // Continue even if some assets fail - app can still work
  }
}

/**
 * Cache critical static assets discovered during build
 */
async function cacheCriticalAssets() {
  // This will be populated by the build process or runtime caching
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try to cache main entry points if they exist
  const criticalAssets = [
    '/assets/index.js',
    '/assets/index.css',
    '/manifest.json'
  ];

  // Use individual fetch-and-cache to handle failures gracefully
  await Promise.all(
    criticalAssets.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (error) {
        // Asset might not exist, skip silently
      }
    })
  );
}

// ============================================
// ACTIVATE EVENT - Clean Up Old Caches
// ============================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      // Claim clients immediately
      self.clients.claim(),
      // Set up IndexedDB for background sync
      setupBackgroundSyncDB()
    ])
  );
});

/**
 * Remove old cache versions
 */
async function cleanupOldCaches() {
  const cacheWhitelist = [STATIC_CACHE_NAME, IMAGE_CACHE_NAME, API_CACHE_NAME];
  
  const cacheNames = await caches.keys();
  
  const deletionPromises = cacheNames
    .filter(cacheName => {
      // Check if this cache belongs to our app but is not in whitelist
      return cacheName.startsWith('digital-services-') && 
             !cacheWhitelist.includes(cacheName);
    })
    .map(async (oldCacheName) => {
      console.log('[Service Worker] Deleting old cache:', oldCacheName);
      await caches.delete(oldCacheName);
    });

  await Promise.all(deletionPromises);
  console.log('[Service Worker] Old caches cleaned up');
}

/**
 * Setup IndexedDB for storing queued form submissions
 */
async function setupBackgroundSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BackgroundSyncDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(QUEUED_REQUESTS_STORE)) {
        const store = db.createObjectStore(QUEUED_REQUESTS_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('tag', 'tag', { unique: false });
      }
    };
  });
}

// ============================================
// FETCH EVENT - Handle All Network Requests
// ============================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching (except for background sync handling)
  if (request.method !== 'GET' && request.method !== 'POST') {
    return;
  }

  // Skip browser extensions and chrome-extension URLs
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:') {
    return;
  }

  // Check if this request should never be cached
  if (shouldNeverCache(url)) {
    return;
  }

  // Route the request to appropriate handler
  if (isAPIRequest(url)) {
    // API calls - Network First strategy
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    // Images - Cache First with stale-while-revalidate
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(url)) {
    // Static assets - Cache First strategy
    event.respondWith(handleStaticAsset(request));
  } else if (isExternalResource(url)) {
    // External resources - Cache First with timeout
    event.respondWith(handleExternalResource(request));
  } else {
    // Navigation requests and others - Network First with offline fallback
    event.respondWith(handleNavigationRequest(request));
  }
});

// ============================================
// REQUEST TYPE DETECTORS
// ============================================

/**
 * Check if URL is an API request
 */
function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.hostname.includes('supabase.co') ||
         API_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Check if URL is an image request
 */
function isImageRequest(url) {
  return IMAGE_EXTENSIONS.some(ext => 
    url.pathname.toLowerCase().endsWith(ext)
  );
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  // Check Vite assets folder
  if (url.pathname.startsWith('/assets/')) {
    return true;
  }
  // Check file extensions
  return STATIC_FILE_EXTENSIONS.some(ext => 
    url.pathname.toLowerCase().endsWith(ext)
  );
}

/**
 * Check if URL is an external resource we should cache
 */
function isExternalResource(url) {
  return EXTERNAL_CACHE_DOMAINS.some(domain => 
    url.hostname.includes(domain)
  );
}

/**
 * Check if request should never be cached
 */
function shouldNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// ============================================
# FETCH HANDLERS
// ============================================

/**
 * Handle API requests with Network First strategy
 * Falls back to cache if network fails
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetchWithTimeout(request, 10000);
    
    if (networkResponse.ok) {
      // Clone and cache the successful response
      const clonedResponse = networkResponse.clone();
      
      // Add timestamp to response for cache expiration
      const responseWithMetadata = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: {
          ...Object.fromEntries(clonedResponse.headers),
          'sw-cached-at': Date.now().toString()
        }
      });
      
      await cache.put(request, responseWithMetadata);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed for API, trying cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt && (Date.now() - parseInt(cachedAt)) < API_CACHE_MAX_AGE) {
        console.log('[Service Worker] Returning cached API response');
        return cachedResponse;
      }
    }
    
    // No valid cache - return offline error response
    return createOfflineResponse();
  }
}

/**
 * Handle image requests with Cache First strategy
 * Uses stale-while-revalidate pattern
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background (stale-while-revalidate)
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[Service Worker] Image fetch failed:', request.url);
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    // Revalidate in background
    fetchPromise;
    return cachedResponse;
  }

  // No cache - wait for network
  try {
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    // Network failed, return placeholder or offline image
    return getOfflineImageResponse();
  }
}

/**
 * Handle static assets with Cache First strategy
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Revalidate in background for non-hashed assets
    if (!request.url.includes('?v=') && !/[a-f0-9]{8}/.test(request.url)) {
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response);
          }
        })
        .catch(() => {});
    }
    return cachedResponse;
  }

  // Not in cache - fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the new response
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Failed to fetch static asset:', request.url);
    throw error;
  }
}

/**
 * Handle external resources (CDNs) with Cache First strategy
 */
async function handleExternalResource(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch with timeout to avoid hanging
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] External resource fetch failed:', request.url);
    // Return a minimal valid response for CSS/JS to prevent breaking the page
    if (request.url.includes('.css')) {
      return new Response('', { headers: { 'Content-Type': 'text/css' } });
    }
    if (request.url.includes('.js')) {
      return new Response('', { headers: { 'Content-Type': 'application/javascript' } });
    }
    throw error;
  }
}

/**
 * Handle navigation requests (HTML pages) with Network First strategy
 * Shows offline page when no connection
 */
async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try network first for fresh content
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      // Cache successful HTML response
      const clonedResponse = networkResponse.clone();
      await cache.put(request, clonedResponse);
      return networkResponse;
    }
    
    // Non-OK response - try cache
    throw new Error('Network response not OK');
  } catch (error) {
    console.log('[Service Worker] Navigation failed, trying cache:', request.url);
    
    // Try to get from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try to match /index.html for client-side routing
    const indexResponse = await cache.match('/index.html');
    if (indexResponse) {
      return indexResponse;
    }

    // Fall back to offline page
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }

    // Ultimate fallback
    return createOfflinePageResponse();
  }
}

// ============================================
// BACKGROUND SYNC
// ============================================

/**
 * Store a failed request for background sync
 */
async function queueRequestForSync(request, tag = SYNC_TAG) {
  try {
    const db = await openBackgroundSyncDB();
    const transaction = db.transaction([QUEUED_REQUESTS_STORE], 'readwrite');
    const store = transaction.objectStore(QUEUED_REQUESTS_STORE);

    // Clone request to serialize it
    const serializedRequest = await serializeRequest(request);

    await store.add({
      ...serializedRequest,
      tag,
      timestamp: Date.now(),
      retries: 0
    });

    // Register for background sync if supported
    if ('sync' in self.registration) {
      await self.registration.sync.register(tag);
    }

    console.log('[Service Worker] Request queued for background sync');
  } catch (error) {
    console.error('[Service Worker] Failed to queue request:', error);
  }
}

/**
 * Serialize a Request object for storage
 */
async function serializeRequest(request) {
  const body = request.method !== 'GET' ? await request.text() : null;
  
  return {
    url: request.url,
    method: request.method,
    headers: Array.from(request.headers),
    body,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer,
    integrity: request.integrity
  };
}

/**
 * Open Background Sync IndexedDB
 */
function openBackgroundSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BackgroundSyncDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Process queued requests when sync event fires
 */
async function processQueuedRequests(tag) {
  try {
    const db = await openBackgroundSyncDB();
    const transaction = db.transaction([QUEUED_REQUESTS_STORE], 'readonly');
    const store = transaction.objectStore(QUEUED_REQUESTS_STORE);
    const index = store.index('tag');

    const requests = await index.getAll(tag);

    for (const queuedRequest of requests) {
      try {
        const request = new Request(queuedRequest.url, {
          method: queuedRequest.method,
          headers: new Headers(queuedRequest.headers),
          body: queuedRequest.body,
          mode: queuedRequest.mode,
          credentials: queuedRequest.credentials,
          cache: queuedRequest.cache,
          redirect: queuedRequest.redirect,
          referrer: queuedRequest.referrer,
          integrity: queuedRequest.integrity
        });

        const response = await fetch(request);

        if (response.ok) {
          // Remove from queue on success
          const deleteTx = db.transaction([QUEUED_REQUESTS_STORE], 'readwrite');
          const deleteStore = deleteTx.objectStore(QUEUED_REQUESTS_STORE);
          await deleteStore.delete(queuedRequest.id);
          
          console.log('[Service Worker] Queued request succeeded:', queuedRequest.url);
        } else {
          // Increment retry count
          queuedRequest.retries++;
          if (queuedRequest.retries >= 3) {
            // Remove after max retries
            const deleteTx = db.transaction([QUEUED_REQUESTS_STORE], 'readwrite');
            const deleteStore = deleteTx.objectStore(QUEUED_REQUESTS_STORE);
            await deleteStore.delete(queuedRequest.id);
          }
        }
      } catch (error) {
        console.error('[Service Worker] Failed to process queued request:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error processing queued requests:', error);
  }
}

// Listen for sync events
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(processQueuedRequests(SYNC_TAG));
  }
});

// ============================================
// PUSH NOTIFICATIONS (Optional)
// ============================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image,
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      tag: data.tag || 'default',
      vibrate: data.vibrate || [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Digital Services Store',
        options
      )
    );
  } catch (error) {
    console.error('[Service Worker] Push notification error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = notificationData?.url || '/';

  // Handle action clicks
  if (event.action) {
    url = notificationData?.actionUrls?.[event.action] || url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// ============================================
// MESSAGE HANDLING (Communication with Main App)
// ============================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;

    case 'CHECK_UPDATES':
      checkForUpdates().then(hasUpdate => {
        event.ports[0].postMessage({ hasUpdate });
      });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'CACHE_URLS':
      if (payload && payload.urls) {
        cacheUrls(payload.urls).then(() => {
          event.ports[0].postMessage({ success: true });
        });
      }
      break;

    case 'SYNC_NOW':
      if ('sync' in self.registration) {
        self.registration.sync.register(SYNC_TAG);
      }
      break;

    default:
      console.log('[Service Worker] Unknown message type:', type);
  }
});

/**
 * Check if there's a new version available
 */
async function checkForUpdates() {
  try {
    const response = await fetch('/version.json', { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      return data.version !== CACHE_VERSION;
    }
  } catch (error) {
    // version.json might not exist
  }
  return false;
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[Service Worker] All caches cleared');
}

/**
 * Cache specific URLs on demand
 */
async function cacheUrls(urls) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to cache URL:', url, error);
      }
    })
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Fetch with timeout to prevent hanging
 */
function fetchWithTimeout(request, timeoutMs = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)
    )
  ]);
}

/**
 * Create an offline error response for API calls
 */
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: 'You are offline',
      message: 'Please check your internet connection and try again',
      offline: true
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

/**
 * Create a simple offline page response
 */
function createOfflinePageResponse() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Digital Services Store</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 { font-size: 2.5rem; margin-bottom: 15px; }
    p { font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9; line-height: 1.6; }
    .button {
      display: inline-block;
      padding: 15px 30px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .cached-info {
      margin-top: 30px;
      padding: 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Don't worry - any cached content is still available!</p>
    <button class="button" onclick="window.location.reload()">Try Again</button>
    <div class="cached-info">
      <strong>💡 Tip:</strong> You can still browse previously viewed products and access your cart while offline.
    </div>
  </div>
  <script>
    // Check for connection restoration
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Get a placeholder response for failed image requests
 */
function getOfflineImageResponse() {
  // Return a 1x1 transparent pixel as placeholder
  const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  
  return fetch(transparentPixel);
}

// ============================================
// PERIODIC SYNC (Optional - for background updates)
// ============================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdatesAndNotify());
  }
});

/**
 * Check for updates and notify user if available
 */
async function checkForUpdatesAndNotify() {
  const hasUpdate = await checkForUpdates();
  
  if (hasUpdate) {
    // Notify all clients about the update
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: CACHE_VERSION
      });
    });
  }
}

console.log('[Service Worker] Service Worker Loaded');
