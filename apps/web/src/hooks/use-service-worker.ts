import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  isUpdating: boolean
  hasUpdate: boolean
  registration: ServiceWorkerRegistration | null
}

export function useServiceWorker() {
  const { toast } = useToast()
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    hasUpdate: false,
    registration: null,
  })

  useEffect(() => {
    if (!status.isSupported) {
      console.log('❌ Service Worker not supported')
      return
    }

    registerServiceWorker()
  }, [status.isSupported])

  const registerServiceWorker = async () => {
    try {
      console.log('📦 Registering Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setStatus(prev => ({
        ...prev,
        isRegistered: true,
        registration
      }))

      console.log('✅ Service Worker registered:', registration.scope)

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found')
        setStatus(prev => ({ ...prev, isUpdating: true }))

        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🎉 Service Worker update ready')
              setStatus(prev => ({
                ...prev,
                isUpdating: false,
                hasUpdate: true
              }))

              toast({
                title: "App update available",
                description: "A new version is ready. Refresh to update.",
                action: (
                  <button
                    onClick={applyUpdate}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
                  >
                    Update
                  </button>
                ),
              })
            }
          })
        }
      })

      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, timestamp } = event.data

        switch (type) {
          case 'SYNC_COMPLETE':
            toast({
              title: "Sync completed",
              description: "Your offline changes have been synchronized.",
            })
            break
          default:
            console.log('Unknown SW message:', type)
        }
      })

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      setStatus(prev => ({ ...prev, isRegistered: false }))
    }
  }

  const applyUpdate = () => {
    if (status.registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      status.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Listen for the controlling worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }

  const clearCache = async () => {
    if (status.registration) {
      status.registration.active?.postMessage({ type: 'CLEAR_CACHE' })
      
      toast({
        title: "Cache cleared",
        description: "Application cache has been cleared.",
      })
    }
  }

  const updateCache = async (urls: string[]) => {
    if (status.registration) {
      status.registration.active?.postMessage({ 
        type: 'UPDATE_CACHE', 
        payload: urls 
      })
    }
  }

  const requestBackgroundSync = async (tag: string) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)
        console.log('🔄 Background sync registered:', tag)
      } catch (error) {
        console.error('❌ Background sync registration failed:', error)
      }
    }
  }

  return {
    ...status,
    applyUpdate,
    clearCache,
    updateCache,
    requestBackgroundSync,
  }
}

// Hook for offline detection
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Back online')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📴 Gone offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, isOffline: !isOnline }
}

// Hook for network speed detection
export function useNetworkSpeed() {
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown')

  useEffect(() => {
    // @ts-ignore - navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (connection) {
      const updateNetworkSpeed = () => {
        const { effectiveType, downlink } = connection
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
          setNetworkSpeed('slow')
        } else {
          setNetworkSpeed('fast')
        }
      }

      updateNetworkSpeed()
      connection.addEventListener('change', updateNetworkSpeed)

      return () => {
        connection.removeEventListener('change', updateNetworkSpeed)
      }
    }
  }, [])

  return networkSpeed
}
