'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlayCircle, FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Sample podcast data
const podcasts = [
  {
    id: 'podcast-1',
    title: 'Indonesia\'s Economic Prospects in 2024',
    type: 'podcast',
    date: '2024-05-10',
    duration: '34 min',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    category: 'Economics',
    speakers: ['Dr. Ahmad Sulaiman', 'Lisa Wijaya'],
    description: 'Analysis of Indonesia\'s economic outlook for 2024 amid global uncertainties.'
  },
  {
    id: 'podcast-2',
    title: 'Navigating the South China Sea Disputes',
    type: 'podcast',
    date: '2024-04-28',
    duration: '28 min',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    category: 'Security',
    speakers: ['Prof. Michael Chen', 'Dr. Sarah Johnson'],
    description: 'Discussing the latest developments in South China Sea territorial disputes.'
  },
  {
    id: 'podcast-3',
    title: 'Digital Economy Revolution in Southeast Asia',
    type: 'podcast',
    date: '2024-04-15',
    duration: '32 min',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    category: 'Technology',
    speakers: ['Maria Rodriguez', 'David Kim'],
    description: 'How digital transformation is reshaping economies across Southeast Asia.'
  },
  {
    id: 'podcast-4',
    title: 'Climate Change Adaptation in Indonesia',
    type: 'podcast',
    date: '2024-04-05',
    duration: '45 min',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    category: 'Environment',
    speakers: ['Dr. Siti Nuraini', 'James Wilson'],
    description: 'Exploring Indonesia\'s strategies for adapting to climate change challenges.'
  },
  {
    id: 'podcast-5',
    title: 'ASEAN\'s Role in Regional Security',
    type: 'podcast',
    date: '2024-03-22',
    duration: '36 min',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    category: 'Security',
    speakers: ['Ambassador Lee Chen', 'Dr. Maria Santos'],
    description: 'Examining ASEAN\'s evolving role in maintaining regional security and stability.'
  },
  {
    id: 'podcast-6',
    title: 'Indonesia\'s Foreign Policy Priorities',
    type: 'podcast',
    date: '2024-03-10',
    duration: '40 min',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    category: 'Foreign Policy',
    speakers: ['Prof. Bambang Wijaya', 'Dr. Sarah Peterson'],
    description: 'Analysis of Indonesia\'s key foreign policy objectives and diplomatic initiatives.'
  },
];

// Categories for filters
const categories = [
  'All Categories',
  'Economics',
  'Security',
  'International Relations',
  'Technology',
  'Environment',
  'Foreign Policy',
];

export default function PodcastsPage() {
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
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
  
  // Filter podcasts
  const filteredPodcasts = podcasts.filter(podcast => {
    const categoryMatch = activeCategory === 'All Categories' || podcast.category === activeCategory;
    return categoryMatch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-primary overflow-hidden">
        <Image 
          src="/bg/heather-green-bQTzJzwQfJE-unsplash.png" 
          alt="Podcasts Hero Background"
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Podcasts</h1>
            <p className="text-xl text-white opacity-90 max-w-2xl">
              Listen to our latest podcast episodes featuring CSIS experts discussing important regional and global issues.
            </p>
          </div>
        </div>
      </div>
      
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
            md:w-64 flex-shrink-0 bg-white rounded-lg p-4
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
              <h3 className="text-sm font-medium text-gray-500 mb-3">CATEGORY</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      filterByCategory(category);
                      if (isMobile) setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeCategory === category
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          
          {/* Podcasts Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">
                CSIS Podcasts
                {activeCategory !== "All Categories" && ` • ${activeCategory}`}
              </h2>
              <p className="text-sm text-gray-500">Showing {filteredPodcasts.length} results</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPodcasts.map((podcast) => (
                <Link
                  href={`/media/podcast/${podcast.id}`}
                  key={podcast.id}
                  className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={podcast.image}
                      alt={podcast.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute bottom-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <FiPlayCircle className="mr-1" /> 
                      {podcast.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-medium text-gray-500 mb-2 flex justify-between">
                      <span>{podcast.category}</span>
                      <span>{new Date(podcast.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">{podcast.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{podcast.description}</p>
                    <div className="text-xs text-gray-500">
                      <span>Featuring: </span>
                      {podcast.speakers.join(', ')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {filteredPodcasts.length === 0 && (
              <div className="bg-gray-50 p-8 text-center rounded-lg">
                <h3 className="text-lg font-medium text-gray-500 mb-2">No podcasts found</h3>
                <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile filter overlay */}
      {showMobileFilters && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileFilters(false)}
        ></div>
      )}
    </div>
  );
} 