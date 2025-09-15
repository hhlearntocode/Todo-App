import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Ctrl', 'N'], description: 'Create new task' },
        { keys: ['S'], description: 'Toggle bulk selection mode' },
        { keys: ['Esc'], description: 'Exit bulk selection mode' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
      ]
    },
    {
      category: 'Bulk Actions',
      items: [
        { keys: ['Ctrl', 'A'], description: 'Select all tasks (in bulk mode)' },
        { keys: ['Enter'], description: 'Mark selected tasks as complete' },
        { keys: ['Delete'], description: 'Delete selected tasks' },
      ]
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['↑', '↓'], description: 'Navigate between tasks' },
        { keys: ['Space'], description: 'Toggle task completion' },
      ]
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((category, index) => (
            <div key={category.category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category.category}
              </h3>
              
              <div className="space-y-2">
                {category.items.map((shortcut, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center">
                          <Badge variant="outline" className="text-xs px-2 py-1 font-mono">
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {index < shortcuts.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Press <Badge variant="outline" className="text-xs px-1">?</Badge> anytime to open this help
        </div>
      </DialogContent>
    </Dialog>
  )
}
