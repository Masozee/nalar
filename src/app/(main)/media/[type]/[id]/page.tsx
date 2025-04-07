'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiTag, FiShare2 } from 'react-icons/fi';

// Sample media data (same as in the main Media page)
const mediaItems = [
  // Podcasts
  {
    id: 'podcast-1',
    title: 'Indonesia\'s Economic Prospects in 2024',
    type: 'podcast',
    date: '2024-05-10',
    duration: '34 min',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    category: 'Economics',
    speakers: ['Dr. Ahmad Sulaiman', 'Lisa Wijaya'],
    description: 'Analysis of Indonesia\'s economic outlook for 2024 amid global uncertainties.',
    tags: ['Economics', 'Indonesia', 'Global Economy', 'Trade'],
    audioSrc: 'https://example.com/podcasts/indonesia-economic-prospects.mp3',
    transcript: 'In this episode, we discuss Indonesia\'s economic prospects for 2024 with our experts Dr. Ahmad Sulaiman and Lisa Wijaya. The conversation covers GDP growth projections, inflation concerns, and potential impacts of global economic trends on Indonesia\'s markets.',
    speakerBios: {
      'Dr. Ahmad Sulaiman': 'Senior Economist at CSIS Indonesia with expertise in macroeconomic policy and international trade.',
      'Lisa Wijaya': 'Research Fellow specializing in financial markets and economic development in Southeast Asia.'
    }
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
    description: 'Discussing the latest developments in South China Sea territorial disputes.',
    tags: ['Security', 'South China Sea', 'Maritime', 'Geopolitics'],
    audioSrc: 'https://example.com/podcasts/south-china-sea-disputes.mp3',
    transcript: 'This podcast examines the ongoing territorial disputes in the South China Sea with insights from Prof. Michael Chen and Dr. Sarah Johnson, analyzing recent developments and potential pathways to resolution.',
    speakerBios: {
      'Prof. Michael Chen': 'Professor of International Relations specializing in Asian security affairs and maritime disputes.',
      'Dr. Sarah Johnson': 'Security analyst with expertise in conflict resolution and international law.'
    }
  },
  
  // YouTube videos
  {
    id: 'youtube-1',
    title: 'ASEAN Summit 2024: Key Takeaways',
    type: 'youtube',
    date: '2024-05-05',
    duration: '18:24',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    category: 'International Relations',
    speakers: ['Dr. James Wilson'],
    description: 'Analysis of the recent ASEAN summit and its implications for regional cooperation.',
    tags: ['ASEAN', 'Diplomacy', 'Regional Cooperation', 'Southeast Asia'],
    youtubeId: 'dQw4w9WgXcQ', // Example YouTube ID
    transcript: 'In this video, Dr. James Wilson breaks down the key outcomes of the 2024 ASEAN Summit, discussing the implications for regional cooperation, economic integration, and security coordination.',
    speakerBios: {
      'Dr. James Wilson': 'Director of ASEAN Studies at CSIS Indonesia with over 15 years of experience in regional diplomacy and international relations.'
    }
  },
  
  // News appearances
  {
    id: 'news-1',
    title: 'CSIS on CNN: Regional Security Analysis',
    type: 'news',
    date: '2024-05-12',
    source: 'CNN International',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    category: 'Security',
    speakers: ['Dr. Robert Chen'],
    description: 'CSIS expert discusses regional security challenges on CNN International.',
    tags: ['Media Appearance', 'Security', 'Television', 'CNN'],
    externalLink: 'https://cnn.com/video/csis-regional-security',
    transcript: 'Dr. Robert Chen appeared on CNN International to discuss emerging security challenges in Southeast Asia, focusing on maritime security, territorial disputes, and regional cooperation frameworks.',
    speakerBios: {
      'Dr. Robert Chen': 'Senior Security Analyst at CSIS Indonesia specializing in regional security architecture and conflict prevention.'
    }
  }
];

interface MediaItem {
  id: string;
  title: string;
  type: string;
  date: string;
  duration?: string;
  image: string;
  category: string;
  speakers: string[];
  description: string;
  tags?: string[];
  audioSrc?: string;
  transcript?: string;
  speakerBios?: {
    [key: string]: string;
  };
  youtubeId?: string;
  source?: string;
  externalLink?: string;
}

