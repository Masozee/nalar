'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiFilter, FiXCircle, FiUser, FiCalendar, FiFileText, FiBook } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

// Mocked search data for different content types
// In a real application, this would come from an API or database

interface SearchResult {
  id: string;
  title: string;
  type: 'publication' | 'event' | 'expert' | 'news' | 'page';
  url: string;
  date?: string;
  description: string;
  image?: string;
  category?: string;
  tags?: string[];
}

const searchData: SearchResult[] = [
  // Publications
  {
    id: 'pub-1',
    title: "Indonesia's Economic Outlook 2024",
    type: 'publication',
    url: '/publications/indonesia-economic-outlook-2024',
    date: 'May 10, 2024',
    description: "A comprehensive analysis of Indonesia's economic prospects for 2024, examining key sectors, policy reforms, and growth forecasts.",
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    category: 'Economics',
    tags: ['Economy', 'Development', 'Policy']
  },
  {
    id: 'pub-2',
    title: "ASEAN's Strategic Position in US-China Relations",
    type: 'publication',
    url: '/publications/asean-strategic-position',
    date: 'April 28, 2024',
    description: 'This paper analyzes how ASEAN navigates between the competing interests of the United States and China in the Indo-Pacific region.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    category: 'International Relations',
    tags: ['ASEAN', 'China', 'United States', 'Diplomacy']
  },
  {
    id: 'pub-3',
    title: 'Maritime Security Challenges in Southeast Asia',
    type: 'publication',
    url: '/publications/maritime-security-challenges',
    date: 'April 15, 2024',
    description: 'A comprehensive analysis of current maritime security challenges in the region and potential solutions for regional cooperation.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    category: 'Security',
    tags: ['Maritime', 'Security', 'Southeast Asia', 'Naval']
  },
  
  // Events
  {
    id: 'event-1',
    title: 'Annual Southeast Asia Security Conference',
    type: 'event',
    url: '/events/annual-southeast-asia-security-conference',
    date: 'June 15-16, 2024',
    description: 'Join leading security experts for a two-day conference on emerging security challenges in Southeast Asia.',
    image: '/bg/alexander-distel-V0dhPj1d11Q-unsplash.png',
    category: 'Conference',
    tags: ['Security', 'Conference', 'Southeast Asia']
  },
  {
    id: 'event-2',
    title: 'Indonesia Economic Forum: Navigating Global Uncertainties',
    type: 'event',
    url: '/events/indonesia-economic-forum',
    date: 'July 8, 2024',
    description: 'A high-level forum discussing strategies for Indonesia to navigate global economic uncertainties and maintain growth momentum.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    category: 'Forum',
    tags: ['Economy', 'Forum', 'Global Market']
  },
  
  // Experts
  {
    id: 'expert-1',
    title: 'Dr. Siti Rahmah',
    type: 'expert',
    url: '/experts/siti-rahmah',
    description: 'Senior researcher specializing in Southeast Asian politics and international relations, with a focus on ASEAN integration.',
    image: '/experts/expert1.jpg',
    category: 'International Relations',
    tags: ['ASEAN', 'International Relations', 'Regional Integration']
  },
  {
    id: 'expert-2',
    title: 'Dr. Ahmad Fadillah',
    type: 'expert',
    url: '/experts/ahmad-fadillah',
    description: 'Lead economist with expertise in Indonesian economic development, trade policy, and regional economic cooperation.',
    image: '/experts/expert2.jpg',
    category: 'Economics',
    tags: ['Economy', 'Development', 'Trade']
  },
  
  // Pages
  {
    id: 'page-1',
    title: 'About CSIS Indonesia',
    type: 'page',
    url: '/about',
    description: 'Learn about the Centre for Strategic and International Studies (CSIS) Indonesia, our mission, vision, and history.',
    tags: ['About', 'Organization', 'Mission']
  },
  {
    id: 'page-2',
    title: 'Internship Opportunities',
    type: 'page',
    url: '/careers/internship',
    description: 'Explore internship opportunities at CSIS Indonesia and join our team of researchers and policy analysts.',
    tags: ['Careers', 'Internship', 'Opportunities']
  }
];

