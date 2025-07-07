'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlayCircle, FiFilter, FiX, FiCalendar, FiEye, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { 
  fetchMediaItems, 
  getTopics, 
  getDepartments,
  MediaItem,
  Topic,
  Department 
} from "@/services/mediaService";

export default function PodcastsPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeType, setActiveType] = useState('All Types');
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch only podcast media items
        const mediaResponse = await fetchMediaItems({ 
          media_type: 'podcast',
          page_size: 50 
        });
        
        const topicsData = await getTopics(mediaResponse.results);
        const departmentsData = await getDepartments(mediaResponse.results);
        
        setMediaItems(mediaResponse.results);
        setTopics(topicsData);
        setDepartments(departmentsData);
      } catch (err) {
        setError('Failed to load podcasts. Please try again later.');
        console.error('Error loading podcast data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Filter handlers
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
  };
  
  const filterByType = (type: string) => {
    setActiveType(type);
  };
  
  // Filter podcasts
  const filteredPodcasts = mediaItems.filter(item => {
    const categoryMatch = activeCategory === 'All Categories' || 
      item.topic.some(topic => topic.name === activeCategory) ||
      item.department.some(dept => dept.name === activeCategory);
    return categoryMatch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading podcasts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-teal transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get available filter options
  const categoryOptions = [
    "All Categories",
    ...topics.map(topic => topic.name),
    ...departments.map(dept => dept.name)
  ];

  const mediaTypeOptions = ['All Types', 'Podcast'];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
        <Image 
          src="/bg/heather-green-bQTzJzwQfJE-unsplash.png" 
          alt="Podcasts Hero Background"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-accent px-4 py-2 mb-4 w-fit"
          >
            <span className="text-lg font-medium text-white">Audio Content</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold !text-white mb-4"
          >
            Podcasts
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-green-100 max-w-2xl"
          >
            Listen to our latest podcast episodes featuring CSIS experts discussing important regional and global issues.
          </motion.p>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
          >
            <span className="flex items-center text-gray-700 font-medium">
              <FiFilter className="mr-2" /> 
              Filters
            </span>
            <span className="text-sm text-primary">
              {activeCategory !== "All Categories" && `Category: ${activeCategory}`}
            </span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            md:w-64 flex-shrink-0 bg-white rounded-lg p-4 shadow-sm
            ${isMobile ? 'fixed inset-0 z-50 bg-white overflow-auto transform transition-transform duration-300 ease-in-out' : ''}
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile Close Button */}
            {isMobile && (
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-lg font-bold">Filters</h2>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">MEDIA TYPE</h3>
              <div className="space-y-2">
                {mediaTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      filterByType(type);
                      if (isMobile) setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeType === type
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredPodcasts.length} {filteredPodcasts.length === 1 ? 'podcast' : 'podcasts'} found
              </p>
            </div>
            
            {/* Podcasts Grid */}
            {filteredPodcasts.length === 0 ? (
              <div className="text-center py-16">
                <FiPlayCircle className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No podcasts found</h3>
                <p className="text-gray-600">
                  {activeCategory !== 'All Categories' 
                    ? `No podcasts found in the "${activeCategory}" category.`
                    : 'No podcasts available at the moment.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPodcasts.map((podcast) => (
                  <div key={podcast.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Podcast Thumbnail */}
                    <div className="relative aspect-video">
                      <Image
                        src={podcast.thumbnail || '/bg/default-podcast.jpg'}
                        alt={podcast.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <FiPlayCircle className="text-white text-5xl" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiPlayCircle className="mr-1" />
                          Podcast
                        </span>
                      </div>
                    </div>
                    
                    {/* Podcast Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        <Link 
                          href={`/media/podcast/${podcast.slug}`}
                          className="text-gray-900 hover:text-primary transition-colors"
                        >
                          {podcast.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {podcast.description}
                      </p>
                      
                      {/* Podcast Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          <span>{formatDate(podcast.publish_date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {podcast.duration && (
                            <div className="flex items-center">
                              <FiClock className="mr-1" />
                              <span>{podcast.duration}</span>
                            </div>
                          )}
                          {podcast.viewed > 0 && (
                            <div className="flex items-center">
                              <FiEye className="mr-1" />
                              <span>{podcast.viewed}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Topics */}
                      {podcast.topic && podcast.topic.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {podcast.topic.slice(0, 2).map((topic) => (
                            <span
                              key={topic.id}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {topic.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Speakers */}
                      {podcast.persons && podcast.persons.length > 0 && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Speakers: </span>
                          {podcast.persons.slice(0, 2).map((person, index) => (
                            <span key={person.id}>
                              {person.person.name}
                              {index < Math.min(podcast.persons.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {podcast.persons.length > 2 && (
                            <span> and {podcast.persons.length - 2} more</span>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex justify-between items-center">
                        <Link
                          href={`/media/podcast/${podcast.slug}`}
                          className="text-primary hover:text-primary-dark font-medium text-sm"
                        >
                          Listen Now →
                        </Link>
                        {podcast.podcast_url && (
                          <a
                            href={podcast.podcast_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm flex items-center"
                          >
                            <FiPlayCircle className="mr-1" />
                            {podcast.podcast_platform || 'Listen'}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 