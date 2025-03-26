'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
}

export default function StaggerContainer({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.1,
  direction = 'up',
  distance = 20,
  once = true
}: StaggerContainerProps) {
  // Define the initial animation state based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
        return {};
      default:
        return { y: distance };
    }
  };

  // The container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerDelay
      }
    }
  };

  // The individual children animations
  const itemVariants = {
    hidden: { 
      opacity: 0,
      ...getInitialPosition()
    },
    visible: {
      opacity: 1,
      ...(direction === 'up' || direction === 'down' ? { y: 0 } : {}),
      ...(direction === 'left' || direction === 'right' ? { x: 0 } : {}),
      transition: {
        ease: [0.22, 1, 0.36, 1],
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  );
} 