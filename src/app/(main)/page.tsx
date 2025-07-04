'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FadeIn from "@/components/animations/FadeIn";
import { HomepageProvider } from "@/contexts/HomepageContext";

// Dynamically import components for code splitting
const TheLatest = dynamic(() => import("@/components/TheLatest"), {
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

const CSISOnNews = dynamic(() => import("@/components/CSISOnNews"), {
  loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  loading: () => <div className="h-72 animate-pulse bg-gray-100 rounded-lg"></div>,
  ssr: true
});

export default function Home() {
  return (
    <HomepageProvider>
      <main className="homepage">
        <Hero />
        <div className="pt-20">
          <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn>
              <TheLatest />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.05}>
              <Events />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.1}>
              <Podcasts />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.15}>
              <Publications />
            </FadeIn>
          </Suspense>
          
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg"></div>}>
            <FadeIn delay={0.2}>
              <CSISOnNews />
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
    </HomepageProvider>
  );
}
