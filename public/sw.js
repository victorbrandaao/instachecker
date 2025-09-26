const CACHE_NAME = "instachecker-v3";
const STATIC_CACHE = "instachecker-static-v3";
const DYNAMIC_CACHE = "instachecker-dynamic-v3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app-v3-tailwind.js",
  "./app-v2-enhancements.js",
  "./styles-v3-tailwind.css",
  "./manifest.webmanifest",
  "./assets/instachecker-icon.svg",
];

const RUNTIME_ASSETS = [
  "https://cdn.tailwindcss.com/tailwind.min.js",
  "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("SW: Installing v3.0");
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);
        await staticCache.addAll(CORE_ASSETS);

        // Pre-cache runtime assets
        const dynamicCache = await caches.open(DYNAMIC_CACHE);
        for (const asset of RUNTIME_ASSETS) {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await dynamicCache.put(asset, response);
            }
          } catch (e) {
            console.warn(`SW: Failed to pre-cache ${asset}:`, e);
          }
        }

        self.skipWaiting();
        console.log("SW: Installation complete");
      } catch (error) {
        console.error("SW: Installation failed:", error);
      }
    })()
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("SW: Activating v3.0");
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];

      await Promise.all(
        cacheNames
          .filter((cacheName) => !validCaches.includes(cacheName))
          .map((cacheName) => {
            console.log(`SW: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );

      await self.clients.claim();
      console.log("SW: Activation complete");
    })()
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // For core app files, try cache first
    if (isAppRequest(request)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // For external resources, try network first
    if (isExternalResource(request)) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (e) {
        console.warn(`SW: Network failed for ${request.url}`);
      }

      // Fallback to cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Default strategy: network first, then cache
    try {
      const networkResponse = await fetch(request);

      // Cache successful responses
      if (networkResponse.ok && request.method === "GET") {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    } catch (e) {
      // Network failed, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Return offline page for navigation requests
      if (request.mode === "navigate") {
        return caches.match("./index.html");
      }

      throw e;
    }
  } catch (error) {
    console.error(`SW: Fetch failed for ${request.url}:`, error);
    return new Response("Network error occurred", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

function isAppRequest(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin;
}

function isExternalResource(request) {
  const url = new URL(request.url);
  return (
    url.origin !== self.location.origin &&
    (url.hostname.includes("cdn.") ||
      url.hostname.includes("googleapis.com") ||
      url.hostname.includes("jsdelivr.net") ||
      url.hostname.includes("cdnjs.cloudflare.com"))
  );
}

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("SW: Background sync triggered:", event.tag);
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log("SW: Performing background sync");
  // Add any background tasks here
}

// Handle push notifications (future feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: "./assets/instachecker-icon.svg",
      badge: "./assets/instachecker-icon.svg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(
      self.registration.showNotification("InstaChecker", options)
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(self.clients.openWindow("./"));
});
