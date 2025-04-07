'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function Logo() {
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
                <span className="text-lg font-medium text-white">Our Identity</span>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
                Behind The Logo
              </h1>
              <p className="text-xl text-white/80 mb-8">
                The story and symbolism behind CSIS Indonesia&apos;s visual identity
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
              <Link href="/about/foundation" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                CSIS Foundation
              </Link>
              <Link href="/about/logo" className="text-accent font-medium whitespace-nowrap border-b-2 border-accent px-1 py-2">
                Behind The Logo
              </Link>
            </nav>
          </div>
        </section>

        {/* Logo Overview */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:order-2"
              >
                <h2 className="text-3xl font-bold text-primary mb-6">Our Visual Identity</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The CSIS logo represents our mission, values, and strategic outlook as Indonesia&apos;s premier 
                  think tank for policy research and analysis. Designed with purpose, each element of 
                  our visual identity conveys important aspects of our organization.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Since our founding in 1971, our logo has evolved while maintaining its core symbolism of 
                  knowledge, global perspective, and analytical rigor. The current logo was redesigned in 2010 
                  to reflect our contemporary approach while honoring our heritage.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  The logo serves as a visual signature of CSIS&apos;s commitment to independent thought, 
                  evidence-based analysis, and Indonesia&apos;s place in the global community.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center lg:order-1"
              >
                <div className="bg-white p-12 rounded-full shadow-lg">
                  <Image 
                    src="/csis-logo-large.png" 
                    alt="CSIS Logo" 
                    width={400}
                    height={400}
                    className="h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logo Elements */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Elements & Symbolism</h2>
              <p className="text-lg text-gray-700">
                Discover the meaning behind each component of the CSIS logo
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="mb-6 flex justify-center">
                  <div className="bg-primary/5 p-6 rounded-full">
                    <Image 
                      src="/logo-globe.png" 
                      alt="Globe Element" 
                      width={120}
                      height={120}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 text-center">The Globe</h3>
                <p className="text-gray-700">
                  The stylized globe in our logo represents CSIS&apos;s global perspective and international outlook. 
                  It symbolizes our commitment to understanding Indonesia&apos;s place in the world and analyzing 
                  global trends that impact our region.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="mb-6 flex justify-center">
                  <div className="bg-primary/5 p-6 rounded-full">
                    <Image 
                      src="/logo-book.png" 
                      alt="Book Element" 
                      width={120}
                      height={120}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 text-center">The Open Book</h3>
                <p className="text-gray-700">
                  The open book element symbolizes knowledge, research, and academic rigor. It represents our 
                  commitment to scholarly excellence and continuous learning as we develop evidence-based 
                  policy recommendations.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="mb-6 flex justify-center">
                  <div className="bg-primary/5 p-6 rounded-full">
                    <Image 
                      src="/logo-colors.png" 
                      alt="Color Palette" 
                      width={120}
                      height={120}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 text-center">The Colors</h3>
                <p className="text-gray-700">
                  Our primary blue represents trust, stability, and depth of analysis. The accent colors 
                  symbolize Indonesia&apos;s diverse perspectives and CSIS&apos;s multidisciplinary approach to 
                  policy research across various fields.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logo Evolution */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Logo Evolution</h2>
              <p className="text-lg text-gray-700">
                The transformation of the CSIS visual identity through five decades
              </p>
            </div>
            
            <div className="space-y-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <Image 
                    src="/logo-1971.png" 
                    alt="CSIS Logo 1971" 
                    width={300}
                    height={300}
                    className="max-w-full h-auto"
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block bg-accent text-white text-sm font-medium px-3 py-1 rounded mb-4">1971-1989</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">The Original Identity</h3>
                  <p className="text-gray-700 mb-4">
                    The first CSIS logo featured a traditional design with an open book and globe motif, 
                    reflecting the organization&apos;s focus on knowledge and international affairs. The typography 
                    was formal and institutional, in keeping with the academic nature of the organization.
                  </p>
                  <p className="text-gray-700">
                    This logo established CSIS as a serious academic institution during its formative years 
                    and helped build credibility with government officials, academics, and policy experts.
                  </p>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center md:order-2"
                >
                  <Image 
                    src="/logo-1990.png" 
                    alt="CSIS Logo 1990" 
                    width={300}
                    height={300}
                    className="max-w-full h-auto"
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="md:order-1"
                >
                  <div className="inline-block bg-accent text-white text-sm font-medium px-3 py-1 rounded mb-4">1990-2009</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Modernization Era</h3>
                  <p className="text-gray-700 mb-4">
                    In 1990, CSIS updated its logo with a more streamlined design that maintained the 
                    essential elements while adding a contemporary touch. The typography was updated to 
                    reflect changing design trends, and the color palette was expanded.
                  </p>
                  <p className="text-gray-700">
                    This version of the logo coincided with Indonesia&apos;s democratic transition and CSIS&apos;s 
                    evolving role in providing policy recommendations during this crucial period.
                  </p>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <Image 
                    src="/logo-current.png" 
                    alt="Current CSIS Logo" 
                    width={300}
                    height={300}
                    className="max-w-full h-auto"
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-block bg-accent text-white text-sm font-medium px-3 py-1 rounded mb-4">2010-Present</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Contemporary Vision</h3>
                  <p className="text-gray-700 mb-4">
                    The current logo, introduced in 2010, represents a significant redesign that 
                    embraces minimalist principles while maintaining the core symbolism. The clean lines and 
                    refined typography reflect CSIS&apos;s precise analytical approach.
                  </p>
                  <p className="text-gray-700">
                    This modern identity system was designed for digital applications and global recognition, 
                    positioning CSIS as a contemporary think tank with a forward-looking perspective.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Guidelines */}
        <section className="py-16 bg-primary/5 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Brand Guidelines</h2>
              <p className="text-lg text-gray-700 mb-8">
                Our visual identity standards ensure consistency across all communications
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:border-r border-gray-200">
                  <h3 className="text-xl font-bold text-primary mb-6">Logo Usage</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="inline-block bg-accent w-2 h-2 rounded-full mt-2 mr-3"></span>
                      <p className="text-gray-700">Maintain clear space around the logo equal to the height of the &apos;C&apos; in CSIS</p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-accent w-2 h-2 rounded-full mt-2 mr-3"></span>
                      <p className="text-gray-700">Do not distort, rotate, or alter the proportions of the logo</p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-accent w-2 h-2 rounded-full mt-2 mr-3"></span>
                      <p className="text-gray-700">Use only approved color variations: full color, monochrome, or reversed</p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-accent w-2 h-2 rounded-full mt-2 mr-3"></span>
                      <p className="text-gray-700">Minimum size: 1 inch / 25mm width for print, 100px for digital</p>
                    </li>
                  </ul>
                </div>
                
                <div className="p-8 border-t md:border-t-0 md:border-l border-gray-200">
                  <h3 className="text-xl font-bold text-primary mb-6">Color Palette</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-20 bg-primary rounded-lg mb-2"></div>
                      <p className="font-medium text-gray-900">Primary Blue</p>
                      <p className="text-sm text-gray-500">#0A3D62</p>
                    </div>
                    <div>
                      <div className="h-20 bg-accent rounded-lg mb-2"></div>
                      <p className="font-medium text-gray-900">Accent Teal</p>
                      <p className="text-sm text-gray-500">#2E86C1</p>
                    </div>
                    <div>
                      <div className="h-20 bg-gray-800 rounded-lg mb-2"></div>
                      <p className="font-medium text-gray-900">Deep Black</p>
                      <p className="text-sm text-gray-500">#1E272E</p>
                    </div>
                    <div>
                      <div className="h-20 bg-gray-100 rounded-lg mb-2"></div>
                      <p className="font-medium text-gray-900">Light Gray</p>
                      <p className="text-sm text-gray-500">#F5F5F5</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-primary mb-6">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Playfair Display</h4>
                    <p className="text-4xl font-bold mb-2 font-serif">Aa Bb Cc</p>
                    <p className="text-gray-700">Primary font for headings and titles</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Inter</h4>
                    <p className="text-4xl font-bold mb-2 font-sans">Aa Bb Cc</p>
                    <p className="text-gray-700">Secondary font for body text and content</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/download/brand-guidelines.pdf" className="inline-block bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-md font-medium text-lg transition-colors">
                Download Full Brand Guidelines
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 