'use client'

import { motion } from 'framer-motion'

const EASE = [0.32, 0.72, 0, 1] as const
const VIEWPORT = { once: true, margin: '0px' }

export function MotionReveal({
  children,
  delay = 0,
  className,
  from = 'bottom',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  from?: 'bottom' | 'left' | 'right' | 'scale'
}) {
  const variants = {
    bottom: { hidden: { opacity: 0, y: 52, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } },
    left:   { hidden: { opacity: 0, x: -52, scale: 0.95 }, show: { opacity: 1, x: 0, scale: 1 } },
    right:  { hidden: { opacity: 0, x: 52, scale: 0.95 },  show: { opacity: 1, x: 0, scale: 1 } },
    scale:  { hidden: { opacity: 0, scale: 0.78 },          show: { opacity: 1, scale: 1 } },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variants[from]}
      transition={{ duration: 0.68, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionStagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 44, scale: 0.92 },
        show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.62, ease: EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SpringPop({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}
