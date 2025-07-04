'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCalendar, FiUser } from 'react-icons/fi';
import FadeIn from './animations/FadeIn';
import { useHomepage } from '@/contexts/HomepageContext';

export default function TheLatest() {
  const { homepageData, isLoading, error } = useHomepage();
  
  // Loading state
  if (isLoading) {
    return (
      <section className="py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-72 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-14 bg-gray-50 border-t border-gray-200">
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
  if (!homepageData || !homepageData.the_latest) {
    return (
      <section className="py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-600 mb-2">No Data Available</h2>
            <p className="text-gray-500">Check back later for the latest content.</p>
          </div>
        </div>
      </section>
    );
  }

  const { latest_publication, category_publications } = homepageData.the_latest;

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-baseline mb-8">
            <h2 className="text-3xl font-bold text-primary">The Latest</h2>
            <div className="ml-auto flex items-center space-x-3">
              <Link 
                href="/publications" 
                className="text-teal hover:text-accent flex items-center text-sm font-medium"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
        </FadeIn>
        
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Latest Publication Card - Now col-6 (half width) */}
            {latest_publication && (
              <div className="md:col-span-6 bg-white p-5 border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="relative h-full w-full mb-4">
                  <Image 
                    src={latest_publication.image || '/placeholder-image.jpg'}
                    alt={latest_publication.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-teal flex items-center">
                    {latest_publication.date}
                  </span>
                </div>
                <h3 className="font-bold text-primary text-lg mb-3">
                  <Link href={`/publications/${latest_publication.slug}`} className="hover:text-accent transition-colors">
                    {latest_publication.title}
                  </Link>
                </h3>
                <div className="mt-auto">
                  <div className="flex items-center text-xs text-gray-600 mb-3">
                    
                    {latest_publication.authors.map(a => a.name).join(', ')}
                  </div>
                  <Link 
                    href={`/publications/${latest_publication.slug}`}
                    className="text-teal hover:text-accent text-sm font-medium flex items-center"
                  >
                    Read More <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            )}
            
            {/* YouTube Shorts Video Card - Now col-3 (quarter width) */}
            <div className="md:col-span-3 bg-white p-5 border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <h3 className="font-bold text-primary text-lg mb-3">Latest Video</h3>
              <div className="relative w-full pt-[177.78%] mb-3">
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://youtube.com/embed/F_LBjXQZtQs?feature=share"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-auto">
                <Link 
                  href="https://youtube.com/shorts/F_LBjXQZtQs?si=EbVOCiLx_MdWWBia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:text-accent text-sm font-medium flex items-center"
                >
                  Watch on YouTube <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Category Publications Card - Now col-3 (quarter width) */}
            <div className="md:col-span-3 bg-white p-5 border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <h3 className="font-bold text-primary text-lg mb-4">Category Publications</h3>
              
              <div className="space-y-4 my-4">
                {category_publications.slice(0, 2).map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-teal">{item.category.name}</span>
                      <span className="text-xs text-gray-500">{item.publication.date}</span>
                    </div>
                    <h4 className="font-medium text-sm text-primary hover:text-accent transition-colors">
                      <Link href={`/publications/${item.publication.slug}`}>
                        {item.publication.title}
                      </Link>
                    </h4>
                    <div className="mt-1 text-xs text-gray-600 flex items-center">
                    
                      {item.publication.authors.map(a => a.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-3">
                <Link 
                  href="/publications/categories"
                  className="text-teal hover:text-accent text-sm font-medium flex items-center"
                >
                  View Categories <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
} 