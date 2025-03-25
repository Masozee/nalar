'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiUser, 
  FiChevronDown, 
  FiChevronUp, 
  FiX,
  FiDownload
} from 'react-icons/fi';

// Mock data - would be replaced with actual API data
const PUBLICATIONS = [
  {
    id: 1,
    slug: 'understanding-indonesias-foreign-policy',
    title: 'Understanding Indonesia\'s Foreign Policy Positioning in the Indo-Pacific',
    category: 'International Relations',
    type: 'Policy Brief',
    author: 'Dr. Lina Alexandra',
    date: 'May 15, 2024',
    excerpt: 'Analyzing Indonesia\'s strategic approach to regional diplomacy within the evolving Indo-Pacific framework.',
    image: '/bg/isaac-struna-rjJHmBCHIU8-unsplash.png',
    topics: ['Foreign Policy', 'Regional Cooperation', 'Indo-Pacific Strategy', 'ASEAN', 'South China Sea'],
    featured: true,
    download: '/documents/policy-brief-indonesia-foreign-policy.pdf',
  },
  {
    id: 2,
    slug: 'asean-digital-integration',
    title: 'Economic Implications of ASEAN Digital Integration',
    category: 'Economics',
    type: 'Research Report',
    author: 'Dr. Yose Rizal Damuri',
    date: 'April 28, 2024',
    excerpt: 'Examining the opportunities and challenges presented by ASEAN\'s digital integration initiatives for Indonesia\'s economy.',
    image: '/bg/fabian-kurz-XO5cK6-qrLg-unsplash.png',
    topics: ['Digital Economy', 'ASEAN', 'Economic Integration'],
    featured: false,
    download: '/documents/asean-digital-integration.pdf',
  },
  {
    id: 3,
    slug: 'climate-change-policy',
    title: 'Indonesia\'s Climate Change Policy: Analysis and Recommendations',
    category: 'Climate & Sustainability',
    type: 'Policy Brief',
    author: 'Dr. Arief Wijaya',
    date: 'April 10, 2024',
    excerpt: 'A comprehensive analysis of Indonesia\'s climate change policies and recommended enhancements for achieving carbon reduction targets.',
    image: '/bg/matt-palmer-veMnvjmfoxw-unsplash.png',
    topics: ['Climate Change', 'Sustainability', 'Environmental Policy'],
    featured: false,
    download: '/documents/indonesia-climate-policy.pdf',
  },
  {
    id: 4,
    slug: 'digital-economy-growth',
    title: 'Digital Economy Growth and Future Prospects in Indonesia',
    category: 'Economics',
    type: 'Working Paper',
    author: 'Dr. Titik Anas',
    date: 'March 30, 2024',
    excerpt: 'Analyzing the factors driving Indonesia\'s digital economy growth and projecting future trends in the sector.',
    image: '/bg/carlos-muza-hpjSkU2UYSU-unsplash.png',
    topics: ['Digital Economy', 'Economic Development', 'Technology'],
    featured: false,
    download: '/documents/digital-economy-growth.pdf',
  },
  {
    id: 5,
    slug: 'human-capital-development',
    title: 'Human Capital Development in Post-Pandemic Indonesia',
    category: 'Society',
    type: 'Research Report',
    author: 'Dr. Yudi Saptono',
    date: 'March 22, 2024',
    excerpt: 'Examining the challenges and opportunities for human capital development in Indonesia following the COVID-19 pandemic.',
    image: '/bg/clay-banks-POzx_amnWJw-unsplash.png',
    topics: ['Human Capital', 'Education', 'Post-Pandemic Recovery'],
    featured: true,
    download: '/documents/human-capital-development.pdf',
  },
  {
    id: 6,
    slug: 'south-china-sea-security',
    title: 'Security Implications of South China Sea Disputes',
    category: 'Security',
    type: 'Commentary',
    author: 'Dr. Evan Laksmana',
    date: 'March 15, 2024',
    excerpt: 'Analysis of recent developments in the South China Sea and implications for regional security architecture.',
    image: '/bg/matt-artz-pH6-ACaPdnk-unsplash.png',
    topics: ['Maritime Security', 'South China Sea', 'Regional Disputes'],
    featured: false,
    download: '/documents/south-china-sea-security.pdf',
  },
  {
    id: 7,
    slug: 'indonesia-eu-relations',
    title: 'The Future of Indonesia-EU Economic Relations',
    category: 'Economics',
    type: 'Research Report',
    author: 'Dr. Josef Yap',
    date: 'February 28, 2024',
    excerpt: 'Examining opportunities for enhanced economic cooperation between Indonesia and the European Union.',
    image: '/bg/sergey-pesterev-JV78PVf3gGI-unsplash.png',
    topics: ['Trade', 'International Economics', 'EU Relations'],
    featured: false,
    download: '/documents/indonesia-eu-relations.pdf',
  },
  {
    id: 8,
    slug: 'political-polarization',
    title: 'Political Polarization and Democratic Resilience',
    category: 'Politics',
    type: 'Working Paper',
    author: 'Dr. Philips Vermonte',
    date: 'February 15, 2024',
    excerpt: 'Analyzing patterns of political polarization in Indonesia and their implications for democratic resilience.',
    image: '/bg/hasan-almasi-nKNQINgcWvI-unsplash.png',
    topics: ['Democracy', 'Political Polarization', 'Governance'],
    featured: false,
    download: '/documents/political-polarization.pdf',
  }
];

