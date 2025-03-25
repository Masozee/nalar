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
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block bg-accent px-4 py-2 mb-4">
                <span className="text-lg font-medium text-white">About Us</span>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
                Centre for Strategic and International Studies
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Indonesia&apos;s premier think tank for policy research and analysis since 1971
              </p>
            </div>
          </div>
        </section>

        {/* About Navigation */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto py-4 gap-8">
              <Link href="/about" className="text-accent font-medium whitespace-nowrap border-b-2 border-accent px-1 py-2">
                Overview
              </Link>
              <Link href="/about/history" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
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
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Our Mission & Research Focus</h2>
              <p className="text-lg text-gray-700">
                CSIS is committed to providing policy analysis and recommendations to improve public policy making through rigorous research and analysis
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FiGlobe className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">International Relations</h3>
                <p className="text-gray-700">
                  Analyzing geopolitical dynamics, regional cooperation, and Indonesia&apos;s foreign policy to strengthen the nation&apos;s position in the global community.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FiFileText className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Economics</h3>
                <p className="text-gray-700">
                  Researching economic policies, trade relations, and development strategies to promote sustainable and inclusive growth in Indonesia.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FiUsers className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Politics & Governance</h3>
                <p className="text-gray-700">
                  Examining political institutions, democratic processes, and governance issues to enhance political stability and accountability.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FiAward className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Security Studies</h3>
                <p className="text-gray-700">
                  Studying traditional and non-traditional security challenges, defense policy, and regional security architecture.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FiFileText className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Social Development</h3>
                <p className="text-gray-700">
                  Investigating social policies, education, healthcare, and demographic trends to address societal challenges and improve welfare.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <FiGlobe className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Climate & Environment</h3>
                <p className="text-gray-700">
                  Assessing environmental policies, climate change impacts, and sustainable development strategies for Indonesia&apos;s future.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 