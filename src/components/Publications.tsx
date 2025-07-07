'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiDownload, FiArrowRight, FiCalendar, FiExternalLink } from 'react-icons/fi';
import FadeIn from './animations/FadeIn';
import { useHomepage } from '@/contexts/HomepageContext';

// Utility function to format authors
const formatAuthors = (authors: Array<{ name: string }> | undefined): string => {
  if (!authors || authors.length === 0) return 'Unknown';
  
  if (authors.length === 1) {
    return authors[0].name;
  }
  
  const firstAuthor = authors[0].name;
  const remainingCount = authors.length - 1;
  return `${firstAuthor}, +${remainingCount} more`;
};

export default function Publications() {
  const { homepageData, isLoading, error } = useHomepage();
  
  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Publications</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!homepageData || !homepageData.publications) {
    return (
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-600 mb-2">No Publications Available</h2>
            <p className="text-gray-500">Check back later for the latest publications.</p>
          </div>
        </div>
      </section>
    );
  }

  const { latest_publications, category_publications, journal_links } = homepageData.publications;

  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary">Research Publications</h2>
          <Link 
            href="/publications" 
            className="flex items-center text-accent text-base font-medium hover:underline"
          >
            View All <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        {/* First row: 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {latest_publications.slice(0, 2).map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              className="bg-white shadow-lg border-glow"
            >
              <div className="flex flex-col">
                <div className="relative h-56 w-full">
                  <Image 
                    src={publication.image || '/placeholder-publication.jpg'}
                    alt={publication.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base text-teal font-medium">Research</span>
                    <div className="flex items-center text-gray-500 text-xs">
                      <FiCalendar className="mr-1" /> {publication.date}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary">{publication.title}</h3>
                  <div className="mb-3 text-gray-600 text-sm">
                    {formatAuthors(publication.authors)}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Link 
                      href={`/publications/${publication.slug}`} 
                      className="inline-flex items-center btn-primary text-sm font-medium px-3 py-1"
                    >
                      Read Publication <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Second row: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dynamic publications for first 2 slots */}
          {category_publications.slice(0, 2).map((item, index) => (
            <motion.div
              key={`category-${item.category.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
            >
              <div className="relative h-40 w-full">
                <Image 
                  src={item.publication.image || '/placeholder-publication.jpg'}
                  alt={item.publication.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1">
                  {item.category.name}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">{item.publication.date}</span>
                </div>
                <h4 className="font-bold text-sm text-primary hover:text-accent transition-colors mb-2">
                  <Link href={`/publications/${item.publication.slug}`}>
                    {item.publication.title}
                  </Link>
                </h4>
                <div className="text-xs text-gray-600 mb-3">
                  {formatAuthors(item.publication.authors)}
                </div>
                <div className="mt-auto pt-2">
                  <Link 
                    href={`/publications/${item.publication.slug}`}
                    className="text-accent hover:underline text-xs font-medium flex items-center"
                  >
                    Read More <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Static articles for Analisis CSIS and Indonesian Quarterly in positions 3 and 4 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
          >
            <div className="relative h-40 w-full">
              <Image 
                src="/bg/analisis.png"
                alt="Analisis CSIS"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1">
                Journal
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-bold text-sm text-primary hover:text-accent transition-colors mb-2">
                <Link href="https://journals.csis.or.id/index.php/analisis">
                  Analisis CSIS
                </Link>
              </h4>
              <div className="text-xs text-gray-600 mb-3">Vol. 53 No. 4 (2024)</div>
              <div className="mt-auto pt-2">
                <Link 
                  href="https://journals.csis.or.id/index.php/analisis"
                  className="text-accent hover:underline text-xs font-medium flex items-center"
                >
                  Read More <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
          >
            <div className="relative h-40 w-full">
              <Image 
                src="/bg/IQ.png"
                alt="Indonesian Quarterly"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1">
                Journal
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-bold text-sm text-primary hover:text-accent transition-colors mb-2">
                <Link href="https://journals.csis.or.id/index.php/iq">
                  Indonesian Quarterly
                </Link>
              </h4>
              <div className="text-xs text-gray-600 mb-3">Vol. 52 No. 4 (2024)</div>
              <div className="mt-auto pt-2">
                <Link 
                  href="https://journals.csis.or.id/index.php/iq"
                  className="text-accent hover:underline text-xs font-medium flex items-center"
                >
                  Read More <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 