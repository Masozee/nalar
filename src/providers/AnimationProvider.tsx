'use client';

import { ReactNode } from 'react';
import AnimationLayout from '@/components/AnimationLayout';

interface AnimationProviderProps {
  children: ReactNode;
}

export default function AnimationProvider({ children }: AnimationProviderProps) {
  return <AnimationLayout>{children}</AnimationLayout>;
} 