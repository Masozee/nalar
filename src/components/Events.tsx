'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
import { useHomepage } from '@/contexts/HomepageContext';

const Events = () => {
  const { homepageData, isLoading, error } = useHomepage();

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
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
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Events</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!homepageData || !homepageData.events || homepageData.events.length === 0) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-600 mb-2">No Events Available</h2>
            <p className="text-gray-500">Check back later for upcoming events.</p>
          </div>
        </div>
      </section>
    );
  }

  const events = homepageData.events;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Upcoming Events</h2>
          <Link 
            href="/events" 
            className="flex items-center text-accent text-lg font-medium hover:underline"
          >
            All Events <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.slice(0, 4).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <div className="flex flex-col h-full">
                <div className="relative aspect-square w-full">
                  <Image 
                    src={event.image || '/placeholder-event.jpg'}
                    alt={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className=""
                  />
                  {event.is_upcoming && (
                    <div className="absolute top-0 left-0 bg-accent text-white py-1 px-3 text-sm">
                      Upcoming
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center">
                      <FiCalendar className="mr-1" /> {event.date_start}
                      {event.date_end && event.date_end !== event.date_start && ` - ${event.date_end}`}
                    </span>
                    
                    {event.time_start && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center">
                        <FiClock className="mr-1" /> {event.time_start}
                        {event.time_end && ` - ${event.time_end}`}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-bold text-primary mb-2">
                    <Link href={`/events/${event.slug}`} className="hover:text-accent transition-colors">
                      {event.title}
                    </Link>
                  </h3>
                  
                  
                  <div className="mt-auto pt-2">
                    <Link 
                      href={`/events/${event.slug}`} 
                      className="inline-flex items-center text-accent text-xs font-medium hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events; 