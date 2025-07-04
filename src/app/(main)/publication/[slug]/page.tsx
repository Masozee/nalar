'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
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
  FiCheck
} from 'react-icons/fi';

// Define types for our publication data
interface PublicationReference {
  title: string;
  author: string;
  link?: string;
}

interface PublicationAuthor {
  id: number;
  name: string;
  slug: string;
  position?: string;
  organization?: string;
  image?: string;
  profile_img?: string;
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
  category_info?: {
    id: number;
    name: string;
    slug: string;
    background: string;
  };
  authors: PublicationAuthor[];
  file?: string;
  image: string;
  topic?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  download_count?: number;
  viewed?: number;
  tags?: string[];
  image_credit?: string;
  related_publications?: Array<{
    id: number;
    title: string;
    slug: string;
    date_publish: string;
    image?: string;
    authors?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  }>;
  recommended_publications?: Array<{
    id: number;
    title: string;
    slug: string;
    date_publish: string;
    image?: string;
    authors?: Array<{
      id: number;
      name: string;
      slug: string;
      position?: string;
    }>;
    topics?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    match_reason?: string;
  }>;
}

interface Publication {
  id: number;
  slug: string;
  title: string;
  category: string;
  type: string;
  author: string;
  authorTitle?: string;
  authorBio?: string;
  authorImage?: string;
  date: string;
  readTime?: string;
  excerpt: string;
  content?: string;
  image: string;
  topics: string[];
  download: string;
  references?: PublicationReference[];
  relatedPublications?: number[];
}

// Fallback mock data
const FALLBACK_PUBLICATIONS: Publication[] = [
  {
    id: 1,
    slug: 'understanding-indonesias-foreign-policy',
    title: 'Understanding Indonesia\'s Foreign Policy Positioning in the Indo-Pacific',
    category: 'International Relations',
    type: 'Policy Brief',
    author: 'Dr. Lina Alexandra',
    authorTitle: 'Deputy Director for Research',
    authorBio: 'Dr. Lina Alexandra is the Deputy Director for Research at CSIS Indonesia, specializing in international relations and ASEAN studies.',
    authorImage: '/authors/lina-alexandra.jpg',
    date: 'May 15, 2024',
    readTime: '15 min read',
    excerpt: 'Analyzing Indonesia\'s strategic approach to regional diplomacy within the evolving Indo-Pacific framework.',
    content: `
      <h2>Executive Summary</h2>
      <p>This policy brief examines Indonesia's position in the evolving Indo-Pacific strategic landscape, analyzing key dimensions of its foreign policy approach and offering recommendations for policymakers.</p>
    `,
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    topics: ['Foreign Policy', 'Regional Cooperation', 'Indo-Pacific Strategy', 'ASEAN', 'South China Sea'],
    download: '/documents/policy-brief-indonesia-foreign-policy.pdf',
    references: [],
    relatedPublications: [2, 6, 7]
  }
];

