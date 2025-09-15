import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { useSidebar, useViewMode } from '@/store'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isOpen: sidebarOpen } = useSidebar()
  const { setMode } = useViewMode()
  const location = useLocation()

  // Update view mode based on route
  useEffect(() => {
    const path = location.pathname
    if (path === '/do-now') {
      setMode('do-now')
    } else if (path === '/calendar') {
      setMode('calendar')
    } else if (path === '/today') {
      setMode('today')
    } else if (path === '/upcoming') {
      setMode('upcoming')
    } else if (path === '/completed') {
      setMode('completed')
    } else if (path === '/high-priority') {
      setMode('high-priority')
    } else if (path === '/analytics') {
      // Analytics has its own page, no view mode needed
      return
    } else {
      setMode('all')
    }
  }, [location.pathname, setMode])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main 
          className={cn(
            "flex-1 overflow-hidden transition-all duration-300",
            // Always provide margin on desktop when sidebar is open
            "lg:ml-64",
            // On mobile, no margin needed as sidebar is overlay
            "ml-0"
          )}
        >
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
