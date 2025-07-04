'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink, FiUser, FiCalendar } from 'react-icons/fi';
import { useHomepage } from '@/contexts/HomepageContext';

export default function CSISOnNews() {
  const { homepageData, isLoading, error } = useHomepage();
  
  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!homepageData || !homepageData.csis_on_news || homepageData.csis_on_news.length === 0) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-600 mb-2">No News Available</h2>
            <p className="text-gray-500">Check back later for the latest external publications.</p>
          </div>
        </div>
      </section>
    );
  }

  const externalPublications = homepageData.csis_on_news;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary">CSIS on News</h2>
          <Link 
            href="/external-publications" 
            className="flex items-center text-accent text-base font-medium hover:underline"
          >
            View All <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {externalPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-sm flex flex-col"
            >
              {/* Image on top */}
              <div className="relative h-48 w-full bg-gray-100">
                <Image 
                  src={`/placeholder-${index + 1}.jpg`}
                  alt={publication.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute top-0 left-0 bg-accent/80 text-white text-xs px-2 py-1">
                  {publication.category}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-white text-xs font-medium">{publication.source}</span>
                </div>
              </div>
              
              {/* Content below image */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                  <h3 className="font-bold text-primary hover:text-accent transition-colors text-base line-clamp-2">
                    {publication.link ? (
                      <a 
                        href={publication.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {publication.title}
                      </a>
                    ) : (
                      publication.title
                    )}
                  </h3>
                </div>
                
                <div className="mt-auto">
                  <div className="flex flex-col space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-2 mt-2">
                    <div className="flex items-center">
                      <FiUser className="mr-1 text-accent" /> 
                      <Link 
                        href={`/scholars/${publication.author.slug}`}
                        className="font-medium hover:text-accent"
                      >
                        {publication.author.name}
                      </Link>
                    </div>
                    {publication.date && (
                      <div className="flex items-center">
                        <FiCalendar className="mr-1 text-accent" /> 
                        <span>{publication.date}</span>
                      </div>
                    )}
                  </div>
                  
                  {publication.link && (
                    <a 
                      href={publication.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-accent text-xs font-medium hover:underline"
                    >
                      Read Article <FiExternalLink className="ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 