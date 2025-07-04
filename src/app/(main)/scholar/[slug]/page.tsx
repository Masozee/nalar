'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchScholarBySlug, Scholar } from '../api';
import { FiMail, FiTwitter, FiLinkedin, FiGlobe, FiPhone, FiArrowRight, FiCalendar, FiUsers, FiFileText, FiChevronDown, FiClock, FiMapPin } from 'react-icons/fi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Publication {
  id: number;
  title: string;
  slug: string;
  date_publish: string;
  image: string;
  authors: {
    id: number;
    name: string;
    slug: string;
  }[];
  category_info: {
    name: string;
    slug: string;
  };
  description: string;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  date_start: string;
  date_end: string | null;
  location: string;
  image: string;
  description: string;
}

export default function ScholarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tabValue, setTabValue] = useState('about');
  const [activeTab, setActiveTab] = useState('about');
  
  // Load more state
  const [showAllPublications, setShowAllPublications] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  
  // Display limits
  const INITIAL_PUBLICATIONS_LIMIT = 3;
  const INITIAL_EVENTS_LIMIT = 3;

  useEffect(() => {
    const getScholarData = async () => {
      try {
        setLoading(true);
        const data = await fetchScholarBySlug(slug as string);
        setScholar(data);
      } catch (err) {
        console.error('Error fetching scholar:', err);
        setError('Failed to load scholar details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      getScholarData();
    }
  }, [slug]);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <ScholarDetailSkeleton />;
  }

  if (error || !scholar) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6 text-gray-600">{error || 'Scholar not found'}</p>
        <Link href="/scholars">
          <Button>Back to Scholars</Button>
        </Link>
      </div>
    );
  }

  // Show limited publications initially
  const displayedPublications = showAllPublications 
    ? scholar.recent_publications 
    : scholar.recent_publications.slice(0, INITIAL_PUBLICATIONS_LIMIT);
    
  // Show limited events initially
  const displayedEvents = showAllEvents
    ? scholar.recent_events
    : scholar.recent_events.slice(0, INITIAL_EVENTS_LIMIT);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 md:pt-24 md:pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-44 h-44 md:w-56 md:h-56 overflow-hidden rounded-xl bg-gray-300 flex-shrink-0 shadow-lg border-4 border-white">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <FiUsers className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <Image
                src={scholar.profile_img || '/placeholder-profile.png'}
                alt={scholar.name}
                fill
                className={`object-cover ${imageLoaded ? '' : 'opacity-0'}`}
                priority
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-1">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {scholar.category}
                </Badge>
                {scholar.department && scholar.department.length > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    {scholar.department[0].name}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold !text-white">{scholar.name}</h1>
              <p className="text-lg md:text-xl font-medium text-white">{scholar.position}</p>
              <p className="text-lg text-white/90">{scholar.organization}</p>
              
              <div className="flex flex-wrap mt-6 gap-4 justify-center md:justify-start">
                {scholar.publications_count > 0 && (
                  <div className="flex items-center gap-2">
                    <FiFileText className="w-5 h-5" />
                    <span>
                      <span className="font-bold">{scholar.publications_count}</span> Publications
                    </span>
                  </div>
                )}
                {scholar.events_count > 0 && (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>
                      <span className="font-bold">{scholar.events_count}</span> Events
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex mt-6 gap-3 flex-wrap justify-center md:justify-start">
                {scholar.email && (
                  <a 
                    href={`mailto:${scholar.email}`} 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Email"
                  >
                    <FiMail className="w-5 h-5" />
                  </a>
                )}
                {scholar.phoneNumber && (
                  <a 
                    href={`tel:${scholar.phoneNumber}`} 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Phone"
                  >
                    <FiPhone className="w-5 h-5" />
                  </a>
                )}
                {scholar.twitter && (
                  <a 
                    href={scholar.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Twitter"
                  >
                    <FiTwitter className="w-5 h-5" />
                  </a>
                )}
                {scholar.linkedin && (
                  <a 
                    href={scholar.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="LinkedIn"
                  >
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                )}
                {scholar.external_profile && (
                  <a 
                    href={scholar.external_profile} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="External Profile"
                  >
                    <FiGlobe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="about" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 px-6 border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                About
              </TabsTrigger>
              {scholar.publications_count > 0 && (
                <TabsTrigger 
                  value="publications" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 px-6 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  Publications
                </TabsTrigger>
              )}
              {scholar.events_count > 0 && (
                <TabsTrigger 
                  value="events" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 px-6 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  Events
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Biography</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: scholar.description || 'No biography available.' }}
              />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Areas of Expertise */}
              {scholar.expertise && scholar.expertise.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold mb-4">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {scholar.expertise.map((topic) => (
                      <Badge key={topic.id} variant="outline" className="bg-gray-50 text-gray-700">
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Departments */}
              {scholar.department && scholar.department.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold mb-4">Departments</h3>
                  <div className="flex flex-col gap-2">
                    {scholar.department.map((dept) => (
                      <div key={dept.id} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span>{dept.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contact Info */}
              {(scholar.email || scholar.phoneNumber) && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                  <div className="flex flex-col gap-3">
                    {scholar.email && (
                      <a href={`mailto:${scholar.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FiMail className="w-5 h-5" />
                        <span>{scholar.email}</span>
                      </a>
                    )}
                    {scholar.phoneNumber && (
                      <a href={`tel:${scholar.phoneNumber}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FiPhone className="w-5 h-5" />
                        <span>{scholar.phoneNumber}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'publications' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Publications</h2>
              <div className="text-sm text-gray-500">{scholar.publications_count} total</div>
            </div>
            
            {scholar.recent_publications.length === 0 ? (
              <p className="text-gray-500 italic">No publications available.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPublications.map((pub) => (
                    <Card key={pub.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="relative w-full h-48 bg-gray-100">
                        <Image
                          src={pub.image || '/placeholder-publication.png'}
                          alt={pub.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader className="flex-1">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {pub.category_info?.name || 'Publication'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(pub.date_publish)}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2">{pub.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {pub.description?.replace(/<[^>]*>?/gm, '') || 'No description available.'}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Link href={`/publications/${pub.slug}`}>
                          <Button variant="outline" className="w-full justify-between">
                            Read More <FiArrowRight />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {scholar.recent_publications.length > INITIAL_PUBLICATIONS_LIMIT && !showAllPublications && (
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={() => setShowAllPublications(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      Show All Publications <FiChevronDown />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Events</h2>
              <div className="text-sm text-gray-500">{scholar.events_count} total</div>
            </div>
            
            {scholar.recent_events.length === 0 ? (
              <p className="text-gray-500 italic">No events available.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedEvents.map((event: Event) => (
                    <div 
                      key={event.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-[#005357]/10 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative aspect-[3/4] w-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#005357]/70 via-[#005357]/20 to-transparent z-10" />
                        <Image 
                          src={event.image || '/placeholder-event.png'}
                          alt={event.title}
                          fill
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                        />
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#e6f0f0] text-[#005357]">
                            {new Date(event.date_start) > new Date() ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-grow">
                        <h3 className="text-lg font-bold mb-3 text-[#005357]">{event.title}</h3>
                        
                        <div className="flex flex-col space-y-1 mb-3 text-sm">
                          <div className="flex items-center text-[#005357]">
                            <FiCalendar className="mr-2 text-[#005357]" />
                            <span>{formatDate(event.date_start)}</span>
                          </div>
                          
                          {event.date_end && (
                            <div className="flex items-center text-[#005357]">
                              <FiClock className="mr-2 text-[#005357]" />
                              <span>{formatDate(event.date_end)}</span>
                            </div>
                          )}
                          
                          {event.location && (
                            <div className="flex items-center text-[#005357]">
                              <FiMapPin className="mr-2 text-[#005357]" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="px-4 pb-4 mt-auto">
                        <Link 
                          href={`/events/${event.slug}`}
                          className="inline-block bg-[#005357] hover:bg-[#003e40] text-white font-medium py-2 px-4 rounded-lg transition duration-300 w-full text-center text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                {scholar.recent_events.length > INITIAL_EVENTS_LIMIT && !showAllEvents && (
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={() => setShowAllEvents(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      Show All Events <FiChevronDown />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton for the scholar detail page
function ScholarDetailSkeleton() {
  return (
    <div className="bg-white">
      {/* Hero Section Skeleton */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-20 md:pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Skeleton className="w-44 h-44 md:w-56 md:h-56 rounded-xl flex-shrink-0" />
            <div className="flex-1 text-center md:text-left w-full">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-10 w-3/4 md:w-1/2 mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-6 w-36 mb-6" />
              
              <div className="flex flex-wrap mt-6 gap-4 justify-center md:justify-start">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
              
              <div className="flex mt-6 gap-3 justify-center md:justify-start">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation Skeleton */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 py-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-3/4 mb-3" />
          </div>
          
          <div className="lg:col-span-1">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex flex-wrap gap-2 mb-8">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
            
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-8" />
            
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </div>
        </div>
      </div>
    </div>
  );
} 