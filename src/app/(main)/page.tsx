'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FadeIn from "@/components/animations/FadeIn";

// Dynamically import components for code splitting
const FeaturedHotTopics = dynamic(() => import("@/components/FeaturedHotTopics"), {
  loading: () => <div className="h-40 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

const Publications = dynamic(() => import("@/components/Publications"), {
  loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

const Events = dynamic(() => import("@/components/Events"), {
  loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

const Podcasts = dynamic(() => import("@/components/Podcasts"), {
  loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

const ExpertFeatures = dynamic(() => import("@/components/ExpertFeatures"), {
  loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  loading: () => <div className="h-72 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <div className="pt-20">
          <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn>
              <FeaturedHotTopics />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.05}>
              <Publications />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.1}>
              <Events />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.15}>
              <Podcasts />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.2}>
              <ExpertFeatures />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-72 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.25}>
              <Dashboard />
            </FadeIn>
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
