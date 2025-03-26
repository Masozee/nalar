'use client';

import Hero from "@/components/Hero";
import Publications from "@/components/Publications";
import News from "@/components/News";
import Events from "@/components/Events";
import Podcasts from "@/components/Podcasts";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import FadeIn from "@/components/animations/FadeIn";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <div className="pt-20">
          <FadeIn>
            <Publications />
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <News />
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <Events />
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <Podcasts />
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <Dashboard />
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