// Create a client component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<{
    types: string[];
    categories: string[];
  }>({
    types: [],
    categories: []
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Extract unique content types and categories for filter options
  const contentTypes = Array.from(new Set(searchData.map(item => item.type)));
  const categories = Array.from(new Set(searchData.filter(item => item.category).map(item => item.category as string)));
  
  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    
    // Simple search implementation - in a real app, this would call an API
    const searchResults = searchData.filter(item => {
      const matchesTerm = 
        item.title.toLowerCase().includes(term.toLowerCase()) ||
        item.description.toLowerCase().includes(term.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase())));
      
      const matchesTypeFilter = filters.types.length === 0 || filters.types.includes(item.type);
      const matchesCategoryFilter = filters.categories.length === 0 || 
        (item.category && filters.categories.includes(item.category));
      
      return matchesTerm && matchesTypeFilter && matchesCategoryFilter;
    });
    
    setResults(searchResults);
  }, [filters]);
  
  useEffect(() => {
    // Set initial search term from URL query parameter
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [query, performSearch]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
    
    // Update URL to include search query (for sharing/bookmarking)
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchTerm);
    window.history.pushState({}, '', url);
  };
  
  const toggleFilter = (type: 'types' | 'categories', value: string) => {
    setFilters(prev => {
      const currentFilters = [...prev[type]];
      const index = currentFilters.indexOf(value);
      
      if (index === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(index, 1);
      }
      
      return {
        ...prev,
        [type]: currentFilters
      };
    });
  };
  
  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [filters, performSearch, searchTerm]);
  
  const clearFilters = () => {
    setFilters({
      types: [],
      categories: []
    });
  };
  
  // Function to format content type for display
  const formatContentType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Function to get icon based on content type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'publication':
        return <FiFileText className="mr-2" />;
      case 'event':
        return <FiCalendar className="mr-2" />;
      case 'expert':
        return <FiUser className="mr-2" />;
      case 'page':
        return <FiBook className="mr-2" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section with Search */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Results</h1>
            
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center border-2 border-gray-300 bg-white rounded-none">
                <div className="pl-4">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search publications, events, experts..."
                  className="w-full p-4 focus:outline-none text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-4 font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row">
            {/* Filters - Mobile Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between bg-white p-4 border border-gray-200"
              >
                <span className="flex items-center">
                  <FiFilter className="mr-2" />
                  Filters
                </span>
                <span>{showFilters ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            
            {/* Filters Sidebar */}
            <div 
              className={`w-full md:w-64 flex-shrink-0 transition-all duration-300 mb-6 md:mb-0 md:mr-8 ${
                showFilters ? 'block' : 'hidden md:block'
              }`}
            >
              <div className="bg-white border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">Filters</h2>
                  {(filters.types.length > 0 || filters.categories.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:text-accent transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {/* Content Type Filter */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Content Type</h3>
                  <div className="space-y-2">
                    {contentTypes.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type)}
                          onChange={() => toggleFilter('types', type)}
                          className="mr-2 h-4 w-4 accent-primary"
                        />
                        <span>{formatContentType(type)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Categories Filter */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => toggleFilter('categories', category)}
                          className="mr-2 h-4 w-4 accent-primary"
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="flex-1">
              {/* Result Summary */}
              <div className="bg-white border border-gray-200 p-4 mb-6">
                <p className="text-gray-600">
                  {searchTerm ? (
                    <>
                      {results.length} results for <span className="font-medium">&quot;{searchTerm}&quot;</span>
                    </>
                  ) : (
                    'Enter a search term to find content'
                  )}
                </p>
              </div>
              
              {/* Active Filters */}
              {(filters.types.length > 0 || filters.categories.length > 0) && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {filters.types.map(type => (
                      <div 
                        key={`type-${type}`}
                        className="flex items-center bg-primary/10 border border-primary/20 px-3 py-1"
                      >
                        <span className="mr-2">{formatContentType(type)}</span>
                        <button 
                          onClick={() => toggleFilter('types', type)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {filters.categories.map(category => (
                      <div 
                        key={`category-${category}`}
                        className="flex items-center bg-primary/10 border border-primary/20 px-3 py-1"
                      >
                        <span className="mr-2">{category}</span>
                        <button 
                          onClick={() => toggleFilter('categories', category)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Results List */}
              {results.length > 0 ? (
                <div className="space-y-6">
                  {results.map((result) => (
                    <div key={result.id} className="bg-white border border-gray-200">
                      <div className={`flex flex-col md:flex-row`}>
                        {/* Image for publications/events/experts */}
                        {result.image && (
                          <div className="md:w-1/4 flex-shrink-0">
                            <div className="relative h-48 md:h-full">
                              <Image
                                src={result.image}
                                alt={result.title}
                                fill
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className={`p-6 flex-1 ${!result.image ? 'md:border-l border-gray-200' : ''}`}>
                          {/* Type and Category */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <div className="flex items-center bg-primary/10 text-primary text-sm px-2 py-1">
                              {getTypeIcon(result.type)}
                              <span>{formatContentType(result.type)}</span>
                            </div>
                            
                            {result.category && (
                              <div className="bg-gray-100 text-gray-700 text-sm px-2 py-1">
                                {result.category}
                              </div>
                            )}
                          </div>
                          
                          {/* Title and Date */}
                          <Link href={result.url}>
                            <h2 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors mb-1">
                              {result.title}
                            </h2>
                          </Link>
                          
                          {result.date && (
                            <p className="text-sm text-gray-500 mb-2">{result.date}</p>
                          )}
                          
                          {/* Description */}
                          <p className="text-gray-600 mb-4">{result.description}</p>
                          
                          {/* Tags */}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {result.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                searchTerm ? (
                  <div className="bg-white border border-gray-200 p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <FiSearch className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn&apos;t find any content matching &quot;{searchTerm}&quot;.
                    </p>
                    <div className="max-w-md mx-auto">
                      <h4 className="font-medium text-gray-700 mb-2">Suggestions:</h4>
                      <ul className="text-gray-600 text-left list-disc pl-5 space-y-1">
                        <li>Check your spelling</li>
                        <li>Try using different or more general keywords</li>
                        <li>Try removing filters</li>
                        <li>Browse our <Link href="/publications" className="text-primary hover:underline">publications</Link> or <Link href="/events" className="text-primary hover:underline">events</Link></li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 p-8 text-center">
                    <p className="text-gray-600">
                      Enter a search term to see results
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

// Main page component with Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg text-gray-600">Loading search results...</h3>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
} 