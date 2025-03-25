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
  FiArrowLeft
} from 'react-icons/fi';

// Define types for our publication data
interface PublicationReference {
  title: string;
  author: string;
  link?: string;
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

// This is a mock database that would be replaced with your actual data fetching
const PUBLICATIONS: Publication[] = [
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
      <p>This policy brief examines Indonesia's position in the evolving Indo-Pacific strategic landscape, analyzing key dimensions of its foreign policy approach and offering recommendations for policymakers. As geopolitical competition intensifies in the region, Indonesia faces complex choices in balancing relations with major powers while maintaining its traditional non-aligned stance.</p>
      
      <h2>Introduction</h2>
      <p>The Indo-Pacific concept has emerged as a pivotal framework for understanding regional dynamics in Asia. For Indonesia, navigating this evolving strategic landscape requires careful calibration of its diplomatic positions, economic relationships, and security partnerships. This brief analyzes Indonesia's current approach and offers policy recommendations.</p>
      
      <h2>Key Dimensions of Indonesia's Indo-Pacific Strategy</h2>
      
      <h3>1. Diplomatic Positioning</h3>
      <p>Indonesia has consistently advocated for an inclusive Indo-Pacific concept through its "ASEAN Outlook on the Indo-Pacific" (AOIP). This approach emphasizes openness, transparency, inclusivity, and ASEAN centrality in regional architecture. By promoting this vision, Indonesia attempts to mitigate the potential divisiveness of competing Indo-Pacific concepts put forward by major powers.</p>
      
      <h3>2. Economic Engagement</h3>
      <p>Economically, Indonesia has pursued a diversified approach to engagement across the Indo-Pacific. While China remains Indonesia's largest trading partner, Jakarta has sought to balance this relationship with strengthened economic ties with other partners, including Japan, India, and Australia. The Regional Comprehensive Economic Partnership (RCEP) and bilateral free trade agreements form key components of this strategy.</p>
      
      <h3>3. Security Dynamics</h3>
      <p>In the security domain, Indonesia maintains its traditional non-aligned posture, eschewing formal alliances while developing pragmatic security partnerships with a range of countries. Maritime security cooperation has become increasingly important as Indonesia seeks to protect its sovereign rights in the Natuna Sea and address traditional and non-traditional security challenges.</p>
      
      <h2>Strategic Challenges and Opportunities</h2>
      
      <h3>US-China Competition</h3>
      <p>The intensifying strategic competition between the United States and China presents both challenges and opportunities for Indonesia. While heightened regional tensions could constrain Indonesia's foreign policy space, it also creates opportunities for Jakarta to enhance its strategic value to both powers and extract concessions or benefits.</p>
      
      <h3>Regional Maritime Disputes</h3>
      <p>The South China Sea disputes, including overlapping claims with China in the North Natuna Sea, represent a significant challenge for Indonesia's regional diplomacy. Jakarta's approach has been to maintain a firm stance on its sovereign rights while avoiding unnecessarily provocative actions that could escalate tensions.</p>
      
      <h3>Intra-ASEAN Dynamics</h3>
      <p>Divergent perspectives within ASEAN regarding the Indo-Pacific concept and approaches to major power competition create complexities for Indonesia's regional leadership ambitions. Maintaining ASEAN cohesion while advancing Indonesia's specific interests requires careful diplomatic navigation.</p>
      
      <h2>Policy Recommendations</h2>
      
      <p>Based on this analysis, the following recommendations are offered for Indonesian policymakers:</p>
      
      <ol>
        <li>Strengthen Indonesia's role as a norm entrepreneur in shaping inclusive Indo-Pacific regional architecture through ASEAN-led platforms.</li>
        <li>Diversify economic partnerships across the Indo-Pacific to reduce over-dependence on any single market while leveraging Indonesia's strategic position in regional supply chains.</li>
        <li>Enhance maritime capabilities and domain awareness in key strategic waterways, particularly in the Natuna Sea, through targeted defense investments and international cooperation.</li>
        <li>Develop more robust multilateral frameworks for managing great power competition in Southeast Asia that preserve ASEAN centrality.</li>
        <li>Leverage Indonesia's non-aligned status to serve as a credible mediator in regional disputes and build coalitions around specific issues where interests align.</li>
      </ol>
      
      <h2>Conclusion</h2>
      
      <p>Indonesia's strategic position in the Indo-Pacific offers significant opportunities for enhanced regional influence, provided Jakarta can navigate the complexities of great power competition while maintaining cohesion within ASEAN. By pursuing a balanced, principled, yet pragmatic approach to regional challenges, Indonesia can effectively advance its national interests while contributing to regional stability and prosperity.</p>
    `,
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    topics: ['Foreign Policy', 'Regional Cooperation', 'Indo-Pacific Strategy', 'ASEAN', 'South China Sea'],
    download: '/documents/policy-brief-indonesia-foreign-policy.pdf',
    references: [
      {
        title: 'ASEAN Outlook on the Indo-Pacific (2019)',
        author: 'ASEAN Secretariat',
        link: 'https://asean.org/asean-outlook-on-the-indo-pacific/'
      },
      {
        title: 'Indonesia\'s Indo-Pacific Vision: Balancing Pragmatism and Principle',
        author: 'Roberts, C., & Widyaningsih, E.',
        link: 'https://example.com/indonesia-indo-pacific'
      },
      {
        title: 'Strategic Hedging in the Indo-Pacific: A Theoretical Framework',
        author: 'Kuik, C.C.',
        link: 'https://example.com/strategic-hedging'
      }
    ],
    relatedPublications: [2, 6, 7]
  },
  {
    id: 2,
    slug: 'asean-digital-integration',
    title: 'Economic Implications of ASEAN Digital Integration',
    category: 'Economics',
    type: 'Research Report',
    author: 'Dr. Yose Rizal Damuri',
    authorTitle: 'Head of Economics Department',
    date: 'April 28, 2024',
    excerpt: 'Examining the opportunities and challenges presented by ASEAN\'s digital integration initiatives for Indonesia\'s economy.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    topics: ['Digital Economy', 'ASEAN', 'Economic Integration'],
    download: '/documents/asean-digital-integration.pdf',
  },
  {
    id: 6,
    slug: 'south-china-sea-security',
    title: 'Security Implications of South China Sea Disputes',
    category: 'Security',
    type: 'Commentary',
    author: 'Dr. Evan Laksmana',
    authorTitle: 'Senior Researcher',
    date: 'March 15, 2024',
    excerpt: 'Analysis of recent developments in the South China Sea and implications for regional security architecture.',
    image: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
    topics: ['Maritime Security', 'South China Sea', 'Regional Disputes'],
    download: '/documents/south-china-sea-security.pdf',
  },
  {
    id: 7,
    slug: 'indonesia-eu-relations',
    title: 'The Future of Indonesia-EU Economic Relations',
    category: 'Economics',
    type: 'Research Report',
    author: 'Dr. Josef Yap',
    authorTitle: 'Senior Economist',
    date: 'February 28, 2024',
    excerpt: 'Examining opportunities for enhanced economic cooperation between Indonesia and the European Union.',
    image: '/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg',
    topics: ['Trade', 'International Economics', 'EU Relations'],
    download: '/documents/indonesia-eu-relations.pdf',
  }
];

export default function PublicationDetail() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [publication, setPublication] = useState<Publication | null>(null);
  const [relatedPublications, setRelatedPublications] = useState<Publication[]>([]);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    // In a real application, you would fetch this data from your API
    const foundPublication = PUBLICATIONS.find(pub => pub.slug === slug);
    setPublication(foundPublication || null);
    
    if (foundPublication?.relatedPublications) {
      const related = foundPublication.relatedPublications.map((id: number) => 
        PUBLICATIONS.find(pub => pub.id === id)
      ).filter((pub): pub is Publication => pub !== undefined);
      setRelatedPublications(related);
    }
  }, [slug]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  if (!publication) {
    return (
      <>
        <NavBar />
        <main className="pt-20 min-h-screen">
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
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <NavBar />
      <main className="pt-20">
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
        
        {/* Publication Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                {publication.category}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                {publication.type}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {publication.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-gray-600 text-sm mb-6 gap-y-2">
              <div className="flex items-center mr-6">
                <FiUser className="mr-2 text-gray-400" />
                <span>{publication.author}</span>
              </div>
              <div className="flex items-center mr-6">
                <FiCalendar className="mr-2 text-gray-400" />
                <span>{publication.date}</span>
              </div>
              {publication.readTime && (
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-400" />
                  <span>{publication.readTime}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={publication.download}
                className="inline-flex items-center bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md transition-colors"
                download
              >
                <FiDownload className="mr-2" />
                Download PDF
              </a>
              
              <div className="relative">
                <button
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  className="inline-flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-md transition-colors"
                >
                  <FiShare2 className="mr-2" />
                  Share
                </button>
                
                {isShareMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(publication.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiTwitter className="mr-3 text-[#1DA1F2]" />
                        Share on Twitter
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(publication.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLinkedin className="mr-3 text-[#0077B5]" />
                        Share on LinkedIn
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(publication.title)}&body=${encodeURIComponent(`Check out this publication from CSIS Indonesia: ${window.location.href}`)}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiMail className="mr-3 text-gray-500" />
                        Share via Email
                      </a>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiLink className="mr-3 text-gray-500" />
                        {copySuccess ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Publication Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-8">
                <div className="mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={publication.image}
                    alt={publication.title}
                    width={800}
                    height={450}
                    className="w-full h-auto"
                  />
                </div>
                
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-accent"
                  dangerouslySetInnerHTML={{ __html: publication.content || '' }}
                />
                
                {/* References */}
                {publication.references && publication.references.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-primary mb-6">References</h2>
                    <ul className="space-y-4">
                      {publication.references.map((ref: PublicationReference, index: number) => (
                        <li key={index} className="text-gray-700">
                          {index + 1}. {ref.author} ({new Date(publication.date).getFullYear()}). &quot;{ref.title}&quot;.{' '}
                          {ref.link && (
                            <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              Available at: {ref.link}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Topics */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {publication.topics.map((topic: string) => (
                      <Link
                        key={topic}
                        href={`/publications?topic=${encodeURIComponent(topic)}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-4">
                {/* Author Info */}
                {publication.authorImage && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-primary mb-4">About the Author</h3>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                        <Image
                          src={publication.authorImage}
                          alt={publication.author}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{publication.author}</h4>
                        <p className="text-gray-600 text-sm">{publication.authorTitle}</p>
                      </div>
                    </div>
                    {publication.authorBio && (
                      <p className="text-gray-700 text-sm">{publication.authorBio}</p>
                    )}
                  </div>
                )}
                
