'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const Hero = () => {
  return (
    <section className="py-12 md:py-20 bg-primary relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="inline-block bg-accent px-4 py-2 mb-4">
              <span className="text-xl font-bold">CSIS Indonesia</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Advancing <span className="text-accent">Policy Research</span> for Indonesia's Future
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Centre for Strategic and International Studies - providing evidence-based research since 1971
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="text-primary px-6 py-3 text-lg font-medium inline-flex items-center bg-white hover:bg-gray-100 transition-colors">
                Our Research <FiArrowRight className="ml-2" />
              </button>
              <button className="border-2 border-white text-white px-6 py-3 text-lg font-medium inline-flex items-center hover:bg-white/10 transition-colors">
                About CSIS
              </button>
            </div>
          </motion.div>
          
          {/* Image/Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] relative bg-white shadow-2xl">
              <Image 
                src="/indonesia-map.jpg" 
                alt="Indonesia Map" 
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute top-0 left-0 bg-accent text-white py-2 px-4">
                Featured
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-teal text-white p-4">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm">Years of Research Excellence</div>
              </div>
              <div className="bg-accent text-white p-4">
                <div className="text-3xl font-bold">300+</div>
                <div className="text-sm">Policy Publications</div>
              </div>
              <div className="bg-white text-primary p-4">
                <div className="text-3xl font-bold">45+</div>
                <div className="text-sm">Research Fellows</div>
              </div>
              <div className="bg-white text-primary p-4">
                <div className="text-3xl font-bold">80+</div>
                <div className="text-sm">Global Partnerships</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 