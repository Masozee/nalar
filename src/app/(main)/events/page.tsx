'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
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
} from 'react-icons/fi';

// Define event interface
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
}

// Mock data for events
const EVENTS: Event[] = [
  {
    id: 1,
    slug: 'asean-economic-integration-2024',
    title: 'ASEAN Economic Integration: Opportunities and Challenges Ahead',
    date: 'May 25, 2024',
    time: '09:00 - 12:00 WIB',
    location: 'CSIS Auditorium, Jakarta',
    eventType: 'Conference',
    accessType: 'public',
    excerpt: 'A high-level discussion on the future of ASEAN economic integration and Indonesia\'s strategic role.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    topics: ['ASEAN', 'Economic Integration', 'Regional Trade'],
    featured: true,
    status: 'upcoming',
    speakers: ['Dr. Mari Pangestu', 'Prof. Djisman Simandjuntak', 'Dr. Chatib Basri'],
    registrationLink: '/register/asean-economic-integration-2024'
  },
  {
    id: 2,
    slug: 'indo-pacific-security-dialogue',
    title: 'Indo-Pacific Security Dialogue 2024',
    date: 'May 18, 2024',
    time: '13:00 - 16:30 WIB',
    location: 'Virtual Event',
    eventType: 'Webinar',
    accessType: 'public',
    excerpt: 'International experts discuss emerging security challenges in the Indo-Pacific region.',
    image: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
    topics: ['Security', 'Indo-Pacific', 'Regional Cooperation'],
    featured: true,
    status: 'upcoming',
    speakers: ['Prof. Dewi Fortuna Anwar', 'Dr. Evan Laksmana', 'Dr. Shafiah Muhibat'],
    registrationLink: '/register/indo-pacific-security-dialogue'
  },
  {
    id: 3,
    slug: 'climate-finance-policy',
    title: 'Climate Finance Policy Workshop',
    date: 'May 10, 2024',
    time: '09:00 - 16:00 WIB',
    location: 'CSIS Meeting Room, Jakarta',
    eventType: 'Workshop',
    accessType: 'private',
    excerpt: 'A closed-door workshop for policymakers on climate finance instruments and implementation.',
    image: '/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg',
    topics: ['Climate Change', 'Finance', 'Policy Planning'],
    featured: false,
    status: 'upcoming',
    speakers: ['Dr. Kuntoro Mangkusubroto', 'Dr. Amanda Katili', 'Dr. Fabby Tumiwa']
  },
  {
    id: 4,
    slug: 'digital-economy-forum',
    title: 'Indonesia Digital Economy Forum',
    date: 'April 20, 2024',
    time: '10:00 - 15:00 WIB',
    location: 'Shangri-La Hotel, Jakarta',
    eventType: 'Forum',
    accessType: 'public',
    excerpt: 'Exploring Indonesia\'s digital economy landscape and future growth trajectories.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    topics: ['Digital Economy', 'Technology', 'Economic Development'],
    featured: false,
    status: 'past',
    speakers: ['Dr. Yose Rizal Damuri', 'Dr. Titik Anas', 'Dr. Siwage Dharma Negara']
  },
  {
    id: 5,
    slug: 'asean-china-relations',
    title: 'ASEAN-China Relations: 30 Years of Partnership',
    date: 'April 10, 2024',
    time: '13:30 - 16:00 WIB',
    location: 'CSIS Auditorium, Jakarta',
    eventType: 'Seminar',
    accessType: 'public',
    excerpt: 'Reflecting on three decades of ASEAN-China partnership and future trajectories.',
    image: '/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg',
    topics: ['ASEAN', 'China', 'Foreign Policy', 'Diplomacy'],
    featured: false,
    status: 'past',
    speakers: ['Dr. Jusuf Wanandi', 'Prof. Wang Yuzhu', 'Dr. Philips Vermonte']
  },
  {
    id: 6,
    slug: 'indonesia-trade-strategy',
    title: 'Indonesia\'s Trade Strategy: Closed-Door Briefing',
    date: 'March 25, 2024',
    time: '09:30 - 11:30 WIB',
    location: 'CSIS Executive Boardroom, Jakarta',
    eventType: 'Briefing',
    accessType: 'private',
    excerpt: 'Confidential briefing for stakeholders on Indonesia\'s trade negotiation strategy for 2024-2025.',
    image: '/bg/getty-images-C3gjLSgTKNw-unsplash.jpg',
    topics: ['Trade Policy', 'Economic Diplomacy', 'Strategic Planning'],
    featured: false,
    status: 'past',
    speakers: ['Dr. Muhammad Chatib Basri', 'Dr. Yose Rizal Damuri', 'Dr. Shinta Kamdani']
  },
  {
    id: 7,
    slug: 'cybersecurity-challenges',
    title: 'Emerging Cybersecurity Challenges in Southeast Asia',
    date: 'March 15, 2024',
    time: '13:00 - 15:30 WIB',
    location: 'Virtual Event',
    eventType: 'Webinar',
    accessType: 'public',
    excerpt: 'Experts discuss evolving cybersecurity threats facing Southeast Asian nations and policy responses.',
    image: '/bg/shubham-dhage-PACWvLRNzj8-unsplash.jpg',
    topics: ['Cybersecurity', 'Digital Policy', 'Regional Security'],
    featured: false,
    status: 'past',
    speakers: ['Dr. Yanuar Nugroho', 'Prof. Rohan Gunaratna', 'Dr. Fitriani']
  },
  {
    id: 8,
    slug: 'geopolitics-seminar',
    title: 'Geopolitics and Geoeconomics in a Changing World Order',
    date: 'March 8, 2024',
    time: '09:00 - 12:00 WIB',
    location: 'CSIS Auditorium, Jakarta',
    eventType: 'Seminar',
    accessType: 'public',
    excerpt: 'Analyzing shifts in global power dynamics and implications for Indonesia and Southeast Asia.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    topics: ['Geopolitics', 'International Relations', 'Global Order'],
    featured: false,
    status: 'past',
    speakers: ['Dr. Rizal Sukma', 'Dr. Dewi Fortuna Anwar', 'Dr. Dino Patti Djalal']
  }
];

