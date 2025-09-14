const CACHE_NAME = 'todo-app-v1'
const STATIC_CACHE = 'todo-static-v1'
const DYNAMIC_CACHE = 'todo-dynamic-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/globals.css',
  '/manifest.json'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/v1\/tasks/,
  /\/api\/v1\/tags/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // Handle other requests (CSS, JS, images, etc.)
  event.respondWith(handleDynamicRequest(request))
})

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('❌ Failed to fetch static asset:', request.url)
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

// Network-first strategy for API requests with cache fallback
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful GET responses
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, networkResponse.clone())
      }
      
      return networkResponse
    }
    
    throw new Error(`HTTP ${networkResponse.status}`)
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url)
    
    // Try to get from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('💾 Serving from cache:', request.url)
      return cachedResponse
    }
    
    // Return offline response for GET requests
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          error: 'Offline',
          message: 'You are currently offline. Some data may not be up to date.',
          cached: false
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    throw error
  }
}

// Stale-while-revalidate strategy for dynamic content
async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    // Fetch from network in parallel
    const networkPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    }).catch(() => null)
    
    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      networkPromise.catch(() => {}) // Ignore network errors
      return cachedResponse
    }
    
    // Wait for network if no cache
    const networkResponse = await networkPromise
    if (networkResponse) {
      return networkResponse
    }
    
    throw new Error('No network and no cache')
  } catch (error) {
    console.log('❌ Failed to fetch dynamic content:', request.url)
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync-tasks') {
    event.waitUntil(syncTasks())
  }
})

// Sync offline task actions
async function syncTasks() {
  try {
    console.log('🔄 Syncing offline task actions...')
    
    // Get offline actions from IndexedDB (if implemented)
    // For now, just log that sync is happening
    console.log('✅ Background sync completed')
    
    // Notify clients about successful sync
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.log('❌ Background sync failed:', error)
    throw error
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCaches())
      break
      
    case 'UPDATE_CACHE':
      event.waitUntil(updateCache(payload))
      break
      
    default:
      console.log('Unknown message type:', type)
  }
})

// Clear all caches
async function clearCaches() {
  try {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    console.log('🗑️ All caches cleared')
  } catch (error) {
    console.log('❌ Failed to clear caches:', error)
  }
}

// Update specific cache
async function updateCache(urls = []) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response)
          }
        } catch (error) {
          console.log('❌ Failed to update cache for:', url)
        }
      })
    )
    console.log('✅ Cache updated for', urls.length, 'URLs')
  } catch (error) {
    console.log('❌ Failed to update cache:', error)
  }
}