// Extract unique filters
const categories = Array.from(new Set(PUBLICATIONS.map(pub => pub.category))).sort();
const types = Array.from(new Set(PUBLICATIONS.map(pub => pub.type))).sort();
const years = Array.from(
  new Set(PUBLICATIONS.map(pub => new Date(pub.date).getFullYear().toString()))
).sort((a, b) => b.localeCompare(a)); // Sort years descending

const allTopics = PUBLICATIONS.flatMap(pub => pub.topics);
const topicsCount = allTopics.reduce((acc: Record<string, number>, topic) => {
  acc[topic] = (acc[topic] || 0) + 1;
  return acc;
}, {});

const topics = Object.entries(topicsCount)
  .sort((a, b) => b[1] - a[1]) // Sort by frequency
  .map(([topic]) => topic);

export default function Publications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    categories: string[];
    types: string[];
    topics: string[];
    years: string[];
  }>({
    categories: [],
    types: [],
    topics: [],
    years: [],
  });
  
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    types: true,
    topics: false,
    years: true,
  });
  
  const [filteredPublications, setFilteredPublications] = useState(PUBLICATIONS);
  const [featuredPublication, setFeaturedPublication] = useState<typeof PUBLICATIONS[0] | null>(null);
  
  useEffect(() => {
    // Find a featured publication
    const featured = PUBLICATIONS.find(pub => pub.featured);
    setFeaturedPublication(featured || PUBLICATIONS[0]);
    
    // Apply filters
    let results = [...PUBLICATIONS];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        pub => 
          pub.title.toLowerCase().includes(query) ||
          pub.excerpt.toLowerCase().includes(query) ||
          pub.author.toLowerCase().includes(query) ||
          pub.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Category filter
    if (activeFilters.categories.length > 0) {
      results = results.filter(pub => activeFilters.categories.includes(pub.category));
    }
    
    // Type filter
    if (activeFilters.types.length > 0) {
      results = results.filter(pub => activeFilters.types.includes(pub.type));
    }
    
    // Topic filter
    if (activeFilters.topics.length > 0) {
      results = results.filter(pub => 
        pub.topics.some(topic => activeFilters.topics.includes(topic))
      );
    }
    
    // Year filter
    if (activeFilters.years.length > 0) {
      results = results.filter(pub => 
        activeFilters.years.includes(new Date(pub.date).getFullYear().toString())
      );
    }
    
    setFilteredPublications(results);
  }, [searchQuery, activeFilters]);
  
  const toggleFilter = (type: 'categories' | 'types' | 'topics' | 'years', value: string) => {
    setActiveFilters(prev => {
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
    setActiveFilters({
      categories: [],
      types: [],
      topics: [],
      years: [],
    });
    setSearchQuery('');
  };
  
  const toggleFilterSection = (section: 'categories' | 'types' | 'topics' | 'years') => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const countActiveFilters = () => {
    return (
      activeFilters.categories.length +
      activeFilters.types.length +
      activeFilters.topics.length +
      activeFilters.years.length
    );
  };
  
  return (
    <>
      <NavBar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Publications</h1>
              <p className="text-xl max-w-3xl mx-auto">
                Explore our research publications, policy papers, commentaries, and working papers to
                gain insights into Indonesia&apos;s key policy issues and regional developments.
              </p>
            </div>
          </div>
        </section>
        
        {/* Featured Publication */}
        {featuredPublication && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-primary mb-8">Featured Publication</h2>
              
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-2/5 relative h-64 md:h-auto">
                    <Image
                      src={featuredPublication.image}
                      alt={featuredPublication.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="md:w-3/5 p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                        {featuredPublication.category}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {featuredPublication.type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-primary mb-3">
                      {featuredPublication.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <div className="flex items-center mr-4">
                        <FiUser className="mr-1" />
                        <span>{featuredPublication.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        <span>{featuredPublication.date}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      {featuredPublication.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPublication.topics.slice(0, 3).map((topic: string) => (
                        <span 
                          key={topic} 
                          className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
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
                        href={`/publications/${featuredPublication.slug}`}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md transition-colors"
                      >
                        Read More
                      </Link>
                      <a
                        href={featuredPublication.download}
                        className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-md transition-colors"
                        download
                      >
                        <FiDownload className="mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Publications List with Filters */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex">
              {/* Filter Sidebar */}
              <div className="md:w-1/4 md:pr-8 mb-8 md:mb-0">
                <div className="sticky top-24">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                      {countActiveFilters() > 0 && (
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
                          onChange={e => setSearchQuery(e.target.value)}
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
                    
                    {/* Category Filter */}
                    <div className="mb-4 border-b border-gray-200 pb-4">
                      <button
                        className="flex w-full justify-between items-center text-left"
                        onClick={() => toggleFilterSection('categories')}
                      >
                        <h4 className="font-medium text-gray-900">Categories</h4>
                        {expandedFilters.categories ? (
                          <FiChevronUp className="text-gray-500" />
                        ) : (
                          <FiChevronDown className="text-gray-500" />
                        )}
                      </button>
                      
                      {expandedFilters.categories && (
                        <div className="mt-2 space-y-2">
                          {categories.map(category => (
                            <div key={category} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`category-${category}`}
                                checked={activeFilters.categories.includes(category)}
                                onChange={() => toggleFilter('categories', category)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Type Filter */}
                    <div className="mb-4 border-b border-gray-200 pb-4">
                      <button
                        className="flex w-full justify-between items-center text-left"
                        onClick={() => toggleFilterSection('types')}
                      >
                        <h4 className="font-medium text-gray-900">Publication Types</h4>
                        {expandedFilters.types ? (
                          <FiChevronUp className="text-gray-500" />
                        ) : (
                          <FiChevronDown className="text-gray-500" />
                        )}
                      </button>
                      
                      {expandedFilters.types && (
                        <div className="mt-2 space-y-2">
                          {types.map(type => (
                            <div key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`type-${type}`}
                                checked={activeFilters.types.includes(type)}
                                onChange={() => toggleFilter('types', type)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                                {type}
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
                        <div className="mt-2 space-y-2">
                          {topics.slice(0, 15).map(topic => (
                            <div key={topic} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`topic-${topic}`}
                                checked={activeFilters.topics.includes(topic)}
                                onChange={() => toggleFilter('topics', topic)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <label htmlFor={`topic-${topic}`} className="ml-2 text-sm text-gray-700">
                                {topic} <span className="text-gray-400">({topicsCount[topic]})</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Year Filter */}
                    <div className="mb-4">
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
                          {years.map(year => (
                            <div key={year} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`year-${year}`}
                                checked={activeFilters.years.includes(year)}
                                onChange={() => toggleFilter('years', year)}
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
                  </div>
                </div>
              </div>
              
              {/* Publications List */}
              <div className="md:w-3/4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">
                    All Publications 
                    {filteredPublications.length !== PUBLICATIONS.length && (
                      <span className="text-lg font-normal text-gray-600">
                        {' '}({filteredPublications.length} results)
                      </span>
                    )}
                  </h2>
                  
                  {countActiveFilters() > 0 && (
                    <div className="hidden md:flex items-center text-sm text-gray-600">
                      <FiFilter className="mr-2" />
                      <span>{countActiveFilters()} filters applied</span>
                    </div>
                  )}
                </div>
                
                {/* Applied Filters */}
                {countActiveFilters() > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {activeFilters.categories.map(category => (
                      <div 
                        key={`filter-${category}`} 
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <span className="mr-2">{category}</span>
                        <button 
                          onClick={() => toggleFilter('categories', category)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {activeFilters.types.map(type => (
                      <div 
                        key={`filter-${type}`} 
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <span className="mr-2">{type}</span>
                        <button 
                          onClick={() => toggleFilter('types', type)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {activeFilters.topics.map(topic => (
                      <div 
                        key={`filter-${topic}`} 
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <span className="mr-2">{topic}</span>
                        <button 
                          onClick={() => toggleFilter('topics', topic)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {activeFilters.years.map(year => (
                      <div 
                        key={`filter-${year}`} 
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <span className="mr-2">{year}</span>
                        <button 
                          onClick={() => toggleFilter('years', year)}
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
                {filteredPublications.length === 0 && (
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
                  {filteredPublications.map(publication => (
                    <motion.div
                      key={publication.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-48">
                        <Image
                          src={publication.image}
                          alt={publication.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-primary/80 text-white text-xs px-3 py-1">
                          {publication.type}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                          <Link href={`/publications/${publication.slug}`} className="hover:underline">
                            {publication.title}
                          </Link>
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
                                if (!activeFilters.topics.includes(topic)) {
                                  toggleFilter('topics', topic);
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
                            href={`/publications/${publication.slug}`}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Read More →
                          </Link>
                          <span className="text-gray-300 mx-2">|</span>
                          <a
                            href={publication.download}
                            className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
                            download
                          >
                            <FiDownload className="mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Pagination placeholder - would be implemented with actual data */}
                {filteredPublications.length > 0 && (
                  <div className="mt-10 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-white bg-primary">
                        1
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        2
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        3
                      </button>
                      <span className="px-2 text-gray-500">...</span>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        8
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50">
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 