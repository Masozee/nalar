'use client';

import { ReactNode, memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  amount?: number; // 0-1, how much of the element needs to be in view
}

const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  direction = 'up',
  distance = 20,
  once = true,
  amount = 0.1 // Only 10% of element needs to be visible by default
}: FadeInProps) => {
  // Respect user's reduced motion settings
  const prefersReducedMotion = useReducedMotion();
  
  // Calculate animations only once
  const { initialPosition, finalPosition } = useMemo(() => {
    // If user prefers reduced motion, provide minimal animation
    if (prefersReducedMotion) {
      return {
        initialPosition: { opacity: 0 },
        finalPosition: { opacity: 1 }
      };
    }
    
    // Otherwise calculate based on direction
    let initial, final;
    
    switch (direction) {
      case 'up':
        initial = { opacity: 0, y: distance };
        final = { opacity: 1, y: 0 };
        break;
      case 'down':
        initial = { opacity: 0, y: -distance };
        final = { opacity: 1, y: 0 };
        break;
      case 'left':
        initial = { opacity: 0, x: distance };
        final = { opacity: 1, x: 0 };
        break;
      case 'right':
        initial = { opacity: 0, x: -distance };
        final = { opacity: 1, x: 0 };
        break;
      case 'none':
      default:
        initial = { opacity: 0 };
        final = { opacity: 1 };
    }
    
    return {
      initialPosition: initial,
      finalPosition: final
    };
  }, [direction, distance, prefersReducedMotion]);

  return (
    <motion.div
      className={className}
      initial={initialPosition}
      whileInView={finalPosition}
      viewport={{ 
        once, 
        amount, // How much of element needs to be in view
        margin: "0px 0px -100px 0px" // Trigger slightly before in view
      }}
      transition={{
        duration: prefersReducedMotion ? duration / 2 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// Add display name for better debugging
FadeIn.displayName = 'FadeIn';

// Memoize component to prevent unnecessary re-renders
export default memo(FadeIn); 