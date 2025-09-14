import { Link, useLocation } from 'react-router-dom'
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Tag,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSidebar, useViewMode } from '@/store'
import { cn, getTagColor } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { tagsApi } from '@/lib/api'

interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  count?: number
  isActive?: boolean
  onClick?: () => void
}

function SidebarItem({ to, icon, label, count, isActive, onClick }: SidebarItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="h-5 text-xs">
          {count}
        </Badge>
      )}
    </Link>
  )
}

export function Sidebar() {
  const { isOpen, setOpen } = useSidebar()
  const { mode } = useViewMode()
  const location = useLocation()

  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  })

  const tags = tagsResponse?.data || []

  const handleItemClick = () => {
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 1024) {
      setOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Close button (mobile only) */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <nav className="space-y-1">
              {/* Main views */}
              <div className="space-y-1">
                <SidebarItem
                  to="/"
                  icon={<Calendar className="h-4 w-4" />}
                  label="All Tasks"
                  isActive={location.pathname === '/' || mode === 'all'}
                  onClick={handleItemClick}
                />
                <SidebarItem
                  to="/today"
                  icon={<Clock className="h-4 w-4" />}
                  label="Today"
                  isActive={location.pathname === '/today' || mode === 'today'}
                  onClick={handleItemClick}
                />
                <SidebarItem
                  to="/upcoming"
                  icon={<Calendar className="h-4 w-4" />}
                  label="Upcoming"
                  isActive={location.pathname === '/upcoming' || mode === 'upcoming'}
                  onClick={handleItemClick}
                />
                <SidebarItem
                  to="/completed"
                  icon={<CheckSquare className="h-4 w-4" />}
                  label="Completed"
                  isActive={location.pathname === '/completed' || mode === 'completed'}
                  onClick={handleItemClick}
                />
                <SidebarItem
                  to="/high-priority"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="High Priority"
                  isActive={location.pathname === '/high-priority' || mode === 'high-priority'}
                  onClick={handleItemClick}
                />
              </div>

              {/* Tags section */}
              {tags.length > 0 && (
                <div className="pt-4">
                  <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h3>
                  <div className="space-y-1">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Tag className="h-4 w-4" />
                        <span className="flex-1">{tag.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("h-5 text-xs", getTagColor(tag.color))}
                          >
                            {tag.taskCount || 0}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p>Todo App v1.0.0</p>
              <p>Built with React & TypeScript</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
