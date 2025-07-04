'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay, FiHeadphones, FiClock, FiCalendar } from 'react-icons/fi';
import api, { Podcast } from '@/lib/api';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch podcasts data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.fetchPodcasts();
        
        if (response.error) {
          setError(response.error);
        } else {
          setPodcasts(response.data);
        }
      } catch (err) {
        setError('Failed to load podcasts data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-72 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-48 bg-gray-200 animate-pulse rounded"></div>
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
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Podcasts</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // No podcasts available
  if (podcasts.length === 0) {
    return (
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-600 mb-2">No Podcasts Available</h2>
            <p className="text-gray-500">Check back later for our latest podcast episodes.</p>
          </div>
        </div>
      </section>
    );
  }
  
  const featuredPodcast = podcasts[0]; // Use the first podcast as featured
  const otherPodcasts = podcasts.slice(1); // Use the rest as other podcasts

  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Latest Podcasts</h2>
          <Link 
            href="/podcasts" 
            className="flex items-center text-accent text-lg font-medium hover:underline"
          >
            All Episodes <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Featured Podcast */}
          {featuredPodcast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-1 lg:col-span-7"
            >
              <div className="bg-white border-animate-top">
                {featuredPodcast.spotifyEmbed ? (
                  <div className="w-full">
                    <div dangerouslySetInnerHTML={{ __html: featuredPodcast.spotifyEmbed }} />
                  </div>
                ) : (
                  <div className="relative h-[320px] w-full overflow-hidden">
                    <Image 
                      src={featuredPodcast.coverImage}
                      alt={featuredPodcast.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition-all group">
                        <FiPlay className="text-4xl text-white ml-1 group-hover:scale-110 transition-transform" />
                      </button>
                      <div className="p-6 text-white">
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-accent/80 backdrop-blur-sm px-3 py-1 rounded-sm">
                            Featured Episode
                          </span>
                          <div className="flex space-x-4">
                            <span className="flex items-center">
                              <FiClock className="mr-1" /> {featuredPodcast.duration}
                            </span>
                            <span className="flex items-center">
                              <FiCalendar className="mr-1" /> {featuredPodcast.publishDate}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-2 drop-shadow-md">{featuredPodcast.title}</h3>
                        <div className="mb-2">
                          <span className="font-medium">Host: {featuredPodcast.host}</span> | 
                          <span className="font-medium ml-2">Guest: {featuredPodcast.guests.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <p className="text-lg text-gray-700 mb-4">A discussion on important regional policy issues with experts in the field.</p>
                  <div className="flex justify-between items-center">
                    <Link 
                      href={`/podcasts/${featuredPodcast.id}`} 
                      className="btn-accent inline-flex items-center text-lg font-medium px-6 py-3"
                    >
                      Listen Now <FiHeadphones className="ml-2" />
                    </Link>
                    <div className="flex space-x-3">
                      <button className="text-gray-700 hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-4 17v-10l9 5.146-9 4.854z"/>
                        </svg>
                      </button>
                      <button className="text-gray-700 hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-6 8h5v10h2v-10h5l-6-6-6 6z"/>
                        </svg>
                      </button>
                      <button className="text-gray-700 hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-12v-2h12v2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Podcast Player */}
          <div className="col-span-1 lg:col-span-5">
            <div className="bg-primary text-white h-full p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FiHeadphones className="mr-2" /> Latest Podcast Episodes
              </h3>
              
              {/* List of podcasts with player controls */}
              <div className="space-y-4 overflow-auto max-h-[400px] pr-2">
                {podcasts.slice(0, 5).map((podcast, index) => (
                  <div key={podcast.id} className="border-b border-white/20 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 mr-3">
                        <h4 className="font-bold text-white hover:text-accent transition-colors line-clamp-3">
                          <Link href={`/podcasts/${podcast.id}`}>
                            {podcast.title}
                          </Link>
                        </h4>
                        <div className="text-xs text-white/70 mt-1 flex items-center">
                          <FiClock className="mr-1" /> {podcast.duration}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button className="p-1.5 bg-accent/20 rounded-full hover:bg-accent/40 transition-colors">
                          <FiPlay className="text-lg" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="relative h-1.5 bg-white/20 rounded overflow-hidden flex-1 mr-3">
                        <div className="absolute h-full bg-accent rounded" style={{ width: `${(index * 17) % 100}%` }}></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="text-white/70 hover:text-accent transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-6 8h5v10h2v-10h5l-6-6-6 6z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/60 mt-2">
                      <span>{podcast.publishDate}</span>
                      <Link 
                        href={`/podcasts/${podcast.id}`}
                        className="inline-flex items-center text-white/80 hover:text-accent transition-colors"
                      >
                        Details <FiArrowRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <Link 
                  href="/podcasts" 
                  className="inline-flex items-center text-accent hover:underline"
                >
                  Browse All Podcasts <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Other Podcasts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherPodcasts.map((podcast, index) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white card-hover"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src={podcast.coverImage}
                  alt={podcast.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <button className="w-16 h-16 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition-all">
                    <FiPlay className="text-3xl text-white ml-1" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" /> {podcast.publishDate}
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-1" /> {podcast.duration}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-primary line-clamp-2 hover:text-accent transition-colors">
                  <Link href={`/podcasts/${podcast.id}`}>
                    {podcast.title}
                  </Link>
                </h3>
                <div className="text-sm text-gray-600 mb-3">
                  With {podcast.host} and {podcast.guests.join(', ')}
                </div>
                <Link 
                  href={`/podcasts/${podcast.id}`}
                  className="inline-flex items-center text-accent font-medium text-sm hover:underline"
                >
                  Listen to Episode <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Podcasts;
