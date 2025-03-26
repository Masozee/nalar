'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
  color?: string;
  height?: number;
  zIndex?: number;
}

export default function ScrollProgress({
  color = '#0B5345',
  height = 4,
  zIndex = 100
}: ScrollProgressProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      // Show progress bar only after scrolling down a bit
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0"
      style={{
        height,
        backgroundColor: color,
        transformOrigin: '0%',
        scaleX,
        zIndex
      }}
    />
  );
} 