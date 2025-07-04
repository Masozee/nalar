'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiUser, 
  FiDownload, 
  FiShare2, 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiLink, 
  FiClock,
  FiChevronLeft,
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';
import api, { News } from '@/lib/api';

// Extended News interface for detail page
interface NewsDetail extends News {
  author?: string;
  category?: string;
  content?: string;
  excerpt?: string;
  topics?: string[];
  date?: string; // Formatted date
}

// Fallback mock data
const FALLBACK_NEWS: NewsDetail[] = [
  {
    id: 1,
    title: "Indonesia's Economic Outlook for 2023",
    slug: "indonesia-economic-outlook-2023",
    date_release: "2023-01-15T08:00:00Z",
    date: "January 15, 2023",
    description: "<p>Indonesia's economy is projected to grow by 5.3% in 2023, driven by strong domestic consumption and increasing foreign investment. Despite global economic challenges, Indonesia maintains a positive outlook due to its large domestic market and ongoing infrastructure development.</p><p>The government's focus on digital transformation and renewable energy is expected to create new opportunities for growth and investment. However, challenges remain, including inflation concerns and potential supply chain disruptions.</p>",
    image: "/images/news/economy.jpg",
    publish: true,
    date_created: "2023-01-10T08:00:00Z",
    author: "Dr. Ahmad Wijaya",
    category: "Economy",
    content: "<p>Indonesia's economy is projected to grow by 5.3% in 2023, driven by strong domestic consumption and increasing foreign investment. Despite global economic challenges, Indonesia maintains a positive outlook due to its large domestic market and ongoing infrastructure development.</p><p>The government's focus on digital transformation and renewable energy is expected to create new opportunities for growth and investment. However, challenges remain, including inflation concerns and potential supply chain disruptions.</p><p>Key sectors expected to drive growth include:</p><ul><li>Digital economy and e-commerce</li><li>Renewable energy</li><li>Manufacturing</li><li>Tourism</li></ul><p>The central bank is expected to maintain a cautious approach to monetary policy, balancing growth objectives with inflation management. Fiscal policy will likely remain expansionary, with continued emphasis on infrastructure development and social programs.</p>",
    topics: ["Economy", "Investment", "Policy"]
  },
  {
    id: 2,
    title: "Regional Security Developments in Southeast Asia",
    slug: "regional-security-developments-southeast-asia",
    date_release: "2023-02-20T09:30:00Z",
    date: "February 20, 2023",
    description: "<p>Recent developments in Southeast Asian security dynamics highlight the increasing importance of multilateral cooperation. ASEAN continues to play a central role in regional security architecture, though challenges to its unity persist.</p>",
    image: "/images/news/security.jpg",
    publish: true,
    date_created: "2023-02-15T09:30:00Z",
    author: "Dr. Sarah Johnson",
    category: "Security",
    content: "<p>Recent developments in Southeast Asian security dynamics highlight the increasing importance of multilateral cooperation. ASEAN continues to play a central role in regional security architecture, though challenges to its unity persist.</p><p>Maritime security remains a key concern, with ongoing territorial disputes and increased naval activities by major powers in the region. Cybersecurity has also emerged as a critical area for regional cooperation, as countries face growing threats from state and non-state actors.</p><p>The evolving geopolitical landscape, particularly US-China competition, continues to shape regional security calculations. Southeast Asian nations are increasingly adopting hedging strategies to navigate great power dynamics while preserving strategic autonomy.</p>",
    topics: ["Security", "ASEAN", "International Relations"]
  },
  {
    id: 3,
    title: "Climate Change Adaptation Strategies for Indonesia",
    slug: "climate-change-adaptation-strategies-indonesia",
    date_release: "2023-03-10T10:15:00Z",
    date: "March 10, 2023",
    description: "<p>Indonesia faces significant climate change challenges, including rising sea levels, extreme weather events, and threats to biodiversity. This report examines adaptation strategies being implemented across the archipelago.</p>",
    image: "/images/news/climate.jpg",
    publish: true,
    date_created: "2023-03-05T10:15:00Z",
    author: "Dr. Budi Santoso",
    category: "Environment",
    content: "<p>Indonesia faces significant climate change challenges, including rising sea levels, extreme weather events, and threats to biodiversity. This report examines adaptation strategies being implemented across the archipelago.</p><p>Coastal communities are particularly vulnerable to climate impacts, with Jakarta and other major coastal cities facing severe flooding risks. Community-based adaptation programs have shown promise in building local resilience, combining traditional knowledge with scientific approaches.</p><p>The government has strengthened its climate policy framework, including commitments to reduce greenhouse gas emissions and increase renewable energy capacity. However, implementation challenges remain, particularly in aligning development objectives with climate goals.</p><p>International cooperation and climate finance will be crucial for supporting Indonesia's adaptation efforts, especially for vulnerable communities and ecosystems.</p>",
    topics: ["Climate Change", "Environment", "Policy"]
  }
];

