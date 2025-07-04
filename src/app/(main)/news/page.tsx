'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiUser, FiTag, FiArrowRight, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { News } from '@/lib/api';

// Local news interface for display
interface NewsItem {
  id: number | string; // Allow both number and string IDs for API and mock data compatibility
  title: string;
  slug: string;
  date: string;
  image: string;
  description?: string;
  excerpt?: string; // For mock data compatibility
  author?: string; // For mock data compatibility
  category?: string; // For mock data compatibility
  featured: boolean;
}

// Sample news data as fallback
const mockNewsItems: NewsItem[] = [
  {
    id: 'news-001',
    title: 'CSIS Hosts International Conference on Southeast Asian Security',
    slug: 'csis-hosts-international-conference',
    date: 'April 15, 2024',
    author: 'Dr. Sarah Chen',
    category: 'Events',
    excerpt: 'Leading experts from across Southeast Asia gathered at CSIS for a two-day conference on regional security challenges and opportunities.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    featured: true
  },
  {
    id: 'news-002',
    title: 'New Research Partnership Announced with ASEAN Universities',
    slug: 'new-research-partnership-asean',
    date: 'April 10, 2024',
    author: 'Prof. James Wilson',
    category: 'Research',
    excerpt: 'CSIS has established a new research partnership with leading universities across ASEAN to strengthen regional academic collaboration.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    featured: true
  },
  {
    id: 'news-003',
    title: 'CSIS Experts Contribute to UN Climate Report',
    slug: 'csis-experts-un-climate-report',
    date: 'April 5, 2024',
    author: 'Dr. Maria Rodriguez',
    category: 'Research',
    excerpt: 'CSIS researchers have contributed to the latest UN climate report, providing critical analysis on Southeast Asia\'s climate challenges.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    featured: false
  },
  {
    id: 'news-004',
    title: 'CSIS Launches New Digital Policy Initiative',
    slug: 'csis-digital-policy-initiative',
    date: 'April 1, 2024',
    author: 'Dr. Alex Kumar',
    category: 'Policy',
    excerpt: 'A new initiative aims to help Southeast Asian nations develop comprehensive digital policies for the rapidly evolving tech landscape.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    featured: false
  },
  {
    id: 'news-005',
    title: 'CSIS Welcomes New Senior Fellows',
    slug: 'csis-welcomes-new-senior-fellows',
    date: 'March 28, 2024',
    author: 'CSIS Staff',
    category: 'Announcements',
    excerpt: 'Three distinguished scholars have joined CSIS as Senior Fellows, bringing expertise in international relations, economics, and security studies.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    featured: false
  },
  {
    id: 'news-006',
    title: 'CSIS Publishes Special Report on Indonesia\'s Economic Outlook',
    slug: 'csis-indonesia-economic-outlook',
    date: 'March 25, 2024',
    author: 'Dr. Rudi Hartono',
    category: 'Publications',
    excerpt: 'A comprehensive analysis of Indonesia\'s economic prospects for 2024-2025, with recommendations for sustainable growth strategies.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    featured: false
  }
];

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNewsItems, setFilteredNewsItems] = useState<NewsItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch news data from API
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await api.fetchNews();

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data && response.data.results) {
          // Convert API data to our format
          const formattedNews: NewsItem[] = response.data.results.map((item: News) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            date: new Date(item.date_release).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            image: item.image,
            description: item.description,
            featured: false // Set first two as featured
          }));

          // Set first two items as featured
          if (formattedNews.length > 0) {
            formattedNews[0].featured = true;
          }
          if (formattedNews.length > 1) {
            formattedNews[1].featured = true;
          }

          setNewsItems(formattedNews);
          setFilteredNewsItems(formattedNews);
        } else {
          // Fallback to mock data
          setNewsItems(mockNewsItems as NewsItem[]);
          setFilteredNewsItems(mockNewsItems as NewsItem[]);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Fallback to mock data
        setNewsItems(mockNewsItems as NewsItem[]);
        setFilteredNewsItems(mockNewsItems as NewsItem[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter news based on search query and category filter
  useEffect(() => {
    let results = [...newsItems];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (activeFilter !== 'All') {
      // This would filter by category if we had category data
      // For now, we'll just use the mock filter
    }

    setFilteredNewsItems(results);
  }, [searchQuery, activeFilter, newsItems]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
        <Image
          src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
          alt="News background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
          priority
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold !text-white mb-4"
          >
            News & Updates
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-green-100 max-w-2xl"
          >
            Stay informed about the latest research, events, and developments from CSIS Indonesia.
          </motion.p>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mt-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading News</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Featured News */}
      {!isLoading && filteredNewsItems.length > 0 && filteredNewsItems.some(item => item.featured) && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">Featured News</h2>
            <div className="h-px flex-grow bg-[#005357]/20 ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNewsItems.filter(item => item.featured).map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#005357]/10">
                <div className="md:flex">
                  <div className="md:w-1/2 relative h-[300px] md:h-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#005357]/70 to-transparent z-10" />
                    <Image 
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute bottom-0 left-0 p-6 z-20 md:hidden">
                      <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                    </div>
                  </div>
                  <div className="md:w-1/2 p-6 md:p-8">
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    
                    <div className="flex items-center text-[#005357] mb-4">
                      <FiCalendar className="mr-2 text-[#005357]" />
                      <span>{item.date}</span>
                    </div>
                    
                    {item.excerpt && (
                      <p className="text-gray-700 mb-6 line-clamp-3">{item.excerpt}</p>
                    )}
                    
                    <Link 
                      href={`/news/${item.slug}`} 
                      className="inline-block bg-[#005357] hover:bg-[#003e40] text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* All News */}
      {!isLoading && filteredNewsItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Controls */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold mr-4">All News</h2>
                {searchQuery && (
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#005357] text-white text-xs font-medium rounded-full">
                    1
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className="text-[#005357]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#005357]/20 text-gray-900 text-sm rounded-lg focus:ring-[#005357] focus:border-[#005357] block w-full pl-10 p-2.5 shadow-sm"
                    placeholder="Search news..."
                  />
                </div>
              </div>
            </div>
            
            {/* Inline Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Status Filter Pills */}
              <div className="flex items-center mr-2">
                <span className="text-sm font-medium text-[#005357] mr-2">Filter:</span>
                <div className="flex flex-wrap gap-1">
                  {['All', 'Latest', 'Archive'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        activeFilter === filter 
                          ? 'bg-[#005357] text-white' 
                          : 'bg-[#e6f0f0] text-[#005357] hover:bg-[#d0e6e6]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* News Grid - Using 4 columns as per the design memory */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredNewsItems.map((item) => (
                <div key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-lg border border-[#005357]/10">
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-xs text-[#005357] mb-2">
                      <FiCalendar className="mr-1" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-md font-bold text-[#005357] mb-3">{item.title}</h3>
                    <Link 
                      href={`/news/${item.slug}`}
                      className="inline-flex items-center text-[#005357] text-sm hover:text-[#003e40] font-medium"
                    >
                      Read more
                      <FiArrowRight className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 