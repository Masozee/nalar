'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <div className="h-20 bg-primary animate-pulse" />,
  ssr: false
});

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
  ssr: false
});

// Optimize animation variants (reduce re-renders)
const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const slideInLeftVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};

const slideInRightVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};


export default function History() {
  return (
    <>
      <Suspense fallback={<div className="h-20 bg-primary animate-pulse" />}>
        <NavBar />
      </Suspense>
      
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
          <Image
            src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
            alt="CSIS History"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
            priority
          />
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-accent px-4 py-2 mb-4 w-fit"
            >
              <span className="text-lg font-medium text-white">Our History</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold !text-white mb-4"
            >
              Five Decades of Excellence
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-green-100 max-w-2xl"
            >
              The story of CSIS from its founding to the present day
            </motion.p>
          </div>
        </section>

        {/* About Navigation */}
        <section className="sticky top-16 z-40 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto py-4 gap-8">
              <Link href="/about" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                Overview
              </Link>
              <Link href="/about/history" className="text-accent font-bold whitespace-nowrap border-b-2 border-accent px-1 py-2">
                History
              </Link>
              <Link href="/about/board-of-directors" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                Board of Directors
              </Link>
              <Link href="/about/foundation" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                CSIS Foundation
              </Link>
              <Link href="/about/logo" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                Behind The Logo
              </Link>
            </nav>
          </div>
        </section>

        {/* Founding Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div {...fadeInVariants}>
                <h2 className="text-3xl font-bold text-primary mb-6">The Beginnings</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The Centre for Strategic and International Studies (CSIS) was established in 1971 by Harry Tjan Silalahi and Jusuf Wanandi, 
                  with the support of Ali Moertopo, as an independent non-profit organization focusing on policy-oriented studies on domestic 
                  and international issues. 
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Founded during a pivotal time in Indonesia&apos;s development, CSIS emerged as one of Southeast Asia&apos;s first think tanks 
                  with the mission to contribute to policy making through rigorous research and analysis.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  The founders envisioned CSIS as a forum for scholars, government officials, business leaders, and civil society to 
                  discuss and formulate strategic recommendations for national development and international relations.
                </p>
                <p className="text-gray-600 mb-6">
                  Since its founding in 1971, CSIS has played a pivotal role in shaping Indonesia&apos;s policy landscape and contributing to the nation&apos;s development.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Image 
                  src="/founders.jpg" 
                  alt="CSIS Founders" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  priority={false}
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-accent text-white py-2 px-4 rounded-lg">
                  <span className="font-medium">Est. 1971</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 