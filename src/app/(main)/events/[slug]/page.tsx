'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import api, { Event as ApiEvent } from '@/lib/api';
import { 
  FiCalendar, 
  FiDownload, 
  FiTwitter, 
  FiLinkedin, 
  FiFacebook,
  FiMail, 
  FiLink,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiLock,
  FiArrowLeft,
  FiLoader,
  FiMapPin,
  FiSearch,
  FiUser,
  FiFile
} from 'react-icons/fi';
import { ShareButtons } from './ShareButtons';

// Define Speaker interface
interface Speaker {
  id?: number;
  name: string;
  slug?: string;
  title: string;
  position?: string;
  organization: string;
  category?: string;
  profile_url?: string;
  profile_img?: string;
  bio: string;
  image: string;
  presentation?: {
    title: string;
    file: string;
  };
}

// Define Photo interface
interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Define Topic interface
interface Topic {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  date_created?: string;
  publish?: boolean;
  parent_name?: string | null;
}

// Define Event interface
interface Event {
  id: number;
  slug: string;
  title: string;
  date_start: string;
  date_end?: string;
  time_start?: string;
  time_end?: string;
  location?: string;
  eventType?: string;
  accessType?: string;
  excerpt?: string;
  description?: string;
  image?: string;
  posterImage?: string;
  youtubeUrl?: string;
  youtube?: string;
  topics?: Topic[];
  topic?: Topic[];
  speakers?: Speaker[];
  speaker?: Speaker[];
  moderator?: Speaker[];
  opening_speakers?: Speaker[];
  closing_speakers?: Speaker[];
  event_speakers?: Speaker[];
  status?: 'upcoming' | 'past';
  is_past_due?: boolean;
  publish?: boolean;
  department?: any;
  tgl?: string;
  file?: any[];
  registrationLink?: string;
  link?: string;
  url?: string;
  Person_In_Charge?: any;
  project_info?: any;
  sessions?: any[];
  photos?: Photo[];
  additionalMaterials?: {
    title: string;
    description: string;
    url: string;
  }[];
  recent_events?: Event[];
  upcoming_events?: Event[];
}

