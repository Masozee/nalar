'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { FiClock, FiMapPin, FiUsers, FiGlobe, FiFileText, FiAward } from 'react-icons/fi';

export default function About() {
  return (
    <>
      <NavBar />
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
          <Image
            src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
            alt="About CSIS"
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
              <span className="text-lg font-medium text-white">About Us</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold !text-white mb-4"
            >
              Centre for Strategic and International Studies
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-green-100 max-w-2xl"
            >
              Indonesia&apos;s premier think tank for policy research and analysis since 1971
            </motion.p>
          </div>
        </section>

        {/* About Navigation */}
        <section className="sticky top-16 z-40 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto py-4 gap-8">
              <Link href="/about" className="text-accent font-bold whitespace-nowrap border-b-2 border-accent px-1 py-2">
                Overview
              </Link>
              <Link href="/about/history" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
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

        {/* Overview Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-primary mb-6">About CSIS Indonesia</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The Centre for Strategic and International Studies (CSIS) was established in 1971 as an independent, non-profit organization 
                  dedicated to policy-oriented studies on domestic and international issues.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Our mission is to contribute to improved policy making through research, dialogue, and public debate. We believe that 
                  policy decisions should be based on careful study and comparative analysis of various policy options.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-3 rounded-full mr-4">
                      <FiClock className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">Est. 1971</h3>
                      <p className="text-gray-600">50+ years of excellence</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-3 rounded-full mr-4">
                      <FiMapPin className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">Jakarta</h3>
                      <p className="text-gray-600">Indonesia based</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-3 rounded-full mr-4">
                      <FiUsers className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">45+ Researchers</h3>
                      <p className="text-gray-600">Expert analysts</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-3 rounded-full mr-4">
                      <FiGlobe className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">Global Network</h3>
                      <p className="text-gray-600">80+ partnerships</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Image 
                  src="/csis-building.jpg" 
                  alt="CSIS Building" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-lg rounded-lg max-w-xs">
                  <p className="text-primary font-bold mb-2">Indonesia&apos;s Premier Think Tank</p>
                  <p className="text-gray-600 text-sm">Ranked among the top think tanks in Asia by the Global Go To Think Tank Index</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Research Focus */}
        
      </main>
      <Footer />
    </>
  );
}