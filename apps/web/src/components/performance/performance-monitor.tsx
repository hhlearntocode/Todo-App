import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Eye, EyeOff } from 'lucide-react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  taskCount: number
  fps: number
  domNodes: number
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    taskCount: 0,
    fps: 0,
    domNodes: 0,
  })
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const renderStartRef = useRef(0)

  useEffect(() => {
    if (!isVisible) return

    let animationFrameId: number
    
    const updateMetrics = () => {
      const now = performance.now()
      frameCountRef.current++
      
      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current))
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory ? 
            Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
          domNodes: document.querySelectorAll('*').length,
          taskCount: document.querySelectorAll('[data-task-item]').length,
        }))
        
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
      
      animationFrameId = requestAnimationFrame(updateMetrics)
    }

    updateMetrics()
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isVisible])

  // Measure render time
  useEffect(() => {
    renderStartRef.current = performance.now()
    
    const measureRenderTime = () => {
      const renderTime = performance.now() - renderStartRef.current
      setMetrics(prev => ({ ...prev, renderTime: Math.round(renderTime * 100) / 100 }))
    }
    
    // Use setTimeout to measure after render
    setTimeout(measureRenderTime, 0)
  })

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 bg-background/95 backdrop-blur border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance
        </h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6"
        >
          <EyeOff className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">FPS:</span>
          <Badge 
            variant={metrics.fps >= 50 ? "default" : metrics.fps >= 30 ? "secondary" : "destructive"}
            className="h-5"
          >
            {metrics.fps}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Render:</span>
          <Badge 
            variant={metrics.renderTime <= 16 ? "default" : metrics.renderTime <= 32 ? "secondary" : "destructive"}
            className="h-5"
          >
            {metrics.renderTime}ms
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Memory:</span>
          <Badge 
            variant={metrics.memoryUsage <= 50 ? "default" : metrics.memoryUsage <= 100 ? "secondary" : "destructive"}
            className="h-5"
          >
            {metrics.memoryUsage}MB
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tasks:</span>
          <Badge variant="outline" className="h-5">
            {metrics.taskCount}
          </Badge>
        </div>
        
        <div className="flex justify-between col-span-2">
          <span className="text-muted-foreground">DOM Nodes:</span>
          <Badge 
            variant={metrics.domNodes <= 1000 ? "default" : metrics.domNodes <= 2000 ? "secondary" : "destructive"}
            className="h-5"
          >
            {metrics.domNodes}
          </Badge>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-medium ${
            metrics.fps >= 50 && metrics.renderTime <= 16 && metrics.memoryUsage <= 50
              ? 'text-green-600' 
              : metrics.fps >= 30 && metrics.renderTime <= 32 && metrics.memoryUsage <= 100
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}>
            {metrics.fps >= 50 && metrics.renderTime <= 16 && metrics.memoryUsage <= 50
              ? 'Excellent' 
              : metrics.fps >= 30 && metrics.renderTime <= 32 && metrics.memoryUsage <= 100
              ? 'Good'
              : 'Needs Optimization'}
          </span>
        </div>
      </div>
    </Card>
  )
}

// Hook to measure component render time
export function useRenderTime(componentName: string) {
  const renderStartRef = useRef<number>()
  
  useEffect(() => {
    renderStartRef.current = performance.now()
  })
  
  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}

// Hook to detect memory leaks
export function useMemoryMonitor() {
  useEffect(() => {
    if (!(performance as any).memory) return
    
    const checkMemoryUsage = () => {
      const memoryInfo = (performance as any).memory
      const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024
      const totalMB = memoryInfo.totalJSHeapSize / 1024 / 1024
      
      if (usedMB > 100) {
        console.warn('⚠️ High memory usage detected:', usedMB.toFixed(2), 'MB')
      }
      
      if (usedMB / totalMB > 0.9) {
        console.warn('⚠️ Memory usage is getting critical:', (usedMB / totalMB * 100).toFixed(1), '%')
      }
    }
    
    const interval = setInterval(checkMemoryUsage, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [])
}
