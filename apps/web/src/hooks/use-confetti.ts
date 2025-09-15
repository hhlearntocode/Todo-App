import { useCallback } from 'react'

export function useConfetti() {
  const triggerConfetti = useCallback(() => {
    // Create confetti elements
    const confettiContainer = document.createElement('div')
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden'
    confettiContainer.style.position = 'fixed'
    confettiContainer.style.top = '0'
    confettiContainer.style.left = '0'
    confettiContainer.style.width = '100%'
    confettiContainer.style.height = '100%'
    confettiContainer.style.pointerEvents = 'none'
    confettiContainer.style.zIndex = '9999'

    // Create confetti pieces
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
    
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div')
      confetti.style.position = 'absolute'
      confetti.style.width = '8px'
      confetti.style.height = '8px'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.borderRadius = '50%'
      confetti.style.animationName = 'confetti'
      confetti.style.animationDuration = `${0.8 + Math.random() * 0.4}s`
      confetti.style.animationDelay = `${Math.random() * 0.3}s`
      confetti.style.animationTimingFunction = 'linear'
      confetti.style.animationFillMode = 'forwards'
      
      confettiContainer.appendChild(confetti)
    }

    document.body.appendChild(confettiContainer)

    // Remove confetti after animation
    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer)
      }
    }, 1500)
  }, [])

  return { triggerConfetti }
}