                {/* Publication Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold text-primary mb-4">Publication Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Publication Date:</span>
                      <span className="text-gray-900 font-medium">{publication.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900 font-medium">{publication.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900 font-medium">{publication.type}</span>
                    </div>
                    {publication.readTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Read Time:</span>
                        <span className="text-gray-900 font-medium">{publication.readTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Download Options */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold text-primary mb-4">Download Options</h3>
                  <div className="space-y-3">
                    <a
                      href={publication.download}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      download
                    >
                      <span className="font-medium">Full PDF</span>
                      <FiDownload />
                    </a>
                    {publication.excerpt && (
                      <a
                        href="#"
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium">Executive Summary</span>
                        <FiDownload />
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Related Publications */}
                {relatedPublications.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-primary mb-4">Related Publications</h3>
                    <div className="space-y-4">
                      {relatedPublications.map((pub) => (
                        <Link 
                          key={pub.id} 
                          href={`/publications/${pub.slug}`} 
                          className="block group"
                        >
                          <div className="flex items-start">
                            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden mr-3">
                              <Image
                                src={pub.image}
                                alt={pub.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-gray-900 font-medium group-hover:text-accent transition-colors">
                                {pub.title}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                {pub.date} • {pub.type}
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
        
        {/* Back to Publications */}
        <section className="py-8 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link 
              href="/publications" 
              className="inline-flex items-center text-accent hover:underline"
            >
              <FiChevronLeft className="mr-2" />
              Back to Publications
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