export default function PublicationDetail() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [publication, setPublication] = useState<Publication | null>(null);
  const [apiPublication, setApiPublication] = useState<ApiPublication | null>(null);
  const [relatedPublications, setRelatedPublications] = useState<Publication[]>([]);
  const [recommendedPublications, setRecommendedPublications] = useState<any[]>([]);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago'>('apa');
  const [copiedCitation, setCopiedCitation] = useState(false);
  
  const generateCitation = (style: 'apa' | 'mla' | 'chicago') => {
    if (!publication || !apiPublication) return '';
    
    const authorLastNames = apiPublication.authors?.map(author => {
      const nameParts = author.name.split(' ');
      return nameParts[nameParts.length - 1]; // Get last name
    }).join(', ') || 'Author Unknown';
    
    const authorNames = apiPublication.authors?.map(author => author.name).join(', ') || 'Author Unknown';
    const year = new Date(apiPublication.date_publish).getFullYear();
    const month = new Date(apiPublication.date_publish).toLocaleString('en-US', { month: 'long' });
    const day = new Date(apiPublication.date_publish).getDate();
    const title = publication.title;
    const org = 'CSIS Indonesia';
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    switch (style) {
      case 'apa':
        return `${authorLastNames}. (${year}). ${title}. ${org}. Retrieved from ${url}`;
      case 'mla':
        return `${authorLastNames}. "${title}." ${org}, ${day} ${month} ${year}, ${url}.`;
      case 'chicago':
        return `${authorNames}. "${title}." ${org}, ${month} ${day}, ${year}. ${url}.`;
      default:
        return '';
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const copyCitation = () => {
    const citation = generateCitation(citationStyle);
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };
  
  useEffect(() => {
    const fetchPublication = async () => {
      setIsLoading(true);
      try {
        // Fetch from the API using environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/publications/${slug}/`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch publication: ${response.status}`);
        }
        
        const data = await response.json();
        setApiPublication(data);
        
        // Convert API data to our format
        const pub: Publication = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          category: data.category_info?.name || data.category?.name || 'Uncategorized',
          type: data.category_info?.name || data.category?.name || 'Publication',
          author: data.authors?.length > 0 ? data.authors[0].name : 'Unknown',
          authorTitle: data.authors?.length > 0 ? data.authors[0].position : undefined,
          authorImage: data.authors?.length > 0 ? (data.authors[0].profile_img || data.authors[0].image) : undefined,
          date: new Date(data.date_publish).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          excerpt: data.description?.substring(0, 200) + '...' || '',
          content: data.description,
          image: data.image,
          topics: data.topic?.map(t => t.name) || [],
          download: data.file || '',
        };
        
        setPublication(pub);
        
        // Set recommended publications from API if available
        if (data.recommended_publications && data.recommended_publications.length > 0) {
          setRecommendedPublications(data.recommended_publications);
        } else if (data.related_publications && data.related_publications.length > 0) {
          // Fallback to related publications if recommendations aren't available
          const apiRelatedPubs = data.related_publications.map(pub => ({
            id: pub.id,
            slug: pub.slug,
            title: pub.title,
            category: 'Publication',
            type: 'Publication',
            author: pub.authors?.length > 0 ? pub.authors[0].name : 'Unknown',
            date: new Date(pub.date_publish).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            excerpt: '',
            image: pub.image || '/placeholder-image.jpg',
            topics: [],
            download: '',
          }));
          setRelatedPublications(apiRelatedPubs);
        } else {
          // Fallback to related publications from mock data
          if (FALLBACK_PUBLICATIONS.find(p => p.slug === slug)?.relatedPublications) {
            const mockPublication = FALLBACK_PUBLICATIONS.find(p => p.slug === slug);
            // Get related publications
            if (mockPublication?.relatedPublications) {
              const related = mockPublication.relatedPublications.map(id => 
                FALLBACK_PUBLICATIONS.find(pub => pub.id === id)
              ).filter((pub): pub is Publication => pub !== undefined);
              setRelatedPublications(related);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Fallback to mock data if API fails
        const mockPublication = FALLBACK_PUBLICATIONS.find(p => p.slug === slug);
        if (mockPublication) {
          setPublication(mockPublication);
          
          // Get related publications
          if (mockPublication.relatedPublications) {
            const related = mockPublication.relatedPublications.map(id => 
              FALLBACK_PUBLICATIONS.find(pub => pub.id === id)
            ).filter((pub): pub is Publication => pub !== undefined);
            setRelatedPublications(related);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchPublication();
    }
  }, [slug]);
  
  if (isLoading) {
    return (
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              </div>
            </div>
          </div>
        </main>
    );
  }
  
  if (error && !publication) {
    return (
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Publication</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link href="/publications" className="inline-flex items-center text-accent hover:underline">
                <FiArrowLeft className="mr-2" />
                Back to Publications
              </Link>
            </div>
          </div>
        </main>
    );
  }
  
  if (!publication) {
    return (
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Publication not found</h1>
              <p className="text-gray-600 mb-8">The publication you&apos;re looking for doesn&apos;t exist or has been moved.</p>
              <Link href="/publications" className="inline-flex items-center text-accent hover:underline">
                <FiArrowLeft className="mr-2" />
                Back to Publications
              </Link>
            </div>
          </div>
        </main>
    );
  }
  
  return (
    <>
      <main className="">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/publications" className="hover:text-gray-700">Publications</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium truncate">{publication.title}</span>
            </div>
          </div>
        </div>
        
        {/* Publication Header - Redesigned with green background */}
        <section 
          className="bg-primary text-white py-10 md:py-16"
          style={{
            backgroundImage: apiPublication?.category_info?.background ? 
              `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${apiPublication.category_info.background})` :
              'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {publication.category}
              </span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {publication.type}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold !text-white mb-6">
              {publication.title}
            </h1>
            
            {/* Publication date - without icons */}
            <div className="mb-4">
              <span className="text-white/80">Published on {publication.date}</span>
            </div>
            
            {/* Topics moved below title */}
            {publication.topics.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {publication.topics.map((topic, index) => (
                    <Link 
                      key={index}
                      href={`/publications?topic=${encodeURIComponent(topic)}`}
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
        
        {/* Publication Content */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Featured Image with credit below */}
                <div className="mb-8">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={publication.image}
                      alt={publication.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Image credit */}
                  <p className="mt-2 text-xs text-gray-500 text-right italic">
                    {apiPublication?.image_credit || 'Image: CSIS Indonesia'}
                  </p>
                </div>
                
                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none mb-12" 
                  dangerouslySetInnerHTML={{ __html: publication.content || '' }}
                />
                
                {/* Related Issue - Using recommended publications */}
                {recommendedPublications.length > 0 ? (
                  <div className="mt-12 mb-12 py-8 px-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-6">Related Issue</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommendedPublications.map((pub) => (
                        <Link 
                          key={pub.id}
                          href={`/publication/${pub.slug}`}
                          className="block group bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start">
                            <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0 mr-4">
                              <Image
                                src={pub.image || '/placeholder-image.jpg'}
                                alt={pub.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="w-full">
                              <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors mb-1">
                                {pub.title}
                              </h4>
                              <div className="text-xs text-gray-500">
                                {new Date(pub.date_publish).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : relatedPublications.length > 0 ? (
                  // Fallback to old related publications if recommendations aren't available
                  <div className="mt-12 mb-12 py-8 px-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-6">Related Issue</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedPublications.map((pub) => (
                        <Link 
                          key={pub.id}
                          href={`/publication/${pub.slug}`}
                          className="block group bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start">
                            <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0 mr-4">
                              <Image
                                src={pub.image}
                                alt={pub.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors mb-1">
                                {pub.title}
                              </h4>
                              <div className="text-xs text-gray-500">
                                <span className="mr-2">{pub.author}</span>
                                <span>|</span>
                                <span className="ml-2">{pub.date}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Show a message if no related content is available
                  <div className="mt-12 mb-12 py-8 px-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Related Issue</h3>
                    <p className="text-gray-500">No related publications available for this content.</p>
                  </div>
                )}
                
                {/* Authors section */}
                {apiPublication?.authors && apiPublication.authors.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-6">Authors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {apiPublication.authors.map((author, index) => (
                        <div key={index} className="flex items-start">
                          {(author.profile_img || author.image) && (
                            <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                              <Image
                                src={author.profile_img || author.image || ''}
                                alt={author.name}
                                width={80}
                                height={80}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{author.name}</h4>
                            {author.position && author.organization ? (
                              <p className="text-sm text-gray-700">
                                {author.position}, <span className="text-gray-500">{author.organization}</span>
                              </p>
                            ) : (
                              <>
                                {author.position && <p className="text-sm text-gray-700">{author.position}</p>}
                                {author.organization && <p className="text-sm text-gray-500">{author.organization}</p>}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Citation Section - Moved from sidebar */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-6">Citation</h3>
                  
                  {/* Citation Style Selector */}
                  <div className="mb-4">
                    <div className="flex border border-gray-300 rounded-md overflow-hidden max-w-md">
                      <button 
                        onClick={() => setCitationStyle('apa')}
                        className={`flex-1 py-2 text-sm font-medium ${citationStyle === 'apa' 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        APA
                      </button>
                      <button 
                        onClick={() => setCitationStyle('mla')}
                        className={`flex-1 py-2 text-sm font-medium border-l border-gray-300 ${citationStyle === 'mla' 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        MLA
                      </button>
                      <button 
                        onClick={() => setCitationStyle('chicago')}
                        className={`flex-1 py-2 text-sm font-medium border-l border-gray-300 ${citationStyle === 'chicago' 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Chicago
                      </button>
                    </div>
                  </div>
                  
                  {/* Citation Text */}
                  <div className="relative mb-4 border border-gray-300 rounded-md p-4 max-w-3xl">
                    <div className="relative">
                      <div className="bg-white p-4 text-sm text-gray-800 break-words min-h-[100px] overflow-y-auto pr-10">
                        {generateCitation(citationStyle)}
                      </div>
                      <button 
                        onClick={copyCitation}
                        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full"
                        title="Copy citation"
                      >
                        {copiedCitation ? <FiCheck size={18} className="text-green-500" /> : <FiCopy size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 italic max-w-3xl">
                    Citation styles may require manual adjustments based on specific requirements.
                  </p>
                </div>
                
                {/* References */}
                {publication.references && publication.references.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">References</h3>
                    <ul className="space-y-3">
                      {publication.references.map((reference, index) => (
                        <li key={index} className="text-gray-700">
                          {reference.link ? (
                            <a 
                              href={reference.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline"
                            >
                              {reference.title}
                            </a>
                          ) : (
                            reference.title
                          )}
                          <span className="block text-sm text-gray-500">{reference.author}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 pt-4">
                  {/* Publication Stats */}
                  {(apiPublication?.download_count !== undefined || apiPublication?.viewed !== undefined) && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Publication Stats</h3>
                      <div className="space-y-3">
                        {apiPublication?.viewed !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              Views
                            </span>
                            <span className="text-gray-900 font-medium">{apiPublication.viewed.toLocaleString()}</span>
                          </div>
                        )}
                        {apiPublication?.download_count !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Downloads
                            </span>
                            <span className="text-gray-900 font-medium">{apiPublication.download_count.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Download and Share */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Publication Details</h3>
                    {publication.download && (
                      <a 
                        href={publication.download}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-2 mb-4 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
                      >
                        <FiDownload className="mr-2" />
                        Download PDF
                      </a>
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} 
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <FiShare2 className="mr-2" />
                        Share
                      </button>
                      
                      {isShareMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md p-4 z-10">
                          <div className="flex flex-wrap justify-between gap-2">
                            <a 
                              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(publication.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiTwitter className="mr-2" />
                              Twitter
                            </a>
                            <a 
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiLinkedin className="mr-2" />
                              LinkedIn
                            </a>
                            <a 
                              href={`mailto:?subject=${encodeURIComponent(publication.title)}&body=${encodeURIComponent(`Check out this publication: ${window.location.href}`)}`}
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiMail className="mr-2" />
                              Email
                            </a>
                            <button 
                              onClick={copyToClipboard}
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiLink className="mr-2" />
                              {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 