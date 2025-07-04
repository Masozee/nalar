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

// Memoized timeline data to prevent re-creation
const timelineData = [
  {
    decade: '1970s',
    title: 'Foundation & Early Years',
    description: 'CSIS was established in 1971 and quickly gained recognition for its work on regional security and economic development. The center published its first research journals and hosted its inaugural international conference.',
    image: '/timeline-1970s.jpg',
    align: 'left'
  },
  {
    decade: '1980s', 
    title: 'Expanding Influence',
    description: 'CSIS expanded its research areas and established partnerships with international institutions. The center moved to its current headquarters and began regular publications on ASEAN regional cooperation.',
    image: '/timeline-1980s.jpg',
    align: 'right'
  }
  // Add more timeline items as needed
];

export default function History() {
  return (
    <>
      <Suspense fallback={<div className="h-20 bg-primary animate-pulse" />}>
        <NavBar />
      </Suspense>
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block bg-accent px-4 py-2 mb-4">
                <span className="text-lg font-medium text-white">Our History</span>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
                Five Decades of Excellence
              </h1>
              <p className="text-xl text-white/80 mb-8">
                The story of CSIS from its founding to the present day
              </p>
            </div>
          </div>
        </section>

        {/* About Navigation */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto py-4 gap-8">
              <Link href="/about" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                Overview
              </Link>
              <Link href="/about/history" className="text-accent font-medium whitespace-nowrap border-b-2 border-accent px-1 py-2">
                History
              </Link>
              <Link href="/about/board-of-directors" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                Board of Directors
              </Link>
              <Link href="/about/foundation" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                CSIS Foundation
              </Link>
              <Link href="/about/logo" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
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

        {/* Timeline Section - Optimized */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Timeline: Our Journey</h2>
              <p className="text-lg text-gray-700">
                Five decades of growth, innovation, and impact in policy research
              </p>
            </div>
            
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20"></div>
              
              {/* Timeline Items - Optimized with mapped data */}
              <div className="space-y-16">
                {timelineData.map((item, index) => (
                  <div key={item.decade} className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-3">
                      <div className="h-6 w-6 bg-primary rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {item.align === 'left' ? (
                        <>
                          <motion.div 
                            {...slideInLeftVariants}
                            className="md:text-right md:pr-12"
                          >
                            <h3 className="text-2xl font-bold text-primary mb-2">{item.decade}</h3>
                            <h4 className="text-lg font-medium text-gray-900 mb-3">{item.title}</h4>
                            <p className="text-gray-700">{item.description}</p>
                          </motion.div>
                          
                          <div className="md:pl-12">
                            <Image 
                              src={item.image}
                              alt={`CSIS in the ${item.decade}`}
                              width={400}
                              height={250}
                              className="rounded-lg shadow-md"
                              loading="lazy"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="md:pr-12 order-2 md:order-1">
                            <Image 
                              src={item.image}
                              alt={`CSIS in the ${item.decade}`}
                              width={400}
                              height={250}
                              className="rounded-lg shadow-md"
                              loading="lazy"
                            />
                          </div>
                          
                          <motion.div 
                            {...slideInRightVariants}
                            className="md:pl-12 order-1 md:order-2"
                          >
                            <h3 className="text-2xl font-bold text-primary mb-2">{item.decade}</h3>
                            <h4 className="text-lg font-medium text-gray-900 mb-3">{item.title}</h4>
                            <p className="text-gray-700">{item.description}</p>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Leadership Legacy */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Leadership Legacy</h2>
              <p className="text-lg text-gray-700">
                The visionaries who guided CSIS through five decades
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="aspect-w-3 aspect-h-4 relative h-64">
                  <Image 
                    src="/leadership-1.jpg" 
                    alt="Harry Tjan Silalahi" 
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-1">Harry Tjan Silalahi</h3>
                  <p className="text-gray-500 mb-4">Co-founder, 1971-1989</p>
                  <p className="text-gray-700">
                    A visionary co-founder who established CSIS with a mission to develop policy-oriented research for Indonesia&apos;s development.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="aspect-w-3 aspect-h-4 relative h-64">
                  <Image 
                    src="/leadership-2.jpg" 
                    alt="Jusuf Wanandi" 
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-1">Jusuf Wanandi</h3>
                  <p className="text-gray-500 mb-4">Co-founder, 1971-2005</p>
                  <p className="text-gray-700">
                    Co-founded CSIS and guided its development into a premier think tank focusing on international relations and security.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="aspect-w-3 aspect-h-4 relative h-64">
                  <Image 
                    src="/leadership-3.jpg" 
                    alt="Hadi Soesastro" 
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-1">Hadi Soesastro</h3>
                  <p className="text-gray-500 mb-4">Executive Director, 1989-2010</p>
                  <p className="text-gray-700">
                    Led CSIS through a period of significant growth and established its reputation for excellence in economic policy research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 