// Mock data for events
const EVENTS: Event[] = [
  {
    id: 1,
    slug: 'asean-economic-integration-2024',
    title: 'ASEAN Economic Integration: Opportunities and Challenges Ahead',
    date_start: '2024-05-25T09:00:00',
    date_end: '2024-05-25T12:00:00',
    location: 'CSIS Auditorium, Jakarta',
    eventType: 'Conference',
    accessType: 'public',
    excerpt: 'A high-level discussion on the future of ASEAN economic integration and Indonesia\'s strategic role.',
    description: `
      <p>The Center for Strategic and International Studies (CSIS) Indonesia is pleased to invite you to our upcoming conference on "ASEAN Economic Integration: Opportunities and Challenges Ahead."</p>

      <p>As ASEAN continues to pursue greater economic integration, this conference will address critical questions about the future of regional economic cooperation, with a particular focus on Indonesia's strategic role.</p>
      
      <p>Key topics to be discussed include:</p>
      <ul>
        <li>Progress and barriers to ASEAN Economic Community 2025 goals</li>
        <li>The impact of global economic challenges on ASEAN integration</li>
        <li>Indonesia's role in driving regional economic cooperation</li>
        <li>Future directions for ASEAN economic policy coordination</li>
      </ul>
      
      <p>This high-level event will bring together distinguished policymakers, economists, and experts to share insights on these critical issues. The conference will feature keynote addresses and panel discussions, providing attendees with comprehensive perspectives on the future of ASEAN economic integration.</p>
    `,
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    posterImage: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    topics: [
      { id: 1, name: 'ASEAN', slug: 'asean' },
      { id: 2, name: 'Economic Integration', slug: 'economic-integration' },
      { id: 3, name: 'Regional Trade', slug: 'regional-trade' }
    ],
    speakers: [
      {
        name: 'Dr. Mari Pangestu',
        title: 'Former Managing Director of Development Policy and Partnerships',
        organization: 'World Bank',
        bio: 'Dr. Mari Pangestu previously served as Indonesia\'s Minister of Trade and as Minister of Tourism and Creative Economy. She has extensive experience in international economics and trade policy.',
        image: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
        presentation: {
          title: 'ASEAN Economic Integration: A Global Perspective',
          file: '/documents/presentations/pangestu-asean-integration.pdf'
        }
      },
      {
        name: 'Prof. Djisman Simandjuntak',
        title: 'Senior Economist',
        organization: 'CSIS Indonesia',
        bio: 'Prof. Djisman Simandjuntak is a senior economist at CSIS Indonesia with decades of experience in economic research and policy analysis, with a focus on ASEAN economic integration.',
        image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
        presentation: {
          title: 'The Future of ASEAN Economic Community',
          file: '/documents/presentations/simandjuntak-aec-future.pdf'
        }
      },
      {
        name: 'Dr. Chatib Basri',
        title: 'Former Minister of Finance',
        organization: 'Republic of Indonesia',
        bio: 'Dr. Chatib Basri is a distinguished economist who served as Indonesia\'s Minister of Finance. He has extensive experience in economic policy and international economic relations.',
        image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
        presentation: {
          title: 'Indonesia\'s Role in Regional Economic Integration',
          file: '/documents/presentations/basri-indonesia-role.pdf'
        }
      }
    ],
    registrationLink: '/register/asean-economic-integration-2024',
    status: 'upcoming',
  },
  {
    id: 2,
    slug: 'indo-pacific-security-dialogue',
    title: 'Indo-Pacific Security Dialogue 2024',
    date_start: '2024-05-18T13:00:00',
    date_end: '2024-05-18T16:30:00',
    location: 'Virtual Event',
    eventType: 'Webinar',
    accessType: 'public',
    excerpt: 'International experts discuss emerging security challenges in the Indo-Pacific region.',
    description: `
      <p>The Center for Strategic and International Studies (CSIS) Indonesia will host the "Indo-Pacific Security Dialogue 2024," a virtual event bringing together leading experts to discuss emerging security challenges in the region.</p>

      <p>This timely webinar will address critical security issues facing the Indo-Pacific, including:</p>
      <ul>
        <li>Maritime security and territorial disputes</li>
        <li>Great power competition and its impact on regional stability</li>
        <li>The evolving role of multilateral security cooperation</li>
        <li>Non-traditional security challenges including climate security</li>
      </ul>
      
      <p>The dialogue will feature distinguished speakers from across the region who will offer insights on these complex challenges and potential pathways for maintaining peace and stability in the Indo-Pacific.</p>
    `,
    image: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    topics: [
      { id: 4, name: 'Security', slug: 'security' },
      { id: 5, name: 'Indo-Pacific', slug: 'indo-pacific' },
      { id: 6, name: 'Regional Cooperation', slug: 'regional-cooperation' }
    ],
    speakers: [
      {
        name: 'Prof. Dewi Fortuna Anwar',
        title: 'Research Professor',
        organization: 'Indonesian Institute of Sciences (LIPI)',
        bio: 'Professor Dewi Fortuna Anwar is a distinguished scholar of international relations with a focus on Indonesia\'s foreign policy and regional security dynamics in Southeast Asia.',
        image: '/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg',
        presentation: {
          title: 'ASEAN Centrality Amid Great Power Competition',
          file: '/documents/presentations/anwar-asean-centrality.pdf'
        }
      },
      {
        name: 'Dr. Mari Pangestu',
        title: 'Former Managing Director',
        organization: 'World Bank',
        bio: 'Dr. Mari Pangestu is a renowned economist who previously served as Indonesia\'s Minister of Trade and as Managing Director of Development Policy at the World Bank.',
        image: '/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg',
        presentation: {
          title: 'Global Economic Trends and Indonesia\'s Position',
          file: '/documents/presentations/pangestu-economic-trends.pdf'
        }
      },
      {
        name: 'Dr. Evan Laksmana',
        title: 'Senior Research Fellow',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Evan Laksmana specializes in defense policy, military change, and regional security issues in the Indo-Pacific with a particular focus on Southeast Asia.',
        image: '/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg',
        presentation: {
          title: 'Military Modernization and Security Dynamics',
          file: '/documents/presentations/laksmana-military-modernization.pdf'
        }
      }
    ],
    registrationLink: '/register/indo-pacific-security-dialogue',
    status: 'upcoming',
  }
];

