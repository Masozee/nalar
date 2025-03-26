'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HoverEffectProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  rotate?: number;
  translateY?: number;
  brightness?: number;
  shadow?: boolean;
  duration?: number;
}

export default function HoverEffect({
  children,
  className = '',
  scale = 1.02,
  rotate = 0,
  translateY = 0,
  brightness = 1,
  shadow = false,
  duration = 0.2
}: HoverEffectProps) {
  return (
    <motion.div
      className={`${className} ${shadow ? 'hover:shadow-lg' : ''}`}
      whileHover={{
        scale,
        rotate,
        y: translateY,
        filter: `brightness(${brightness})`,
        transition: { duration }
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      {children}
    </motion.div>
  );
} 