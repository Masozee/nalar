'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { FiCheck, FiDollarSign, FiGift, FiUsers, FiTrendingUp, FiTarget } from 'react-icons/fi';

export default function Foundation() {
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
                <span className="text-lg font-medium text-white">Foundation</span>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
                CSIS Foundation
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Supporting Indonesia&apos;s future through policy research and leadership development
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
              <Link href="/about/history" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                History
              </Link>
              <Link href="/about/board-of-directors" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                Board of Directors
              </Link>
              <Link href="/about/foundation" className="text-accent font-medium whitespace-nowrap border-b-2 border-accent px-1 py-2">
                CSIS Foundation
              </Link>
              <Link href="/about/logo" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                Behind The Logo
              </Link>
            </nav>
          </div>
        </section>

        {/* Foundation Overview */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-primary mb-6">About The Foundation</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The CSIS Foundation was established in 1989 to secure the long-term financial sustainability of the 
                  Centre for Strategic and International Studies and to support its mission of providing independent 
                  policy research and analysis.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  As a non-profit entity, the Foundation manages an endowment and raises funds from a diverse range 
                  of sources, including private donations, corporate partnerships, and grants from international organizations.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  The Foundation is governed by an independent Board of Trustees that ensures all funding activities 
                  align with CSIS&apos;s mission and do not compromise the intellectual independence of its research.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Image 
                  src="/foundation-building.jpg" 
                  alt="CSIS Foundation Building" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 shadow-lg rounded-lg max-w-xs">
                  <p className="text-primary font-bold mb-2">Est. 1989</p>
                  <p className="text-gray-600 text-sm">Supporting CSIS&apos;s mission for over three decades</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Goals */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Mission & Goals</h2>
              <p className="text-lg text-gray-700">
                The CSIS Foundation is dedicated to securing the financial future of CSIS and supporting its independent research mission
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                <div className="bg-accent/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <FiTrendingUp className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Sustainable Funding</h3>
                <p className="text-gray-700">
                  Secure long-term financial stability through endowment management, fundraising, and diverse revenue streams to support CSIS operations.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                <div className="bg-accent/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <FiUsers className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Research Support</h3>
                <p className="text-gray-700">
                  Fund innovative research programs, fellowships, and capacity building initiatives to enhance CSIS&apos;s ability to address complex policy challenges.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                <div className="bg-accent/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  <FiTarget className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Independence</h3>
                <p className="text-gray-700">
                  Preserve the intellectual independence of CSIS by ensuring diverse funding sources and maintaining strict ethical guidelines for all financial relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Funding Sources */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <h2 className="text-3xl font-bold text-primary mb-6">Funding Sources</h2>
                <p className="text-lg text-gray-700 mb-8">
                  The CSIS Foundation maintains transparency about its funding sources and ensures that no single source 
                  exerts undue influence on research outcomes or organizational priorities.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full mr-4">
                      <FiDollarSign className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">Endowment</h3>
                      <p className="text-gray-600">Long-term investments that generate sustainable income.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full mr-4">
                      <FiGift className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">Private Donations</h3>
                      <p className="text-gray-600">Contributions from individuals, families, and private foundations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full mr-4">
                      <FiUsers className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-1">Corporate Partnerships</h3>
                      <p className="text-gray-600">Strategic collaborations with business entities that share our commitment to evidence-based policy.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-7">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold text-primary mb-6">Funding Distribution</h3>
                  <p className="text-gray-700 mb-8">
                    The Foundation adheres to a transparent model for allocating funds to various CSIS activities and operations:
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Research Programs</span>
                        <span className="font-bold text-accent">42%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Fellowships & Training</span>
                        <span className="font-bold text-accent">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Public Education & Events</span>
                        <span className="font-bold text-accent">18%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Administration & Operations</span>
                        <span className="font-bold text-accent">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support & Donate */}
        <section className="py-16 bg-primary/5 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Support Our Work</h2>
              <p className="text-lg text-gray-700 mb-8">
                Join us in fostering evidence-based policy solutions by supporting the CSIS Foundation
              </p>
              
              <div className="inline-flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Link href="/donate" className="bg-accent hover:bg-accent/90 text-white py-3 px-8 rounded-md font-medium text-lg transition-colors">
                  Make a Donation
                </Link>
                <Link href="/partnerships" className="bg-white hover:bg-gray-50 text-primary border border-gray-300 py-3 px-8 rounded-md font-medium text-lg transition-colors">
                  Partnership Opportunities
                </Link>
              </div>
            </div>
            
            <div className="mt-16 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-primary text-center mb-8">Why Support CSIS?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FiCheck className="text-accent text-xl mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Support independent, non-partisan research on critical policy issues facing Indonesia and the region.</p>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-accent text-xl mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Help train the next generation of policy researchers and analysts through our fellowship programs.</p>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-accent text-xl mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Contribute to informed public debate through our publications, events, and media engagement.</p>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <FiCheck className="text-accent text-xl mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Enable CSIS to address emerging issues and develop innovative policy solutions.</p>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-accent text-xl mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Join a community of supporters committed to evidence-based policy making.</p>
                    </li>
                    <li className="flex items-start">
                      <FiCheck className="text-accent text-xl mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Tax benefits available for qualifying donations (consult your tax advisor for details).</p>
                    </li>
                  </ul>
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