export default function MediaDetailPage() {
  const params = useParams();
  const { type, id } = params;
  
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);
  
  useEffect(() => {
    // Find the current media item
    const currentItem = mediaItems.find(item => item.id === id);
    setMediaItem(currentItem as MediaItem | null);
    
    // Find related items (same category or with shared tags)
    if (currentItem) {
      const related = mediaItems.filter(item => 
        item.id !== id && 
        (item.category === currentItem.category || 
         (currentItem.tags && item.tags && 
          currentItem.tags.some(tag => item.tags.includes(tag))))
      ).slice(0, 3);
      
      setRelatedItems(related as MediaItem[]);
    }
  }, [id, type]);
  
  if (!mediaItem) {
    return (
      <div className="min-h-screen pt-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Media not found</h1>
            <p className="text-gray-600 mb-6">The media item you're looking for doesn't exist or has been removed.</p>
            <Link href="/media" className="inline-block bg-primary text-white px-4 py-2 rounded-md">
              Return to Media
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <div className="relative h-32 md:h-40 bg-primary overflow-hidden mb-8">
        <Image 
          src="/bg/muska-create-5MvNlQENWDM-unsplash.png" 
          alt="Media Detail Background"
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="opacity-60"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white">
              {mediaItem.type === 'podcast' ? 'Podcast' : 
               mediaItem.type === 'youtube' ? 'Video' : 'News'} Detail
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/media" className="inline-flex items-center text-primary hover:text-accent mb-6">
          <FiArrowLeft className="mr-2" /> Back to All Media
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {/* Media header */}
              <div className="relative aspect-video w-full">
                {mediaItem.type === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${mediaItem.youtubeId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={mediaItem.image}
                      alt={mediaItem.title}
                      fill
                      priority
                      style={{ objectFit: 'cover' }}
                    />
                    {mediaItem.type === 'podcast' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                          <p className="text-white font-medium">Listen to the podcast</p>
                        </div>
                      </div>
                    )}
                    {mediaItem.type === 'news' && (
                      <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {mediaItem.source}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-4">{mediaItem.title}</h1>
                
                <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" />
                    {new Date(mediaItem.date).toLocaleDateString('en-US', { 
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {mediaItem.duration && (
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      {mediaItem.duration}
                    </div>
                  )}
                  <div className="flex items-center">
                    <FiUser className="mr-1" />
                    {mediaItem.speakers.join(', ')}
                  </div>
                </div>
                
                {/* Audio player for podcasts */}
                {mediaItem.type === 'podcast' && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <audio
                      controls
                      src={mediaItem.audioSrc}
                      className="w-full"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                {/* External link for news */}
                {mediaItem.type === 'news' && mediaItem.externalLink && (
                  <div className="mb-6">
                    <a 
                      href={mediaItem.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-teal transition-colors"
                    >
                      View Original Source
                    </a>
                  </div>
                )}
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">{mediaItem.description}</p>
                  <h3 className="text-xl font-bold text-primary mt-6 mb-3">Transcript</h3>
                  <p className="text-gray-700">{mediaItem.transcript}</p>
                </div>
                
                {/* Tags */}
                {mediaItem.tags && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <FiTag className="mr-1" /> TAGS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mediaItem.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Share buttons */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <FiShare2 className="mr-1" /> SHARE
                  </h3>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M7.97 16L12 12l4.03 4v1H7.97zM12 8l-4.03-4v1h8.06V4z" />
                        <path d="M20 3H4c-.5 0-1 .5-1 1v16c0 .5.5 1 1 1h16c.5 0 1-.5 1-1V4c0-.5-.5-1-1-1zm-1 16H5V5h14v14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Speakers */}
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-primary mb-4">Speakers</h3>
              <div className="space-y-4">
                {mediaItem.speakers.map((speaker: string) => (
                  <div key={speaker} className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">{speaker}</h4>
                      <p className="text-sm text-gray-600">
                        {mediaItem.speakerBios && mediaItem.speakerBios[speaker]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Related content */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Related Content</h3>
              {relatedItems.length > 0 ? (
                <div className="space-y-4">
                  {relatedItems.map(item => (
                    <Link href={`/media/${item.type}/${item.id}`} key={item.id} className="flex items-start gap-3 group">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary group-hover:text-accent transition-colors line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-gray-500">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No related content found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 