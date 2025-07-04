'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import api, { Event as ApiEvent } from '@/lib/api';
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiLock,
  FiUnlock,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
  FiGrid,
  FiList,
  FiSliders,
} from 'react-icons/fi';

// Define UI event interface
interface Event {
  id: number;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  accessType: 'public' | 'private';
  excerpt: string;
  image: string;
  topics: string[];
  featured: boolean;
  status: 'upcoming' | 'past';
  speakers: string[];
  registrationLink?: string;
  photos?: string[];
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const eventsPerPage = 8; // Number of events to display per page
  const [activeFilters, setActiveFilters] = useState<{
    eventTypes: string[];
    topics: string[];
  }>({
    eventTypes: [],
    topics: [],
  });
  
  const [expandedFilters, setExpandedFilters] = useState({
    eventTypes: true,
    topics: false,
  });
  
  // New state variables for the redesigned UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Pagination state
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);
  const [pageCursors, setPageCursors] = useState<{[key: number]: string | null}>({});
  
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiEvents, setApiEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  
  // Fetch events from API
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setIsLoading(true);
        // Use the updated API with page_size parameter
        const response = await api.fetchEvents(null, statusFilter !== 'all' ? statusFilter : undefined, 12);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        // Update current page and total pages from API response if available
        if (response.data.current_page) {
          setCurrentPage(response.data.current_page);
        }
        
        if (response.data.total_pages) {
          setTotalPages(response.data.total_pages);
        }
        
        // Transform API events to the format needed by the UI
        const transformedEvents = response.data.results.map((apiEvent: ApiEvent) => {
          // Extract date and time from API data
          const date = new Date(apiEvent.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Extract time information if available
          let timeInfo = 'TBD';
          if (apiEvent.time_start) {
            timeInfo = apiEvent.time_start;
            if (apiEvent.time_end) {
              timeInfo += ` - ${apiEvent.time_end}`;
            }
          }
          
          // Determine if event is upcoming based on date
          const isUpcoming = new Date(apiEvent.date) >= new Date();
          
          // Extract topics if available
          const topicData = (apiEvent as any).topic;
          const eventTopics = topicData && Array.isArray(topicData) && topicData.length > 0 
            ? topicData.map((t: any) => t.name || 'Research')
            : ['Research'];
          
          // Extract speakers
          const speakers: string[] = [];
          
          // Add speakers from the speaker array
          if (apiEvent.speaker && Array.isArray(apiEvent.speaker)) {
            speakers.push(...apiEvent.speaker.map((s: any) => s.name));
          }
          
          // Add opening speech speakers
          if (apiEvent.opening_speech && Array.isArray(apiEvent.opening_speech)) {
            speakers.push(...apiEvent.opening_speech.map((s: any) => s.name));
          }
          
          // Add closing remarks speakers
          if (apiEvent.closing_remarks && Array.isArray(apiEvent.closing_remarks)) {
            speakers.push(...apiEvent.closing_remarks.map((s: any) => s.name));
          }
          
          return {
            id: parseInt(apiEvent.id.toString()),
            slug: apiEvent.slug,
            title: apiEvent.title,
            date: date,
            time: timeInfo,
            location: apiEvent.location || 'TBD',
            eventType: apiEvent.isOnline ? 'Webinar' : 'In-Person Event',
            accessType: apiEvent.isOnline ? 'public' : 'private',
            excerpt: apiEvent.description?.substring(0, 150) || '',
            image: apiEvent.image || '/bg/muska-create-5MvNlQENWDM-unsplash.png',
            topics: eventTopics,
            featured: false,
            status: isUpcoming ? 'upcoming' : 'past',
            speakers: speakers,
            registrationLink: apiEvent.registrationLink,
            photos: apiEvent.photos || []
          } as Event;
        });
        
        setApiEvents(transformedEvents);
        
        // Store pagination information
        setNextCursor(response.data.next ? new URL(response.data.next).searchParams.get('cursor') : null);
        setPrevCursor(response.data.previous ? new URL(response.data.previous).searchParams.get('cursor') : null);
        setTotalEvents(response.data.count);
        
        // Update page numbers for pagination
        const totalPgs = Math.ceil(response.data.count / eventsPerPage);
        setTotalPages(totalPgs);
        
        // Extract unique event types and topics
        const types = Array.from(new Set(transformedEvents.map(event => event.eventType))).sort();
        const eventTopics = Array.from(new Set(transformedEvents.flatMap(event => event.topics))).sort();
        
        setEventTypes(types);
        setTopics(eventTopics);
        
        // Find a featured event from the API data
        const featured = transformedEvents.find(event => event.status === 'upcoming');
        setFeaturedEvent(featured || null);
        
        // Initialize filtered events with all events
        setFilteredEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventsData();
  }, [statusFilter]);
  
  // Apply filters when search or filter criteria change
  useEffect(() => {
    if (apiEvents.length === 0) return;
    
    // Apply filters
    let results = [...apiEvents];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        event => 
          event.title.toLowerCase().includes(query) ||
          event.excerpt.toLowerCase().includes(query) ||
          (event.speakers && event.speakers.some(speaker => speaker.toLowerCase().includes(query))) ||
          (event.topics && event.topics.some(topic => topic.toLowerCase().includes(query)))
      );
    }
    
    // Status filter (upcoming/past)
    if (statusFilter !== 'all') {
      results = results.filter(event => event.status === statusFilter);
    }
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Event type filter
    if (activeFilters.eventTypes.length > 0) {
      results = results.filter(event => 
        activeFilters.eventTypes.includes(event.eventType)
      );
    }
    
    // Topic filter
    if (activeFilters.topics.length > 0) {
      results = results.filter(event => 
        event.topics && event.topics.some(topic => activeFilters.topics.includes(topic))
      );
    }
    
    setFilteredEvents(results);
  }, [searchQuery, statusFilter, activeFilters, apiEvents]);
  
  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    count += activeFilters.eventTypes.length;
    count += activeFilters.topics.length;
    
    setActiveFilterCount(count);
  }, [searchQuery, statusFilter, activeFilters]);
  
  // Load more events with pagination
  const loadMoreEvents = async (direction: 'next' | 'prev' | 'specific', targetPage?: number) => {
    try {
      setIsLoadingMore(true);
      let cursor: string | null = null;
      
      if (direction === 'specific' && targetPage !== undefined) {
        // For specific page jumps, we'll need to calculate the cursor
        if (targetPage === 1) {
          // First page doesn't need a cursor
          cursor = null;
          // Don't set current page here, let the API response set it
        } else if (targetPage === currentPage) {
          // Same page, no need to load
          setIsLoadingMore(false);
          return;
        } else if (pageCursors[targetPage]) {
          // We have a stored cursor for this page
          cursor = pageCursors[targetPage];
          // Don't set current page here, let the API response set it
        } else if (targetPage === currentPage + 1) {
          // Next page
          cursor = nextCursor;
          // Don't set current page here, let the API response set it
        } else if (targetPage === currentPage - 1) {
          // Previous page
          cursor = prevCursor;
          // Don't set current page here, let the API response set it
        } else {
          // We don't have a direct cursor to the target page
          // This is a limitation of cursor-based pagination
          // For now, we'll just move one page at a time in the right direction
          if (targetPage > currentPage) {
            cursor = nextCursor;
            // Don't set current page here, let the API response set it
          } else {
            cursor = prevCursor;
            // Don't set current page here, let the API response set it
          }
        }
      } else {
        cursor = direction === 'next' ? nextCursor : prevCursor;
        if (!cursor) return;
      }
      
      const response = await api.fetchEvents(cursor, statusFilter !== 'all' ? statusFilter : undefined, 12);
      
      if (response.error) {
        console.error('Error loading more events:', response.error);
        return;
      }
      
      // Transform API events to the format needed by the UI
      const transformedEvents = response.data.results.map((apiEvent: ApiEvent) => {
        // Extract date and time from API data
        const date = new Date(apiEvent.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Extract time information if available
        let timeInfo = 'TBD';
        if (apiEvent.time_start) {
          timeInfo = apiEvent.time_start;
          if (apiEvent.time_end) {
            timeInfo += ` - ${apiEvent.time_end}`;
          }
        }
        
        // Determine if event is upcoming based on date
        const isUpcoming = new Date(apiEvent.date) >= new Date();
        
        // Extract topics if available
        const topicData = (apiEvent as any).topic;
        const eventTopics = topicData && Array.isArray(topicData) && topicData.length > 0 
          ? topicData.map((t: any) => t.name || 'Research')
          : ['Research'];
        
        // Extract speakers
        const speakers: string[] = [];
        
        // Add speakers from the speaker array
        if (apiEvent.speaker && Array.isArray(apiEvent.speaker)) {
          speakers.push(...apiEvent.speaker.map((s: any) => s.name));
        }
        
        // Add opening speech speakers
        if (apiEvent.opening_speech && Array.isArray(apiEvent.opening_speech)) {
          speakers.push(...apiEvent.opening_speech.map((s: any) => s.name));
        }
        
        // Add closing remarks speakers
        if (apiEvent.closing_remarks && Array.isArray(apiEvent.closing_remarks)) {
          speakers.push(...apiEvent.closing_remarks.map((s: any) => s.name));
        }
        
        return {
          id: parseInt(apiEvent.id.toString()),
          slug: apiEvent.slug,
          title: apiEvent.title,
          date: date,
          time: timeInfo,
          location: apiEvent.location || 'TBD',
          eventType: apiEvent.isOnline ? 'Webinar' : 'In-Person Event',
          accessType: apiEvent.isOnline ? 'public' : 'private',
          excerpt: apiEvent.description?.substring(0, 150) || '',
          image: apiEvent.image || '/bg/muska-create-5MvNlQENWDM-unsplash.png',
          topics: eventTopics,
          featured: false,
          status: isUpcoming ? 'upcoming' : 'past',
          speakers: speakers,
          registrationLink: apiEvent.registrationLink,
          photos: apiEvent.photos || []
        } as Event;
      });
      
      // Update pagination information
      const nextPageCursor = response.data.next ? new URL(response.data.next).searchParams.get('cursor') : null;
      const prevPageCursor = response.data.previous ? new URL(response.data.previous).searchParams.get('cursor') : null;
      
      setNextCursor(nextPageCursor);
      setPrevCursor(prevPageCursor);
      
      // Update current page and total pages from API response if available
      if (response.data.current_page) {
        setCurrentPage(response.data.current_page);
      }
      
      if (response.data.total_pages) {
        setTotalPages(response.data.total_pages);
      }
      
      // Store cursors for direct page access
      if (nextPageCursor && response.data.current_page) {
        setPageCursors(prev => ({
          ...prev,
          [response.data.current_page + 1]: nextPageCursor
        }));
      }
      
      if (prevPageCursor && response.data.current_page) {
        setPageCursors(prev => ({
          ...prev,
          [response.data.current_page - 1]: prevPageCursor
        }));
      }
      
      // Update events list
      setApiEvents(transformedEvents);
      setFilteredEvents(transformedEvents);
      
      // Current page is now updated from the API response, no need to manually update it here
      
      // Update page numbers array for pagination
      updatePageNumbers();
    } catch (err) {
      console.error('Error loading more events:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Helper function to generate page numbers for pagination display
  const updatePageNumbers = () => {
    if (totalEvents <= 0) return;
    
    // Use the totalPages state which is now set from the API response
    const totalPgs = totalPages;
    
    // Generate array of page numbers to display
    let pages: number[] = [];
    
    if (totalPgs <= 7) {
      // If we have 7 or fewer pages, show all page numbers
      pages = Array.from({ length: totalPgs }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      pages.push(1);
      
      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPgs - 1, currentPage + 1);
      
      // Add ellipsis before startPage if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after endPage if needed
      if (endPage < totalPgs - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Add last page
      pages.push(totalPgs);
    }
    
    setPageNumbers(pages);
    
    // Initialize page 1 cursor as null if not already set
    setPageCursors(prev => ({
      ...prev,
      1: prev[1] || null
    }));
    
    console.log(`Current page: ${currentPage}, Total pages: ${totalPgs}`);
  };
  
  // Call updatePageNumbers when totalEvents or currentPage changes
  useEffect(() => {
    updatePageNumbers();
    console.log('Current page updated:', currentPage);
  }, [totalEvents, currentPage]);
  
  // Toggle filter selection - keeping function but it won't be used since we're removing event type filters
  const toggleEventTypeFilter = (eventType: string) => {
    setActiveFilters(prev => {
      const isActive = prev.eventTypes.includes(eventType);
      return {
        ...prev,
        eventTypes: isActive
          ? prev.eventTypes.filter(type => type !== eventType)
          : [...prev.eventTypes, eventType]
      };
    });
  };
  
  const toggleTopicFilter = (topic: string) => {
    setActiveFilters(prev => {
      const isActive = prev.topics.includes(topic);
      return {
        ...prev,
        topics: isActive
          ? prev.topics.filter(t => t !== topic)
          : [...prev.topics, topic]
      };
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setActiveFilters({
      eventTypes: [],
      topics: []
    });
    setExpandedFilters({
      eventTypes: true,
      topics: false
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchQuery !== '' ||
      statusFilter !== 'all' ||
      activeFilters.eventTypes.length > 0 ||
      activeFilters.topics.length > 0
    );
  };
  
  // Toggle expanded state for filter sections
  const toggleFilterSection = (section: 'eventTypes' | 'topics') => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
        <Image
          src="/bg/muska-create-5MvNlQENWDM-unsplash.png"
          alt="Events"
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
            Events
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-green-100 max-w-2xl"
          >
            Join our upcoming events, conferences, and workshops focused on policy research and international affairs.
          </motion.p>
        </div>
      </section>
      
      {/* Featured Event */}
      {featuredEvent && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Event</h2>
            <div className="h-px flex-grow bg-[#005357]/20 ml-4"></div>
          </div>
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#005357]/10">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-[350px] md:h-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-[#005357]/70 to-transparent z-10" />
                <Image 
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 md:hidden">
                  <h3 className="text-2xl font-bold mb-2 text-white">{featuredEvent.title}</h3>
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-4">{featuredEvent.title}</h3>
                
                <div className="flex flex-col space-y-3 mb-6">
                  <div className="flex items-center text-[#005357]">
                    <FiCalendar className="mr-2 text-[#005357]" />
                    <span>{featuredEvent.date}</span>
                  </div>
                  
                  <div className="flex items-center text-[#005357]">
                    <FiClock className="mr-2 text-[#005357]" />
                    <span>{featuredEvent.time}</span>
                  </div>
                  
                  <div className="flex items-center text-[#005357]">
                    <FiMapPin className="mr-2 text-[#005357]" />
                    <span>{featuredEvent.location}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredEvent.topics.map((topic, index) => (
                    <span key={index} className="bg-[#e6f0f0] text-[#005357] text-xs font-medium px-2.5 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href={`/events/${featuredEvent.slug}`} 
                    className="inline-block bg-[#005357] hover:bg-[#003e40] text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    View Details
                  </Link>
                  
                  {featuredEvent.registrationLink && (
                    <a 
                      href={featuredEvent.registrationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-[#e6f0f0] hover:bg-[#d0e6e6] text-[#005357] font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Register
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
      
      {/* Events List Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold mr-4">
                {statusFilter === 'upcoming' ? 'Upcoming Events' : 
                 statusFilter === 'past' ? 'Past Events' : 'All Events'}
              </h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#005357] text-white text-xs font-medium rounded-full">
                  {activeFilterCount}
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
                  placeholder="Search events..."
                />
              </div>
              
              <div className="hidden md:flex items-center bg-[#e6f0f0] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-[#005357]'}`}
                >
                  <FiGrid className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-[#005357]'}`}
                >
                  <FiList className="text-lg" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Inline Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Status Filter Pills */}
            <div className="flex items-center mr-2">
              <span className="text-sm font-medium text-[#005357] mr-2">Status:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    statusFilter === 'all' 
                      ? 'bg-[#005357] text-white' 
                      : 'bg-[#e6f0f0] text-[#005357] hover:bg-[#d0e6e6]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('upcoming')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    statusFilter === 'upcoming' 
                      ? 'bg-[#005357] text-white' 
                      : 'bg-[#e6f0f0] text-[#005357] hover:bg-[#d0e6e6]'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setStatusFilter('past')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    statusFilter === 'past' 
                      ? 'bg-[#005357] text-white' 
                      : 'bg-[#e6f0f0] text-[#005357] hover:bg-[#d0e6e6]'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
            
            {/* Topics Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleFilterSection('topics')}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-[#e6f0f0] text-[#005357] hover:bg-[#d0e6e6] transition-colors"
              >
                Topics {activeFilters.topics.length > 0 && `(${activeFilters.topics.length})`}
                {expandedFilters.topics ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {expandedFilters.topics && (
                <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg shadow-lg border border-[#005357]/10 p-3">
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => toggleTopicFilter(topic)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          activeFilters.topics.includes(topic) 
                            ? 'bg-[#005357] text-white' 
                            : 'bg-[#e6f0f0] text-[#005357] hover:bg-[#d0e6e6]'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Reset Button */}
            {hasActiveFilters() && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-full text-[#005357] hover:bg-[#e6f0f0] transition-colors ml-auto"
              >
                <FiX className="mr-1" />
                Reset
              </button>
            )}
          </div>
        </div>
          
        {/* Events List Content */}
        <div>
          <p className="text-gray-600 mb-6">{filteredEvents.length} events found</p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mb-6">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
              <p className="text-blue-800 mb-4">No events found matching your criteria.</p>
              <button 
                onClick={resetFilters} 
                className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 bg-white rounded-lg shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-[#005357]/10 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#005357]/70 via-[#005357]/20 to-transparent z-10" />
                    <Image 
                      src={event.image}
                      alt={event.title}
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        event.status === 'upcoming' 
                          ? 'bg-[#e6f0f0] text-[#005357]' 
                          : 'bg-white/80 text-[#005357]'
                      }`}>
                        {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-grow">
                    <h3 className="text-lg font-bold mb-3 text-[#005357]">{event.title}</h3>
                    
                    <div className="flex flex-col space-y-1 mb-3 text-sm">
                      <div className="flex items-center text-[#005357]">
                        <FiCalendar className="mr-2 text-[#005357]" />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="flex items-center text-[#005357]">
                        <FiClock className="mr-2 text-[#005357]" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-[#005357]">
                        <FiMapPin className="mr-2 text-[#005357]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      
                      {event.speakers && event.speakers.length > 0 && (
                        <div className="flex items-start text-[#005357]">
                          <FiUsers className="mr-2 mt-1 flex-shrink-0 text-[#005357]" />
                          <span className="truncate">{event.speakers.slice(0, 2).join(', ')}
                            {event.speakers.length > 2 && ` +${event.speakers.length - 2}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {event.topics && event.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {event.topics.slice(0, 2).map((topic, index) => (
                          <span key={index} className="bg-[#e6f0f0] text-[#005357] text-xs px-2 py-0.5 rounded">
                            {topic}
                          </span>
                        ))}
                        {event.topics.length > 2 && (
                          <span className="bg-[#e6f0f0] text-[#005357] text-xs px-2 py-0.5 rounded">+{event.topics.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 pb-4 mt-auto">
                    <Link 
                      href={`/events/${event.slug}`}
                      className="inline-block bg-[#005357] hover:bg-[#003e40] text-white font-medium py-2 px-4 rounded-lg transition duration-300 w-full text-center text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredEvents.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#005357]/10 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-1/4 relative h-48 md:h-auto">
                      <Image 
                        src={event.image}
                        alt={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r md:bg-gradient-to-l from-transparent to-[#005357]/30" />
                    </div>
                    
                    <div className="p-6 md:w-3/4">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                          event.status === 'upcoming' 
                            ? 'bg-[#e6f0f0] text-[#005357]' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 text-[#005357]">{event.title}</h3>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                        <div className="flex items-center text-[#005357]">
                          <FiCalendar className="mr-2 text-[#005357]" />
                          <span>{event.date}</span>
                        </div>
                        
                        <div className="flex items-center text-[#005357]">
                          <FiClock className="mr-2 text-[#005357]" />
                          <span>{event.time}</span>
                        </div>
                        
                        <div className="flex items-center text-[#005357]">
                          <FiMapPin className="mr-2 text-[#005357]" />
                          <span>{event.location}</span>
                        </div>
                        
                        {event.speakers && event.speakers.length > 0 && (
                          <div className="flex items-center text-[#005357]">
                            <FiUsers className="mr-2 text-[#005357]" />
                            <span className="truncate">{event.speakers.slice(0, 2).join(', ')}
                              {event.speakers.length > 2 && ` +${event.speakers.length - 2}`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {event.topics && event.topics.slice(0, 3).map((topic, index) => (
                            <span key={index} className="bg-[#e6f0f0] text-[#005357] text-xs px-2 py-0.5 rounded">
                              {topic}
                            </span>
                          ))}
                          {event.topics && event.topics.length > 3 && (
                            <span className="bg-[#e6f0f0] text-[#005357] text-xs px-2 py-0.5 rounded">+{event.topics.length - 3}</span>
                          )}
                        </div>
                        
                        <Link 
                          href={`/events/${event.slug}`}
                          className="inline-block bg-[#005357] hover:bg-[#003e40] text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="flex justify-center mt-8 mb-12">
              <nav className="flex items-center space-x-2">
                {/* Previous page button */}
                <button
                  onClick={() => prevCursor && loadMoreEvents('prev')}
                  disabled={currentPage === 1 || isLoadingMore}
                  className={`p-2 rounded-lg ${currentPage === 1 || isLoadingMore ? 'text-gray-400 cursor-not-allowed' : 'text-[#005357] hover:bg-[#e6f0f0]'}`}
                >
                  <FiChevronLeft size={20} />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {pageNumbers.map((pageNum, index) => (
                    pageNum < 0 ? (
                      // Render ellipsis
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                    ) : (
                      // Render page number
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => loadMoreEvents('specific', pageNum)}
                        disabled={pageNum === currentPage || isLoadingMore}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${pageNum === currentPage 
                          ? 'bg-[#005357] text-white font-medium' 
                          : 'text-[#005357] hover:bg-[#e6f0f0]'}`}
                        aria-current={pageNum === currentPage ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>
                
                {/* Next page button */}
                <button
                  onClick={() => nextCursor && loadMoreEvents('next')}
                  disabled={currentPage === totalPages || isLoadingMore}
                  className={`p-2 rounded-lg ${currentPage === totalPages || isLoadingMore ? 'text-gray-400 cursor-not-allowed' : 'text-[#005357] hover:bg-[#e6f0f0]'}`}
                >
                  <FiChevronRight size={20} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
