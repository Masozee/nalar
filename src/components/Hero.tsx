'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import FadeIn from '@/components/animations/FadeIn';

export default function Hero() {
  const handleScrollDown = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  }, []);

  return (
    <section className="relative h-screen min-h-[650px] max-h-[800px] w-full overflow-hidden pt-16 lg:pt-28">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg/muska-create-5MvNlQENWDM-unsplash.png"
          alt="CSIS Indonesia - Think Tank"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" 
             style={{ background: 'linear-gradient(360deg, rgba(77,135,135,255) 0%, rgba(34,23,17,0.24693627450980393) 37%)' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-3xl mt-[-16px] lg:mt-[-28px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Indonesia&apos;s Premier <span className="text-accent">Think Tank</span> for Policy Research
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Providing strategic analysis and policy recommendations on economics, politics, and international relations in Indonesia and Southeast Asia since 1971.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link 
              href="/publications" 
              className="bg-accent hover:bg-accent/90 text-white py-3 px-6 font-medium flex items-center group"
            >
              Our Research
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/about" 
              className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 font-medium flex items-center group backdrop-blur-sm"
            >
              About CSIS
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
        
        {/* Scroll down indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={handleScrollDown}
          whileHover={{ y: 5 }}
        >
          <span className="text-white/80 text-sm mb-2">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-center justify-center">
            <motion.div 
              className="w-1.5 h-3 bg-white rounded-full"
              animate={{ 
                y: [0, 12, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Floating stats */}
      <FadeIn 
        className="absolute bottom-10 right-10 z-20 hidden lg:block" 
        delay={0.8} 
        direction="left"
      >
        <div className="bg-white/10 backdrop-blur-md p-6 max-w-xs">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-accent text-4xl font-bold">50+</p>
              <p className="text-white text-sm">Years of Experience</p>
            </div>
            <div>
              <p className="text-accent text-4xl font-bold">300+</p>
              <p className="text-white text-sm">Publications</p>
            </div>
            <div>
              <p className="text-accent text-4xl font-bold">40+</p>
              <p className="text-white text-sm">Research Experts</p>
            </div>
            <div>
              <p className="text-accent text-4xl font-bold">120+</p>
              <p className="text-white text-sm">Global Partners</p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
} 