const EventDetail = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  // State for event data
  const [event, setEvent] = useState<Event | null>(null);
  const [showSpeakersInMain, setShowSpeakersInMain] = useState(false);
  const [speakerFilter, setSpeakerFilter] = useState('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  // Functions to navigate through photos
  const nextPhoto = () => {
    if (event?.photos) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % event.photos!.length);
    }
  };
  
  const prevPhoto = () => {
    if (event?.photos) {
      setCurrentPhotoIndex((prevIndex) => 
        prevIndex === 0 ? event.photos!.length - 1 : prevIndex - 1
      );
    }
  };

  // Filter speakers based on search input
  const filteredSpeakers = event?.speakers?.filter(speaker => {
    if (!speakerFilter) return true;
    const searchTerm = speakerFilter.toLowerCase();
    return (
      speaker.name.toLowerCase().includes(searchTerm) ||
      (speaker.organization && speaker.organization.toLowerCase().includes(searchTerm))
    );
  });
  
  // Determine if speakers should be shown in main content area
  useEffect(() => {
    if (event) {
      setShowSpeakersInMain(event.speakers && event.speakers.length > 4);
    }
  }, [event]);

  useEffect(() => {
    // Fetch event data from API
    const fetchEventDetail = async () => {
      try {
        // Fetch the specific event directly from the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/events/${slug}/`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.status}`);
        }
        
        // Parse the API response
        const apiEventData = await response.json();
        console.log('API Event Data:', apiEventData);
        
        // Set upcoming and recent events from the API response
        if (apiEventData.upcoming_events && apiEventData.upcoming_events.length > 0) {
          setUpcomingEvents(apiEventData.upcoming_events);
        }
        
        if (apiEventData.recent_events && apiEventData.recent_events.length > 0) {
          setRecentEvents(apiEventData.recent_events);
        }
        
        // Format date
        const startDate = new Date(apiEventData.date_start);
        const endDate = apiEventData.date_end ? new Date(apiEventData.date_end) : null;
        
        let formattedDate = startDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        if (endDate && endDate.getTime() !== startDate.getTime()) {
          if (endDate.getMonth() === startDate.getMonth() && endDate.getFullYear() === startDate.getFullYear()) {
            // Same month and year
            formattedDate = `${startDate.getDate()} - ${endDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}`;
          } else {
            // Different month or year
            formattedDate = `${startDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })} - ${endDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}`;
          }
        }
        
        // Format time
        let timeInfo = 'TBD';
        if (apiEventData.time_start) {
          // Convert 24-hour format to 12-hour format
          const formatTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
          };
          
          timeInfo = formatTime(apiEventData.time_start);
          if (apiEventData.time_end) {
            timeInfo += ` - ${formatTime(apiEventData.time_end)}`;
          }
        }
        
        // Determine if event is upcoming
        const currentDate = new Date();
        const isUpcoming = startDate >= currentDate;
        
        // Process speakers
        let allSpeakers: Speaker[] = [];
        
        // Process main speakers
        if (apiEventData.speaker && Array.isArray(apiEventData.speaker)) {
          allSpeakers = [...allSpeakers, ...apiEventData.speaker.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            title: s.position || '',
            position: s.position || '',
            organization: s.organization || '',
            category: s.category || '',
            profile_url: s.profile_url || '',
            profile_img: s.profile_img || '',
            bio: '',
            image: s.profile_img || '/bg/muska-create-5MvNlQENWDM-unsplash.png'
          }))];
        }
        
        // Process opening speakers
        if (apiEventData.opening_speakers && Array.isArray(apiEventData.opening_speakers)) {
          allSpeakers = [...allSpeakers, ...apiEventData.opening_speakers.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            title: s.position || '',
            position: s.position || '',
            organization: s.organization || '',
            category: s.category || '',
            profile_url: s.profile_url || '',
            profile_img: s.profile_img || '',
            bio: '',
            image: s.profile_img || '/bg/muska-create-5MvNlQENWDM-unsplash.png'
          }))];
        }
        
        // Process event speakers
        if (apiEventData.event_speakers && Array.isArray(apiEventData.event_speakers)) {
          allSpeakers = [...allSpeakers, ...apiEventData.event_speakers.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            title: s.position || '',
            position: s.position || '',
            organization: s.organization || '',
            category: s.category || '',
            profile_url: s.profile_url || '',
            profile_img: s.profile_img || '',
            bio: '',
            image: s.profile_img || '/bg/muska-create-5MvNlQENWDM-unsplash.png'
          }))];
        }
        
        // Process closing speakers
        if (apiEventData.closing_speakers && Array.isArray(apiEventData.closing_speakers)) {
          allSpeakers = [...allSpeakers, ...apiEventData.closing_speakers.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            title: s.position || '',
            position: s.position || '',
            organization: s.organization || '',
            category: s.category || '',
            profile_url: s.profile_url || '',
            profile_img: s.profile_img || '',
            bio: '',
            image: s.profile_img || '/bg/muska-create-5MvNlQENWDM-unsplash.png'
          }))];
        }
        
        // Extract topics
        const topics = apiEventData.topic && Array.isArray(apiEventData.topic) 
          ? apiEventData.topic.map((t: any) => t.name) 
          : ['Research'];
        
        // Create the event object
        const transformedEvent: Event = {
          id: apiEventData.id,
          slug: apiEventData.slug,
          title: apiEventData.title,
          // Using date_start and date_end from API
          date_start: apiEventData.date_start,
          date_end: apiEventData.date_end,
          time_start: apiEventData.time_start,
          time_end: apiEventData.time_end,
          location: apiEventData.location || 'TBD',
          eventType: 'Conference', // Default type
          accessType: 'public', // Default access
          excerpt: apiEventData.description?.substring(0, 150) + '...' || '',
          description: apiEventData.description || '',
          image: apiEventData.image || '/bg/muska-create-5MvNlQENWDM-unsplash.png',
          posterImage: apiEventData.image,
          youtubeUrl: apiEventData.youtube,
          youtube: apiEventData.youtube,
          topics: topics,
          topic: apiEventData.topic,
          speakers: allSpeakers,
          speaker: apiEventData.speaker,
          moderator: apiEventData.moderator,
          opening_speakers: apiEventData.opening_speakers,
          closing_speakers: apiEventData.closing_speakers,
          event_speakers: apiEventData.event_speakers,
          status: isUpcoming ? 'upcoming' : 'past',
          is_past_due: apiEventData.is_past_due,
          publish: apiEventData.publish,
          department: apiEventData.department,
          tgl: apiEventData.tgl,
          file: apiEventData.file,
          registrationLink: apiEventData.link || '',
          link: apiEventData.link,
          Person_In_Charge: apiEventData.Person_In_Charge,
          project_info: apiEventData.project_info,
          sessions: apiEventData.sessions,
          // upcoming_events and recent_events handled separately
        };
        
        setEvent(transformedEvent);
        setShowSpeakersInMain(allSpeakers.length > 0);
        
      } catch (err) {
        console.error('Error fetching event details:', err);
        // Fall back to mock data if API fails
        const mockEvent = EVENTS.find(e => e.slug === slug);
        setEvent(mockEvent || null);
      }
    };
    
    if (slug) {
      fetchEventDetail();
    }
  }, [slug]);
  
  return (
    <>
      <div className="min-h-screen bg-white">
        {event ? (
          <>
            {/* Hero Section */}
            <section className="relative bg-primary text-white">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary/95 z-10"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
              <div className="max-w-5xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Link 
                    href="/events" 
                    className="text-white/80 hover:text-white flex items-center transition-colors text-sm font-medium"
                  >
                    <FiArrowLeft className="mr-2 text-white" />
                    Back to Events
                  </Link>
                </div>
                
                {/* Topic tags */}
                {event.topic && event.topic.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.topic.map((topic, index) => (
                      <Link 
                        key={index} 
                        href={`/events?topic=${topic.slug}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
                      >
                        {topic.name}
                      </Link>
                    ))}
                  </div>
                )}
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 !text-white leading-tight">{event.title}</h1>
                
                <div className="flex flex-wrap gap-6 mb-8 text-sm text-white/90">
                  <div className="flex items-center">
                    <FiCalendar className="text-white mr-2" />
                    <span>{event.date_start ? new Date(event.date_start).toLocaleDateString() : 'Date TBD'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FiClock className="text-white mr-2" />
                    <span>{event.time_start ? `${event.time_start}${event.time_end ? ` - ${event.time_end}` : ''}` : 'Time TBD'}</span>
                  </div>
                  
                  <div className="flex items-center max-w-md">
                    <FiMapPin className="text-white mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
                
                {/* Event status badge */}
                <div className="flex items-center space-x-3 mb-8">
                  {event.is_past_due ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      Past Event
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Upcoming Event
                    </span>
                  )}
                </div>
                
                {/* Share & Copy buttons group (header) */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <ShareButtons showCopy url={typeof window !== 'undefined' ? window.location.href : (event.url || '')} title={event.title} />
                </div>
                <div className="flex flex-wrap gap-4">
                  {!event.is_past_due && event.registrationLink && (
                    <a 
                      href={event.registrationLink} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md font-medium transition-colors flex items-center"
                    >
                      Register Now
                    </a>
                  )}
                
                  {/* Share buttons moved to header */}
                </div>
              </div>
            </div>
          </section>
          
          {/* Main Content */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Main Content Column */}
                <div className="lg:col-span-2">
                  {/* Event Image */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                    <Image 
                      src={event.image}
                      alt={event.title}
                      width={900}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                  
                  {/* Event Description */}
                  <div className="prose prose-lg max-w-none mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                    <div dangerouslySetInnerHTML={{ __html: event.description || '' }} />
                  </div>
                  
                  {/* Speakers section */}
                  {event.speakers && event.speakers.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-12">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-xl font-semibold">Speakers</h3>
                        {event.speakers.length > 3 && (
                          <div className="relative w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Search speakers..."
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                              value={speakerFilter}
                              onChange={(e) => setSpeakerFilter(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {filteredSpeakers && filteredSpeakers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredSpeakers.map((speaker, index) => (
                            <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                              {(speaker.profile_img || speaker.image) && (
                                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                  <Image
                                    src={speaker.profile_img || speaker.image}
                                    alt={speaker.name}
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                {speaker.slug ? (
                                  <Link href={`/scholars/${speaker.slug}`}>
                                    <h4 className="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">{speaker.name}</h4>
                                  </Link>
                                ) : (
                                  <h4 className="font-semibold text-gray-900 text-lg">{speaker.name}</h4>
                                )}
                                {speaker.position && speaker.organization ? (
                                  <p className="text-sm text-gray-700">
                                    {speaker.position || speaker.title}, <span className="text-gray-500">{speaker.organization}</span>
                                  </p>
                                ) : (
                                  <>
                                    {(speaker.position || speaker.title) && <p className="text-sm text-gray-700">{speaker.position || speaker.title}</p>}
                                    {speaker.organization && <p className="text-sm text-gray-500">{speaker.organization}</p>}
                                  </>
                                )}
                                {speaker.bio && (
                                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{speaker.bio}</p>
                                )}
                                {speaker.presentation && (
                                  <div className="mt-3">
                                    <a 
                                      href={speaker.presentation.file} 
                                      className="inline-flex items-center text-primary hover:text-primary-dark text-sm"
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <FiDownload className="mr-1" size={14} />
                                      {speaker.presentation.title || 'Download Presentation'}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500">No speakers match your search criteria.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Moderator section */}
                  {event.moderator && event.moderator.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-12">
                      <h3 className="text-xl font-semibold mb-6">Moderator</h3>
                      <div className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {(event.moderator[0].profile_img || event.moderator[0].image) && (
                          <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                            <Image
                              src={event.moderator[0].profile_img || event.moderator[0].image || '/bg/muska-create-5MvNlQENWDM-unsplash.png'}
                              alt={event.moderator[0].name}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          {event.moderator[0].slug ? (
                            <Link href={`/scholars/${event.moderator[0].slug}`}>
                              <h4 className="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">{event.moderator[0].name}</h4>
                            </Link>
                          ) : (
                            <h4 className="font-semibold text-gray-900 text-lg">{event.moderator[0].name}</h4>
                          )}
                          {event.moderator[0].position && event.moderator[0].organization ? (
                            <p className="text-sm text-gray-700">
                              {event.moderator[0].position}, <span className="text-gray-500">{event.moderator[0].organization}</span>
                            </p>
                          ) : (
                            <>
                              {event.moderator[0].position && <p className="text-sm text-gray-700">{event.moderator[0].position}</p>}
                              {event.moderator[0].organization && <p className="text-sm text-gray-500">{event.moderator[0].organization}</p>}
                            </>
                          )}
                          {event.moderator[0].bio && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{event.moderator[0].bio}</p>
                          )}
                          {event.moderator[0].presentation && (
                            <div className="mt-3">
                              <a 
                                href={event.moderator[0].presentation.file} 
                                className="inline-flex items-center text-primary hover:text-primary-dark text-sm"
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <FiDownload className="mr-1" size={14} />
                                {event.moderator[0].presentation.title || 'Download Presentation'}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Opening Speakers section */}
                  {event.opening_speakers && event.opening_speakers.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-12">
                      <h3 className="text-xl font-semibold mb-6">Opening Remarks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {event.opening_speakers.map((speaker, index) => (
                          <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            {(speaker.profile_img || speaker.image) && (
                              <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                <Image
                                  src={speaker.profile_img || speaker.image}
                                  alt={speaker.name}
                                  width={80}
                                  height={80}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              {speaker.slug ? (
                                <Link href={`/scholars/${speaker.slug}`}>
                                  <h4 className="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">{speaker.name}</h4>
                                </Link>
                              ) : (
                                <h4 className="font-semibold text-gray-900 text-lg">{speaker.name}</h4>
                              )}
                              {speaker.position && speaker.organization ? (
                                <p className="text-sm text-gray-700">
                                  {speaker.position || speaker.title}, <span className="text-gray-500">{speaker.organization}</span>
                                </p>
                              ) : (
                                <>
                                  {(speaker.position || speaker.title) && <p className="text-sm text-gray-700">{speaker.position || speaker.title}</p>}
                                  {speaker.organization && <p className="text-sm text-gray-500">{speaker.organization}</p>}
                                </>
                              )}
                              {speaker.bio && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{speaker.bio}</p>
                              )}
                              {speaker.presentation && (
                                <div className="mt-3">
                                  <a 
                                    href={speaker.presentation.file} 
                                    className="inline-flex items-center text-primary hover:text-primary-dark text-sm"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <FiDownload className="mr-1" size={14} />
                                    {speaker.presentation.title || 'Download Presentation'}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Closing Speakers section */}
                  {event.closing_speakers && event.closing_speakers.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-12">
                      <h3 className="text-xl font-semibold mb-6">Closing Remarks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {event.closing_speakers.map((speaker, index) => (
                          <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            {(speaker.profile_img || speaker.image) && (
                              <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                <Image
                                  src={speaker.profile_img || speaker.image}
                                  alt={speaker.name}
                                  width={80}
                                  height={80}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              {speaker.slug ? (
                                <Link href={`/scholars/${speaker.slug}`}>
                                  <h4 className="font-semibold text-gray-900 text-lg hover:text-primary transition-colors">{speaker.name}</h4>
                                </Link>
                              ) : (
                                <h4 className="font-semibold text-gray-900 text-lg">{speaker.name}</h4>
                              )}
                              {speaker.position && speaker.organization ? (
                                <p className="text-sm text-gray-700">
                                  {speaker.position || speaker.title}, <span className="text-gray-500">{speaker.organization}</span>
                                </p>
                              ) : (
                                <>
                                  {(speaker.position || speaker.title) && <p className="text-sm text-gray-700">{speaker.position || speaker.title}</p>}
                                  {speaker.organization && <p className="text-sm text-gray-500">{speaker.organization}</p>}
                                </>
                              )}
                              {speaker.bio && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{speaker.bio}</p>
                              )}
                              {speaker.presentation && (
                                <div className="mt-3">
                                  <a 
                                    href={speaker.presentation.file} 
                                    className="inline-flex items-center text-primary hover:text-primary-dark text-sm"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <FiDownload className="mr-1" size={14} />
                                    {speaker.presentation.title || 'Download Presentation'}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Event Sessions */}
                  {event.sessions && event.sessions.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-12">
                      <h3 className="text-xl font-semibold mb-6">Event Sessions</h3>
                      <div className="space-y-6">
                        {event.sessions.map((session, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                              <h4 className="font-semibold text-gray-900 text-lg">{session.title}</h4>
                              <div className="flex items-center text-sm text-gray-500">
                                <FiClock className="mr-2" />
                                {session.time || `${session.time_start} - ${session.time_end}`}
                              </div>
                            </div>
                            
                            {session.description && (
                              <p className="text-gray-600 mb-4">{session.description}</p>
                            )}
                            
                            {session.speakers && session.speakers.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Speakers:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {session.speakers.map((speaker, speakerIndex) => (
                                    <span 
                                      key={speakerIndex} 
                                      className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                                    >
                                      <FiUser className="mr-1" size={12} />
                                      {speaker.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {session.materials && session.materials.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex flex-wrap gap-3">
                                  {session.materials.map((material, materialIndex) => (
                                    <a 
                                      key={materialIndex}
                                      href={material.url} 
                                      className="inline-flex items-center text-primary hover:text-primary-dark text-sm"
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <FiDownload className="mr-1" size={14} />
                                      {material.title || 'Download Material'}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                 
                  {/* YouTube Video (if available) */}
                  {event.youtube && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Recording</h2>
                      <div className="relative pt-[56.25%] rounded-xl overflow-hidden shadow-sm">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={event.youtube.replace('watch?v=', 'embed/')}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  {/* Event Photos Gallery */}
                  {event.photos && event.photos.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-12">
                      <h3 className="text-xl font-semibold mb-6">Event Photos</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {event.photos.map((photo, index) => (
                          <div 
                            key={index} 
                            className="relative aspect-video overflow-hidden rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all"
                            onClick={() => {
                              setCurrentPhotoIndex(index);
                              setIsGalleryOpen(true);
                            }}
                          >
                            <Image
                              src={photo.src}
                              alt={photo.alt || `Event photo ${index + 1}`}
                              width={photo.width || 400}
                              height={photo.height || 225}
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                  
                  {/* Recent Events */}
                  {event.recent_events && event.recent_events.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold text-gray-900">Recent Events</h3>
                        <Link href="/events" className="text-sm text-primary hover:text-primary-dark font-medium">View all</Link>
                      </div>
                      <div className="space-y-5 divide-y divide-gray-100">
                        {event.recent_events.map((recentEvent, index) => (
                          <Link 
                            href={`/events/${recentEvent.slug}`} 
                            key={`recent-${index}`}
                            className="block group"
                          >
                            <div className={`flex items-start hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors ${index > 0 ? 'pt-5' : ''}`}>
                              {recentEvent.image && (
                                <div className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                                  <Image 
                                    src={recentEvent.image} 
                                    alt={recentEvent.title} 
                                    width={80} 
                                    height={64}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-sm">
                                  {recentEvent.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                  <FiCalendar className="mr-1" size={12} />
                                  {recentEvent.tgl || recentEvent.date_start}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upcoming Events */}
                  {event.upcoming_events && event.upcoming_events.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
                        <Link href="/events" className="text-sm text-primary hover:text-primary-dark font-medium">View all</Link>
                      </div>
                      <div className="space-y-5 divide-y divide-gray-100">
                        {event.upcoming_events.map((upcomingEvent, index) => (
                          <Link 
                            href={`/events/${upcomingEvent.slug}`} 
                            key={`upcoming-${index}`}
                            className="block group"
                          >
                            <div className={`flex items-start hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors ${index > 0 ? 'pt-5' : ''}`}>
                              {upcomingEvent.image && (
                                <div className="w-20 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                                  <Image 
                                    src={upcomingEvent.image} 
                                    alt={upcomingEvent.title} 
                                    width={80} 
                                    height={64}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-sm">
                                  {upcomingEvent.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                  <FiCalendar className="mr-1" size={12} />
                                  {upcomingEvent.tgl || upcomingEvent.date_start}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
          
          {/* Lightbox Gallery */}
          {isGalleryOpen && event.photos && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
              <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setIsGalleryOpen(false)}
              >
                <FiX className="w-8 h-8" />
              </button>
              
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                onClick={prevPhoto}
              >
                <FiChevronLeft className="w-8 h-8" />
              </button>
              
              <div className="max-w-4xl max-h-full px-4">
                <Image 
                  src={event.photos[currentPhotoIndex].src}
                  alt={event.photos[currentPhotoIndex].alt}
                  width={event.photos[currentPhotoIndex].width}
                  height={event.photos[currentPhotoIndex].height}
                  className="max-h-[70vh] w-auto mx-auto"
                />
                <div className="text-white mt-4 text-center">
                  <p className="text-lg mb-2">{event.photos[currentPhotoIndex].alt}</p>
                  <a 
                    href={event.photos[currentPhotoIndex].src}
                    download={`event-photo-${currentPhotoIndex + 1}.jpg`}
                    className="inline-flex items-center text-sm text-white hover:text-gray-300 border border-white hover:border-gray-300 px-3 py-1 rounded-md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiDownload className="mr-2" />
                    Download Photo
                  </a>
                </div>
              </div>
              
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                onClick={nextPhoto}
              >
                <FiChevronRight className="w-8 h-8" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <FiLoader className="w-12 h-12 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Event...</h2>
            <p className="text-gray-600">Please wait while we fetch event information.</p>
          </div>
        </div>
      )}
      
      </div>
      <Footer />
    </>
  );
}

export default EventDetail;
