import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  searchTime: number
  renderTime: number
  totalJobs: number
  loadTime: number
}

export const usePerformance = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    searchTime: 0,
    renderTime: 0,
    totalJobs: 0,
    loadTime: 0
  })

  const startTimer = useCallback((operation: string) => {
    const startTime = performance.now()
    return {
      end: () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        switch (operation) {
          case 'search':
            metricsRef.current.searchTime = duration
            break
          case 'render':
            metricsRef.current.renderTime = duration
            break
          case 'load':
            metricsRef.current.loadTime = duration
            break
        }
        
        // Log slow operations in development
        if (process.env.NODE_ENV === 'development' && duration > 100) {
          console.warn(`🐌 Slow ${operation}: ${duration.toFixed(2)}ms`)
        }
        
        return duration
      }
    }
  }, [])

  const updateJobCount = useCallback((count: number) => {
    metricsRef.current.totalJobs = count
  }, [])

  const logMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:', {
        searchTime: `${metricsRef.current.searchTime.toFixed(2)}ms`,
        renderTime: `${metricsRef.current.renderTime.toFixed(2)}ms`,
        loadTime: `${metricsRef.current.loadTime.toFixed(2)}ms`,
        totalJobs: metricsRef.current.totalJobs,
        jobsPerSecond: metricsRef.current.totalJobs / (metricsRef.current.searchTime / 1000)
      })
    }
  }, [])

  // Monitor Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const measureCLS = () => {
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Type assertion for layout shift entries
              const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
              if (entry.entryType === 'layout-shift' && !layoutShift.hadRecentInput) {
                console.log('📐 Layout Shift Score:', layoutShift.value)
              }
            }
          }).observe({ type: 'layout-shift', buffered: true })
        } catch {
          // Layout shift observation not supported
        }
      }

      if ('requestIdleCallback' in window) {
        requestIdleCallback(measureCLS)
      } else {
        setTimeout(measureCLS, 100)
      }
    }
  }, [])

  return {
    startTimer,
    updateJobCount,
    logMetrics,
    metrics: metricsRef.current
  }
}