export default function NewsDetail() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [newsItem, setNewsItem] = useState<NewsDetail | null>(null);
  const [recentNews, setRecentNews] = useState<NewsDetail[]>([]);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  useEffect(() => {
    const fetchNewsDetail = async () => {
      setIsLoading(true);
      try {
        // Fetch from the API
        const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/news/${slug}/`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convert API data to our format
        const news: NewsDetail = {
          ...data,
          date: new Date(data.date_release).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          content: data.description,
          excerpt: data.description?.substring(0, 200) + '...' || '',
          topics: data.topic?.map((t: any) => t.name) || [],
        };
        
        setNewsItem(news);
        
        // Fetch recent news
        const recentNewsResponse = await fetch(`${API_URL}/news/?page_size=5`);
        if (recentNewsResponse.ok) {
          const recentNewsData = await recentNewsResponse.json();
          
          // Filter out the current news item and format dates
          const otherNews = recentNewsData.results
            .filter((item: News) => item.slug !== slug)
            .slice(0, 4)
            .map((item: News) => ({
              ...item,
              date: new Date(item.date_release).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
            }));
          
          setRecentNews(otherNews);
        }
      } catch (err) {
        console.error('Error fetching news details:', err);
        setError('Failed to load news details. Please try again later.');
        
        // Fallback to mock data
        const mockNews = FALLBACK_NEWS.find(item => item.slug === slug);
        if (mockNews) {
          setNewsItem(mockNews);
          setRecentNews(FALLBACK_NEWS.filter(item => item.slug !== slug));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNewsDetail();
  }, [slug]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#005357] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading news details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load News</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/news" 
            className="inline-flex items-center text-[#005357] hover:text-[#003e40] font-medium"
          >
            <FiArrowLeft className="mr-2" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }
  
  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">News Not Found</h2>
          <p className="text-gray-600 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/news" 
            className="inline-flex items-center text-[#005357] hover:text-[#003e40] font-medium"
          >
            <FiArrowLeft className="mr-2" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Hero Section with Image Background */}
      <section className="relative w-full h-[50vh] min-h-[400px] bg-[#005357]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
        <Image
          src={newsItem.image}
          alt={newsItem.title}
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
          priority
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          {/* Back to News Link */}
          <Link 
            href="/news" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FiChevronLeft className="mr-1" />
            Back to News
          </Link>
          
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold !text-white mb-4 max-w-4xl"
          >
            {newsItem.title}
          </motion.h1>
          
          {/* Publication date */}
          <div className="mb-4">
            <span className="text-white/80">Published on {newsItem.date}</span>
          </div>
          
          {/* Topics */}
          {newsItem.topics && newsItem.topics.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {newsItem.topics.map((topic, index) => (
                  <Link 
                    key={index}
                    href={`/news?topic=${encodeURIComponent(topic)}`}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* News Content */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Image with credit */}
              <div className="mb-8">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src={newsItem.image}
                    alt={newsItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Image credit */}
                <p className="mt-2 text-xs text-gray-500 text-right italic">
                  {newsItem.image_credit || 'Image: CSIS Indonesia'}
                </p>
              </div>
              
              {/* Content */}
              <div 
                className="prose prose-lg max-w-none mb-12" 
                dangerouslySetInnerHTML={{ __html: newsItem.content || '' }}
              />
              
              {/* Author section if available */}
              {newsItem.author && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-6">Author</h3>
                  <div className="flex items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{newsItem.author}</h4>
                      {newsItem.category && (
                        <p className="text-sm text-gray-700">{newsItem.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 pt-4">
                {/* News Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">News Details</h3>
                  
                  <div className="relative mb-4">
                    <button 
                      onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} 
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#005357] hover:bg-[#003e40] text-white rounded-md transition-colors"
                    >
                      <FiShare2 className="mr-2" />
                      Share This News
                    </button>
                    
                    {isShareMenuOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md p-4 z-10">
                        <div className="flex flex-wrap justify-between gap-2">
                          <a 
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(newsItem.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-[#005357] p-2"
                          >
                            <FiTwitter className="mr-2" />
                            Twitter
                          </a>
                          <a 
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-[#005357] p-2"
                          >
                            <FiLinkedin className="mr-2" />
                            LinkedIn
                          </a>
                          <a 
                            href={`mailto:?subject=${encodeURIComponent(newsItem.title)}&body=${encodeURIComponent(`Check out this news: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                            className="flex items-center text-gray-700 hover:text-[#005357] p-2"
                          >
                            <FiMail className="mr-2" />
                            Email
                          </a>
                          <button 
                            onClick={copyToClipboard}
                            className="flex items-center text-gray-700 hover:text-[#005357] p-2"
                          >
                            <FiLink className="mr-2" />
                            {copySuccess ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Category if available */}
                  {newsItem.category && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Category</span>
                      <span className="text-gray-900 font-medium">{newsItem.category}</span>
                    </div>
                  )}
                  
                  {/* Publication date */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Published</span>
                    <span className="text-gray-900 font-medium">{newsItem.date}</span>
                  </div>
                </div>
                
                {/* Recent News */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent News</h3>
                  
                  {recentNews.length > 0 ? (
                    <div className="space-y-4">
                      {recentNews.map((item) => (
                        <Link 
                          key={item.id}
                          href={`/news/${item.slug}`}
                          className="block group"
                        >
                          <div className="flex items-start">
                            <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0 mr-4">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-[#005357] transition-colors line-clamp-2">
                                {item.title}
                              </h4>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.date}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      <Link 
                        href="/news"
                        className="inline-flex items-center text-[#005357] hover:text-[#003e40] font-medium mt-4"
                      >
                        View All News
                        <FiArrowRight className="ml-2" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent news available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