// Extract unique filters
const eventTypes = Array.from(new Set(EVENTS.map(event => event.eventType))).sort();
const topics = Array.from(new Set(EVENTS.flatMap(event => event.topics))).sort();

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'public' | 'private'>('all');
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
  
  const [filteredEvents, setFilteredEvents] = useState(EVENTS);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  
  useEffect(() => {
    // Find a featured event
    const featured = EVENTS.find(event => event.featured && event.status === 'upcoming');
    setFeaturedEvent(featured || null);
    
    // Apply filters
    let results = [...EVENTS];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        event => 
          event.title.toLowerCase().includes(query) ||
          event.excerpt.toLowerCase().includes(query) ||
          event.speakers.some(speaker => speaker.toLowerCase().includes(query)) ||
          event.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Status filter (upcoming/past)
    if (statusFilter !== 'all') {
      results = results.filter(event => event.status === statusFilter);
    }
    
    // Access filter (public/private)
    if (accessFilter !== 'all') {
      results = results.filter(event => event.accessType === accessFilter);
    }
    
    // Event type filter
    if (activeFilters.eventTypes.length > 0) {
      results = results.filter(event => activeFilters.eventTypes.includes(event.eventType));
    }
    
    // Topic filter
    if (activeFilters.topics.length > 0) {
      results = results.filter(event => 
        event.topics.some(topic => activeFilters.topics.includes(topic))
      );
    }
    
    setFilteredEvents(results);
  }, [searchQuery, statusFilter, accessFilter, activeFilters]);
  
  const toggleFilter = (type: 'eventTypes' | 'topics', value: string) => {
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
      eventTypes: [],
      topics: [],
    });
    setStatusFilter('all');
    setAccessFilter('all');
    setSearchQuery('');
  };
  
  const toggleFilterSection = (section: 'eventTypes' | 'topics') => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const hasActiveFilters = () => {
    return (
      searchQuery !== '' ||
      statusFilter !== 'all' ||
      accessFilter !== 'all' ||
      activeFilters.eventTypes.length > 0 ||
      activeFilters.topics.length > 0
    );
  };
  
  return (
    <>
      <NavBar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Events</h1>
              <p className="text-xl text-white/80 mb-0">
                Join our discussions, workshops, and conferences on key policy issues
              </p>
            </div>
          </div>
        </section>
        
        {/* Featured Event */}
        {featuredEvent && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-primary mb-8">Featured Upcoming Event</h2>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="md:col-span-1 relative h-60 md:h-full">
                    <Image 
                      src={featuredEvent.image}
                      alt={featuredEvent.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2 p-6 md:p-8">
                    <div className="flex flex-wrap mb-4 gap-2">
                      <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                        {featuredEvent.eventType}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        featuredEvent.accessType === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {featuredEvent.accessType === 'public' ? 'Public' : 'Private'} Event
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{featuredEvent.title}</h3>
                    <p className="text-gray-600 mb-6">{featuredEvent.excerpt}</p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
                      <div className="flex items-center">
                        <FiCalendar className="text-primary mr-2" />
                        <span className="text-gray-700">{featuredEvent.date}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-primary mr-2" />
                        <span className="text-gray-700">{featuredEvent.time}</span>
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="text-primary mr-2" />
                        <span className="text-gray-700">{featuredEvent.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredEvent.topics.map((topic, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="space-x-4">
                      <Link 
                        href={`/events/${featuredEvent.slug}`} 
                        className="inline-flex items-center text-accent hover:text-accent-dark"
                      >
                        View details
                        <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      {featuredEvent.registrationLink && (
                        <Link 
                          href={featuredEvent.registrationLink} 
                          className="inline-block bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md"
                        >
                          Register Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Filters and Events List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    {hasActiveFilters() && (
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
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Search Events
                    </label>
                    <div className="relative">
                      <input
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, speaker, topic..."
                        className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Event Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          id="all-events" 
                          type="radio" 
                          name="status"
                          checked={statusFilter === 'all'} 
                          onChange={() => setStatusFilter('all')}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="all-events" className="ml-2 text-gray-700">
                          All Events
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          id="upcoming-events" 
                          type="radio" 
                          name="status"
                          checked={statusFilter === 'upcoming'} 
                          onChange={() => setStatusFilter('upcoming')}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="upcoming-events" className="ml-2 text-gray-700">
                          Upcoming Events
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          id="past-events" 
                          type="radio" 
                          name="status"
                          checked={statusFilter === 'past'} 
                          onChange={() => setStatusFilter('past')}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="past-events" className="ml-2 text-gray-700">
                          Past Events
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Access Type Filter */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Access Type</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          id="all-access" 
                          type="radio" 
                          name="access"
                          checked={accessFilter === 'all'} 
                          onChange={() => setAccessFilter('all')}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="all-access" className="ml-2 text-gray-700">
                          All Events
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          id="public-events" 
                          type="radio" 
                          name="access"
                          checked={accessFilter === 'public'} 
                          onChange={() => setAccessFilter('public')}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="public-events" className="ml-2 flex items-center text-gray-700">
                          <FiUnlock className="text-green-600 mr-1" />
                          Public Events
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          id="private-events" 
                          type="radio" 
                          name="access"
                          checked={accessFilter === 'private'} 
                          onChange={() => setAccessFilter('private')}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor="private-events" className="ml-2 flex items-center text-gray-700">
                          <FiLock className="text-amber-600 mr-1" />
                          Private Events
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Types Filter */}
                  <div className="mb-6">
                    <button
                      className="flex items-center justify-between w-full font-medium text-gray-900 mb-3"
                      onClick={() => toggleFilterSection('eventTypes')}
                    >
                      <span>Event Types</span>
                      {expandedFilters.eventTypes ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </button>
                    {expandedFilters.eventTypes && (
                      <div className="space-y-2">
                        {eventTypes.map((type) => (
                          <div key={type} className="flex items-center">
                            <input 
                              id={`type-${type}`} 
                              type="checkbox" 
                              checked={activeFilters.eventTypes.includes(type)}
                              onChange={() => toggleFilter('eventTypes', type)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor={`type-${type}`} className="ml-2 text-gray-700">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Topics Filter */}
                  <div className="mb-6">
                    <button
                      className="flex items-center justify-between w-full font-medium text-gray-900 mb-3"
                      onClick={() => toggleFilterSection('topics')}
                    >
                      <span>Topics</span>
                      {expandedFilters.topics ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </button>
                    {expandedFilters.topics && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {topics.map((topic) => (
                          <div key={topic} className="flex items-center">
                            <input 
                              id={`topic-${topic}`} 
                              type="checkbox" 
                              checked={activeFilters.topics.includes(topic)}
                              onChange={() => toggleFilter('topics', topic)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor={`topic-${topic}`} className="ml-2 text-gray-700">
                              {topic}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Events List */}
              <div className="lg:w-3/4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {statusFilter === 'upcoming' ? 'Upcoming Events' : 
                     statusFilter === 'past' ? 'Past Events' : 'All Events'}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                  </div>
                </div>
                
                {filteredEvents.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <FiSearch className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="text-accent hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3">
                          <div className="md:col-span-1 relative h-48 md:h-full">
                            <Image 
                              src={event.image}
                              alt={event.title}
                              fill
                              style={{ objectFit: "cover" }}
                              className="bg-gray-100"
                            />
                            {event.status === 'upcoming' && (
                              <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                                Upcoming
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-2 p-6">
                            <div className="flex flex-wrap mb-3 gap-2">
                              <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                                {event.eventType}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full flex items-center ${
                                event.accessType === 'public' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {event.accessType === 'public' ? (
                                  <>
                                    <FiUnlock className="mr-1" />
                                    Public Event
                                  </>
                                ) : (
                                  <>
                                    <FiLock className="mr-1" />
                                    Private Event
                                  </>
                                )}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                            <p className="text-gray-600 mb-4">{event.excerpt}</p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4">
                              <div className="flex items-center">
                                <FiCalendar className="text-primary mr-2" />
                                <span className="text-gray-700">{event.date}</span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="text-primary mr-2" />
                                <span className="text-gray-700">{event.time}</span>
                              </div>
                              <div className="flex items-center">
                                <FiMapPin className="text-primary mr-2" />
                                <span className="text-gray-700">{event.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center mb-4">
                              <FiUsers className="text-primary mr-2" />
                              <span className="text-gray-700">
                                {event.speakers.slice(0, 2).join(', ')}
                                {event.speakers.length > 2 && `, +${event.speakers.length - 2} more`}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {event.topics.map((topic, index) => (
                                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <div className="space-x-4">
                              <Link 
                                href={`/events/${event.slug}`} 
                                className="inline-flex items-center text-accent hover:text-accent-dark"
                              >
                                View details
                                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </Link>
                              {event.registrationLink && event.status === 'upcoming' && (
                                <Link 
                                  href={event.registrationLink} 
                                  className="inline-block bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md"
                                >
                                  Register
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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