'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiUser, 
  FiChevronDown, 
  FiChevronUp, 
  FiX,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

// API interfaces
interface PublicationAuthor {
  id: number;
  name: string;
  slug: string;
  position?: string;
  organization?: string;
  image?: string;
}

interface ApiPublication {
  id: number;
  title: string;
  slug: string;
  date_publish: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  authors: PublicationAuthor[];
  file?: string;
  image: string;
  topic?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  department?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  download_count?: number;
  viewed?: number;
  tags?: string[];
}

interface APIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiPublication[];
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  current_page?: number;
  total_pages?: number;
}

// Local publication interface
interface Publication {
  id: number;
  slug: string;
  title: string;
  category: string;
  type: string;
  author: string;
  date: string;
  excerpt: string;
  image: string;
  topics: string[];
  departments: string[];
  featured: boolean;
  download: string;
}

// Utility function to strip HTML tags
const stripHtml = (html: string): string => {
  if (typeof window !== 'undefined') {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  // Server-side fallback
  return html.replace(/<[^>]*>/g, '');
};

// Utility function to format authors
const formatAuthors = (authors: PublicationAuthor[]): string => {
  if (!authors || authors.length === 0) return 'Unknown';
  
  if (authors.length === 1) {
    return authors[0].name;
  }
  
  const firstAuthor = authors[0].name;
  const remainingCount = authors.length - 1;
  return `${firstAuthor}, +${remainingCount} more`;
};

export default function Publications() {
  // Form state (what user is currently selecting)
  const [searchQuery, setSearchQuery] = useState('');
  const [tempFilters, setTempFilters] = useState<{
    departments: string[];
    topics: string[];
    years: string[];
  }>({
    departments: [],
    topics: [],
    years: [],
  });

  // Applied filters state (what's actually being used for API calls)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    departments: string[];
    topics: string[];
    years: string[];
  }>({
    departments: [],
    topics: [],
    years: [],
  });
  
  const [expandedFilters, setExpandedFilters] = useState({
    departments: true,
    topics: false,
    years: true,
  });
  
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [featuredPublication, setFeaturedPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [previousCursor, setPreviousCursor] = useState<string | null>(null);
  const [pageSize] = useState(12);
  
  // Available filter options (will be populated from API)
  const [filterOptions, setFilterOptions] = useState<{
    departments: string[];
    topics: string[];
    years: string[];
  }>({
    departments: [],
    topics: [],
    years: [],
  });

  // Build API URL with filters and pagination
  const buildApiUrl = useCallback((cursor: string | null = null, resetPagination: boolean = false) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/publications/`;
    const params = new URLSearchParams();
    
    params.set('page_size', pageSize.toString());
    
    if (cursor && !resetPagination) {
      params.set('cursor', cursor);
    }
    
    if (appliedSearchQuery.trim()) {
      params.set('search', appliedSearchQuery.trim());
    }
    
    if (appliedFilters.departments.length > 0) {
      appliedFilters.departments.forEach(department => {
        params.append('department', department.toLowerCase().replace(/\s+/g, '-'));
      });
    }
    
    if (appliedFilters.topics.length > 0) {
      appliedFilters.topics.forEach(topic => {
        params.append('topic', topic.toLowerCase().replace(/\s+/g, '-'));
      });
    }
    
    if (appliedFilters.years.length > 0) {
      appliedFilters.years.forEach(year => {
        params.append('date_publish__year', year);
      });
    }
    
    return `${baseUrl}?${params.toString()}`;
  }, [appliedSearchQuery, appliedFilters, pageSize]);

  // Fetch publications from API
  const fetchPublications = useCallback(async (cursor: string | null = null, resetPagination: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = buildApiUrl(cursor, resetPagination);
      console.log('Fetching:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch publications: ${response.status}`);
      }
      
      const data: APIResponse = await response.json();
      setApiResponse(data);
      
      // Convert API data to our format
      const convertedPublications: Publication[] = (data.results || []).map((pub: ApiPublication) => ({
        id: pub.id,
        slug: pub.slug,
        title: pub.title,
        category: pub.category?.name || 'Uncategorized',
        type: pub.category?.name || 'Publication',
        author: formatAuthors(pub.authors || []),
        date: new Date(pub.date_publish).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        excerpt: stripHtml(pub.description || '').substring(0, 200) + '...' || '',
        image: pub.image,
        topics: pub.topic?.map(t => t.name) || [],
        departments: pub.department?.map(d => d.name) || [],
        featured: false,
        download: pub.file || '',
      }));
      
      setPublications(convertedPublications);
      
      // Set featured publication (first one)
      if (convertedPublications.length > 0 && resetPagination) {
        setFeaturedPublication(convertedPublications[0]);
      }
      
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [buildApiUrl]);

  // Fetch filter options from API
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch a large sample to get all available filter options
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/publications/?page_size=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      
      const data: APIResponse = await response.json();
      
      // Extract unique departments, topics, and years
      const departments = Array.from(new Set(
        data.results
          .flatMap(pub => pub.department?.map(d => d.name) || [])
          .filter(Boolean)
      )).sort();
      
      const topics = Array.from(new Set(
        data.results
          .flatMap(pub => pub.topic?.map(t => t.name) || [])
          .filter(Boolean)
      )).sort();
      
      const years = Array.from(new Set(
        data.results
          .map(pub => new Date(pub.date_publish).getFullYear().toString())
          .filter(Boolean)
      )).sort((a, b) => b.localeCompare(a)); // Sort years descending
      
      setFilterOptions({ departments, topics, years });
      
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
    fetchPublications(null, true);
  }, [fetchFilterOptions, fetchPublications]);

  // Apply filters function
  const applyFilters = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedFilters(tempFilters);
    setCurrentCursor(null);
    setPreviousCursor(null);
  };

  // Effect to fetch publications when applied filters change
  useEffect(() => {
    fetchPublications(null, true);
  }, [appliedSearchQuery, appliedFilters, fetchPublications]);

  const toggleTempFilter = (type: 'departments' | 'topics' | 'years', value: string) => {
    setTempFilters(prev => {
      const currentFilters = prev[type];
      const updatedFilters = currentFilters.includes(value)
        ? currentFilters.filter(item => item !== value)
        : [...currentFilters, value];
      
      return {
        ...prev,
        [type]: updatedFilters,
      };
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTempFilters({
      departments: [],
      topics: [],
      years: [],
    });
    setAppliedSearchQuery('');
    setAppliedFilters({
      departments: [],
      topics: [],
      years: [],
    });
  };

  const toggleFilterSection = (section: 'departments' | 'topics' | 'years') => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const countAppliedFilters = () => {
    return (
      appliedFilters.departments.length +
      appliedFilters.topics.length +
      appliedFilters.years.length +
      (appliedSearchQuery.trim() ? 1 : 0)
    );
  };

  const countTempFilters = () => {
    return (
      tempFilters.departments.length +
      tempFilters.topics.length +
      tempFilters.years.length +
      (searchQuery.trim() ? 1 : 0)
    );
  };

  // Check if there are unapplied changes
  const hasUnappliedChanges = () => {
    return (
      searchQuery !== appliedSearchQuery ||
      JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters)
    );
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (apiResponse?.next) {
      const url = new URL(apiResponse.next);
      const cursor = url.searchParams.get('cursor');
      if (cursor) {
        setPreviousCursor(currentCursor);
        setCurrentCursor(cursor);
        fetchPublications(cursor);
      }
    }
  };

  const goToPreviousPage = () => {
    if (apiResponse?.previous) {
      const url = new URL(apiResponse.previous);
      const cursor = url.searchParams.get('cursor');
      setPreviousCursor(null);
      setCurrentCursor(cursor);
      fetchPublications(cursor);
    }
  };

  return (
    <>
      <main className="">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 !text-white">Publications</h1>
              <p className="text-xl max-w-3xl mx-auto">
                Explore our research publications, policy papers, commentaries, and working papers to
                gain insights into Indonesia&apos;s key policy issues and regional developments.
              </p>
            </div>
          </div>
        </section>
        
        {/* Loading State */}
        {isLoading && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
                      <div className="h-6 bg-gray-200 animate-pulse mb-4"></div>
                      <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Publication */}
        {!isLoading && featuredPublication && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-primary mb-8">Latest Publication</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="relative h-64 md:h-full">
                      <Image
                        src={featuredPublication.image || '/bg/default-publication.jpg'}
                        alt={featuredPublication.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="bg-primary text-white px-2 py-1 rounded text-xs mr-3">
                        {featuredPublication.category}
                      </span>
                      <div className="flex items-center mr-3">
                        <FiUser className="mr-1" />
                        <span>{featuredPublication.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        <span>{featuredPublication.date}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {featuredPublication.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {featuredPublication.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPublication.topics.slice(0, 3).map(topic => (
                        <span
                          key={topic}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                      {featuredPublication.topics.length > 3 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{featuredPublication.topics.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Link
                        href={`/publication/${featuredPublication.slug}`}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Error State */}
        {!isLoading && error && !publications.length && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Publications</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchPublications(null, true)}
                  className="inline-flex items-center text-accent hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        )}
        
        {/* Publications List with Filters */}
        {!isLoading && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex">
                {/* Filter Sidebar */}
                <div className="md:w-1/4 md:pr-8 mb-8 md:mb-0">
                  <div className="sticky top-24">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                        {countTempFilters() > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-sm text-accent hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      
                      {/* Search */}
                      <div className="mb-6">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search publications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Department Filter */}
                      <div className="mb-4 border-b border-gray-200 pb-4">
                        <button
                          className="flex w-full justify-between items-center text-left"
                          onClick={() => toggleFilterSection('departments')}
                        >
                          <h4 className="font-medium text-gray-900">Departments</h4>
                          {expandedFilters.departments ? (
                            <FiChevronUp className="text-gray-500" />
                          ) : (
                            <FiChevronDown className="text-gray-500" />
                          )}
                        </button>
                        
                        {expandedFilters.departments && (
                          <div className="mt-2 space-y-2">
                            {filterOptions.departments.map(department => (
                              <div key={department} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`department-${department}`}
                                  checked={tempFilters.departments.includes(department)}
                                  onChange={() => toggleTempFilter('departments', department)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor={`department-${department}`} className="ml-2 text-sm text-gray-700">
                                  {department}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Topics Filter */}
                      <div className="mb-4 border-b border-gray-200 pb-4">
                        <button
                          className="flex w-full justify-between items-center text-left"
                          onClick={() => toggleFilterSection('topics')}
                        >
                          <h4 className="font-medium text-gray-900">Topics</h4>
                          {expandedFilters.topics ? (
                            <FiChevronUp className="text-gray-500" />
                          ) : (
                            <FiChevronDown className="text-gray-500" />
                          )}
                        </button>
                        
                        {expandedFilters.topics && (
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                            {filterOptions.topics.slice(0, 20).map(topic => (
                              <div key={topic} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`topic-${topic}`}
                                  checked={tempFilters.topics.includes(topic)}
                                  onChange={() => toggleTempFilter('topics', topic)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor={`topic-${topic}`} className="ml-2 text-sm text-gray-700">
                                  {topic}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Year Filter */}
                      <div className="mb-6">
                        <button
                          className="flex w-full justify-between items-center text-left"
                          onClick={() => toggleFilterSection('years')}
                        >
                          <h4 className="font-medium text-gray-900">Year</h4>
                          {expandedFilters.years ? (
                            <FiChevronUp className="text-gray-500" />
                          ) : (
                            <FiChevronDown className="text-gray-500" />
                          )}
                        </button>
                        
                        {expandedFilters.years && (
                          <div className="mt-2 space-y-2">
                            {filterOptions.years.map(year => (
                              <div key={year} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`year-${year}`}
                                  checked={tempFilters.years.includes(year)}
                                  onChange={() => toggleTempFilter('years', year)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor={`year-${year}`} className="ml-2 text-sm text-gray-700">
                                  {year}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Apply Filters Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={applyFilters}
                          disabled={!hasUnappliedChanges()}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            hasUnappliedChanges()
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Apply Filters
                          {countTempFilters() > 0 && ` (${countTempFilters()})`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Publications List */}
                <div className="md:w-3/4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">
                      All Publications
                      {apiResponse && (
                        <span className="text-lg font-normal text-gray-600">
                          {' '}({apiResponse.count} results)
                        </span>
                      )}
                    </h2>
                    
                    {countAppliedFilters() > 0 && (
                      <div className="hidden md:flex items-center text-sm text-gray-600">
                        <FiFilter className="mr-2" />
                        <span>{countAppliedFilters()} filters applied</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Applied Filters */}
                  {countAppliedFilters() > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {appliedSearchQuery && (
                        <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full text-sm">
                          <span className="mr-2">Search: "{appliedSearchQuery}"</span>
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setAppliedSearchQuery('');
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      )}

                      {appliedFilters.departments.map(department => (
                        <div 
                          key={`filter-${department}`} 
                          className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="mr-2">{department}</span>
                          <button 
                            onClick={() => {
                              const newDepartments = appliedFilters.departments.filter(d => d !== department);
                              setTempFilters(prev => ({ ...prev, departments: newDepartments }));
                              setAppliedFilters(prev => ({ ...prev, departments: newDepartments }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {appliedFilters.topics.map(topic => (
                        <div 
                          key={`filter-${topic}`} 
                          className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="mr-2">{topic}</span>
                          <button 
                            onClick={() => {
                              const newTopics = appliedFilters.topics.filter(t => t !== topic);
                              setTempFilters(prev => ({ ...prev, topics: newTopics }));
                              setAppliedFilters(prev => ({ ...prev, topics: newTopics }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {appliedFilters.years.map(year => (
                        <div 
                          key={`filter-${year}`} 
                          className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="mr-2">{year}</span>
                          <button 
                            onClick={() => {
                              const newYears = appliedFilters.years.filter(y => y !== year);
                              setTempFilters(prev => ({ ...prev, years: newYears }));
                              setAppliedFilters(prev => ({ ...prev, years: newYears }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={clearAllFilters}
                        className="text-accent hover:underline text-sm ml-2"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                  
                  {/* No Results */}
                  {!isLoading && publications.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No publications found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search or filter criteria to find what you&apos;re looking for.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="text-accent hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                  
                  {/* Publication Cards */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {publications.map((publication, index) => (
                      <motion.div
                        key={publication.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <Image
                            src={publication.image || '/bg/default-publication.jpg'}
                            alt={publication.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center text-xs text-gray-600 mb-3">
                            <span className="bg-primary text-white px-2 py-1 rounded text-xs mr-3">
                              {publication.category}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                            {publication.title}
                          </h3>
                          
                          <div className="flex items-center text-gray-600 text-xs mb-2">
                            <div className="flex items-center mr-3">
                              <FiUser className="mr-1" />
                              <span>{publication.author}</span>
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="mr-1" />
                              <span>{publication.date}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {publication.excerpt}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {publication.topics.slice(0, 2).map(topic => (
                              <button
                                key={topic}
                                onClick={() => {
                                  if (!tempFilters.topics.includes(topic)) {
                                    setTempFilters(prev => ({
                                      ...prev,
                                      topics: [...prev.topics, topic]
                                    }));
                                  }
                                }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full transition-colors"
                              >
                                {topic}
                              </button>
                            ))}
                            {publication.topics.length > 2 && (
                              <span className="text-gray-500 text-xs px-2 py-1">
                                +{publication.topics.length - 2} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/publication/${publication.slug}`}
                              className="text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              Read More →
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {apiResponse && (apiResponse.has_next || apiResponse.has_previous) && (
                    <div className="mt-10 flex justify-center items-center space-x-4">
                      <button
                        onClick={goToPreviousPage}
                        disabled={!apiResponse.has_previous || isLoading}
                        className={`flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                          apiResponse.has_previous && !isLoading
                            ? 'text-gray-700 bg-white hover:bg-gray-50'
                            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        <FiChevronLeft className="mr-2" />
                        Previous
                      </button>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span>
                          Showing {publications.length} of {apiResponse.count} publications
                        </span>
                      </div>
                      
                      <button
                        onClick={goToNextPage}
                        disabled={!apiResponse.has_next || isLoading}
                        className={`flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                          apiResponse.has_next && !isLoading
                            ? 'text-gray-700 bg-white hover:bg-gray-50'
                            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        Next
                        <FiChevronRight className="ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </>
  );
} 