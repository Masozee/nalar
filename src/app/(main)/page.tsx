'use client';

import Hero from "@/components/Hero";
import Publications from "@/components/Publications";
import Events from "@/components/Events";
import Podcasts from "@/components/Podcasts";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import FadeIn from "@/components/animations/FadeIn";
import FeaturedHotTopics from "@/components/FeaturedHotTopics";
import ExpertFeatures from "@/components/ExpertFeatures";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <div className="pt-20">
          <FadeIn>
            <FeaturedHotTopics />
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <Publications />
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <Events />
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <Podcasts />
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <ExpertFeatures />
          </FadeIn>
          
          <FadeIn delay={0.5}>
            <Dashboard />
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
