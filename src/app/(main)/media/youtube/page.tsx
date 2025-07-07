'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlayCircle, FiFilter, FiX, FiYoutube, FiEye, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { 
  fetchMediaItems, 
  getTopics, 
  getDepartments,
  MediaItem,
  Topic,
  Department 
} from "@/services/mediaService";

export default function YouTubePage() {
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
        
        // Fetch only YouTube media items
        const mediaResponse = await fetchMediaItems({ 
          media_type: 'youtube',
          page_size: 50 
        });
        
        const topicsData = await getTopics(mediaResponse.results);
        const departmentsData = await getDepartments(mediaResponse.results);
        
        setMediaItems(mediaResponse.results);
        setTopics(topicsData);
        setDepartments(departmentsData);
      } catch (err) {
        setError('Failed to load YouTube videos. Please try again later.');
        console.error('Error loading YouTube data:', err);
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
  
  // Filter YouTube videos
  const filteredVideos = mediaItems.filter(item => {
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
          <p className="text-gray-600">Loading YouTube videos...</p>
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

  const mediaTypeOptions = ['All Types', 'YouTube'];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
        <Image 
          src="/bg/getty-images-C3gjLSgTKNw-unsplash.jpg" 
          alt="YouTube Videos Hero Background"
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
            <span className="text-lg font-medium text-white">Video Content</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center mb-4"
          >
            <FiYoutube className="text-red-500 text-5xl mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold !text-white">YouTube Videos</h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-green-100 max-w-2xl"
          >
            Watch our latest video content featuring CSIS experts discussing important regional and global issues.
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
                {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found
              </p>
            </div>
            
            {/* Videos Grid */}
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16">
                <FiYoutube className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
                <p className="text-gray-600">
                  {activeCategory !== 'All Categories' 
                    ? `No YouTube videos found in the "${activeCategory}" category.`
                    : 'No YouTube videos available at the moment.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video">
                      <Image
                        src={video.thumbnail || '/bg/default-video.jpg'}
                        alt={video.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <FiPlayCircle className="text-white text-5xl" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiYoutube className="mr-1" />
                          YouTube
                        </span>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        <Link 
                          href={`/media/youtube/${video.slug}`}
                          className="text-gray-900 hover:text-primary transition-colors"
                        >
                          {video.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {video.description}
                      </p>
                      
                      {/* Video Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          <span>{formatDate(video.publish_date)}</span>
                        </div>
                        {video.viewed > 0 && (
                          <div className="flex items-center">
                            <FiEye className="mr-1" />
                            <span>{video.viewed} views</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Topics */}
                      {video.topic && video.topic.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {video.topic.slice(0, 2).map((topic) => (
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
                      {video.persons && video.persons.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Speakers: </span>
                          {video.persons.slice(0, 2).map((person, index) => (
                            <span key={person.id}>
                              {person.person.name}
                              {index < Math.min(video.persons.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {video.persons.length > 2 && (
                            <span> and {video.persons.length - 2} more</span>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex justify-between items-center">
                        <Link
                          href={`/media/youtube/${video.slug}`}
                          className="text-primary hover:text-primary-dark font-medium text-sm"
                        >
                          Watch Video →
                        </Link>
                        {video.youtube_url && (
                          <a
                            href={video.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 text-sm flex items-center"
                          >
                            <FiYoutube className="mr-1" />
                            YouTube
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