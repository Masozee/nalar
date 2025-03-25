'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { 
  FiCalendar, 
  FiDownload, 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiLink,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiLock,
  FiUnlock,
  FiArrowLeft,
  FiSearch,
  FiFile,
  FiInfo,
  FiLoader,
  FiMapPin
} from 'react-icons/fi';

// Define Speaker interface
interface Speaker {
  name: string;
  title: string;
  organization: string;
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

// Define Event interface
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
  description: string;
  image: string;
  posterImage?: string;
  youtubeUrl?: string;
  topics: string[];
  speakers: Speaker[];
  photos?: Photo[];
  registrationLink?: string;
  status: 'upcoming' | 'past' | 'ongoing';
  additionalMaterials?: {
    title: string;
    description: string;
    url: string;
  }[];
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
    topics: ['ASEAN', 'Economic Integration', 'Regional Trade'],
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
    date: 'May 18, 2024',
    time: '13:00 - 16:30 WIB',
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
    topics: ['Security', 'Indo-Pacific', 'Regional Cooperation'],
    speakers: [
      {
        name: 'Prof. Dewi Fortuna Anwar',
        title: 'Research Professor',
        organization: 'Indonesian Institute of Sciences (LIPI)',
        bio: 'Professor Dewi Fortuna Anwar is a distinguished scholar of international relations with a focus on Indonesia\'s foreign policy and regional security dynamics in Southeast Asia.',
        image: '/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg',
        presentation: {
          title: 'Indonesia\'s Vision for Indo-Pacific Security Architecture',
          file: '/documents/presentations/anwar-indonesia-vision.pdf'
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
      },
      {
        name: 'Dr. Shafiah Muhibat',
        title: 'Head of Department of International Relations',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Shafiah Muhibat\'s research interests include maritime security, regional cooperation, and non-traditional security issues in the Indo-Pacific region.',
        image: '/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg',
        presentation: {
          title: 'Maritime Security Challenges in the Indo-Pacific',
          file: '/documents/presentations/muhibat-maritime-security.pdf'
        }
      }
    ],
    registrationLink: '/register/indo-pacific-security-dialogue',
    status: 'upcoming',
  },
  {
    id: 9,
    slug: 'annual-policy-forum-2024',
    title: 'CSIS Annual Policy Forum 2024: Navigating Global Challenges',
    date: 'June 15, 2024',
    time: '08:30 - 17:00 WIB',
    location: 'Jakarta Convention Center',
    eventType: 'Conference',
    accessType: 'public',
    excerpt: 'Our flagship annual conference bringing together policy experts, government officials, and thought leaders from across the region.',
    description: `
      <p>The CSIS Annual Policy Forum is our premier event bringing together distinguished experts, government officials, and thought leaders to discuss the most pressing policy challenges facing Indonesia and the wider region.</p>

      <p>This year's theme, "Navigating Global Challenges," reflects the increasingly complex international environment and the need for innovative policy responses. The forum will feature keynote addresses, panel discussions, and interactive sessions across a range of critical topics.</p>
      
      <p>Key themes for discussion include:</p>
      <ul>
        <li>Geopolitical shifts and their implications for Southeast Asia</li>
        <li>Economic resilience in an era of uncertainty</li>
        <li>Climate change and sustainable development</li>
        <li>Digital transformation and its policy implications</li>
        <li>Regional security architecture</li>
      </ul>
      
      <p>The Annual Policy Forum offers unparalleled networking opportunities and exposure to cutting-edge policy thinking. Attendance is open to the public with prior registration, and the proceedings will be livestreamed for those unable to attend in person.</p>
    `,
    image: '/bg/getty-images-C3gjLSgTKNw-unsplash.jpg',
    posterImage: '/bg/getty-images-C3gjLSgTKNw-unsplash.jpg',
    topics: ['Foreign Policy', 'Economic Development', 'Climate Change', 'Digital Economy', 'Security'],
    speakers: [
      {
        name: 'Dr. Rizal Sukma',
        title: 'Senior Fellow',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Rizal Sukma is a prominent Indonesian foreign policy expert who previously served as Indonesia\'s Ambassador to the United Kingdom. His research focuses on regional security dynamics and Indonesia\'s strategic positioning.',
        image: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
        presentation: {
          title: 'Indonesia\'s Foreign Policy in a Changing World Order',
          file: '/documents/presentations/sukma-foreign-policy.pdf'
        }
      },
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
        name: 'Dr. Chatib Basri',
        title: 'Former Minister of Finance',
        organization: 'Republic of Indonesia',
        bio: 'Dr. Chatib Basri is a distinguished economist who served as Indonesia\'s Minister of Finance. He has extensive experience in economic policy and international economic relations.',
        image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
        presentation: {
          title: 'Economic Resilience in Times of Uncertainty',
          file: '/documents/presentations/basri-economic-resilience.pdf'
        }
      },
      {
        name: 'Dr. Yose Rizal Damuri',
        title: 'Head of Economics Department',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Yose Rizal Damuri leads economic research at CSIS Indonesia, focusing on international trade, regional integration, and the digital economy.',
        image: '/bg/wildan-kurniawan-m0JLVP04Heo-unsplash.png',
        presentation: {
          title: 'The Future of Global Trade Architecture',
          file: '/documents/presentations/damuri-global-trade.pdf'
        }
      },
      {
        name: 'Dr. Shafiah Muhibat',
        title: 'Head of Department of International Relations',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Shafiah Muhibat\'s research interests include maritime security, regional cooperation, and non-traditional security issues in the Indo-Pacific region.',
        image: '/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg',
        presentation: {
          title: 'Maritime Security Challenges in Southeast Asia',
          file: '/documents/presentations/muhibat-maritime-security.pdf'
        }
      },
      {
        name: 'Dr. Philips Vermonte',
        title: 'Executive Director',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Philips Vermonte leads CSIS Indonesia as its Executive Director, bringing expertise in Indonesian politics, democratization, and electoral systems.',
        image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
        presentation: {
          title: 'Democratic Resilience in Southeast Asia',
          file: '/documents/presentations/vermonte-democratic-resilience.pdf'
        }
      },
      {
        name: 'Dr. Amanda Katili',
        title: 'Climate Policy Expert',
        organization: 'Ministry of Environment and Forestry',
        bio: 'Dr. Amanda Katili is a leading expert on climate change policy and has represented Indonesia in various international climate negotiations.',
        image: '/bg/shubham-dhage-PACWvLRNzj8-unsplash.jpg',
        presentation: {
          title: 'Indonesia\'s Climate Change Strategy',
          file: '/documents/presentations/katili-climate-strategy.pdf'
        }
      }
    ],
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    photos: [
      {
        src: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
        alt: 'Opening session of the Annual Policy Forum',
        width: 1200,
        height: 800
      },
      {
        src: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
        alt: 'Panel discussion on global economic trends',
        width: 1200,
        height: 800
      },
      {
        src: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
        alt: 'Networking session during the forum',
        width: 1200,
        height: 800
      },
      {
        src: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
        alt: 'Keynote address on foreign policy',
        width: 1200,
        height: 800
      }
    ],
    registrationLink: '/register/annual-policy-forum-2024',
    status: 'upcoming',
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
    description: `
      <p>The CSIS Indonesia Digital Economy Forum was held on April 20, 2024, bringing together government officials, business leaders, and academic experts to discuss the current state and future prospects of Indonesia's digital economy.</p>

      <p>The forum examined several key aspects of Indonesia's digital transformation:</p>
      <ul>
        <li>Current trends and future projections for Indonesia's digital economy</li>
        <li>Policy frameworks to support digital innovation and entrepreneurship</li>
        <li>Digital infrastructure development challenges and opportunities</li>
        <li>Digital inclusion and bridging the digital divide</li>
      </ul>
      
      <p>The event featured presentations from leading experts in the field, followed by interactive panel discussions and networking opportunities. Participants gained valuable insights into the factors driving Indonesia's digital economy growth and potential policy recommendations to enhance this vital sector.</p>
    `,
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    photos: [
      {
        src: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
        alt: 'Opening session of the Digital Economy Forum',
        width: 1200,
        height: 800
      },
      {
        src: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
        alt: 'Panel discussion on digital infrastructure',
        width: 1200,
        height: 800
      },
      {
        src: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
        alt: 'Networking session during the forum',
        width: 1200,
        height: 800
      },
      {
        src: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
        alt: 'Presentation on digital economy trends',
        width: 1200,
        height: 800
      }
    ],
    topics: ['Digital Economy', 'Technology', 'Economic Development'],
    speakers: [
      {
        name: 'Dr. Yose Rizal Damuri',
        title: 'Head of Economics Department',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Yose Rizal Damuri leads economic research at CSIS Indonesia, focusing on international trade, regional integration, and the digital economy.',
        image: '/bg/wildan-kurniawan-m0JLVP04Heo-unsplash.png',
        presentation: {
          title: 'The State of Indonesia\'s Digital Economy 2024',
          file: '/documents/presentations/damuri-digital-economy.pdf'
        }
      },
      {
        name: 'Dr. Titik Anas',
        title: 'Senior Economist',
        organization: 'CSIS Indonesia',
        bio: 'Dr. Titik Anas specializes in trade policy, economic development, and digital transformation of traditional economic sectors.',
        image: '/bg/getty-images-C3gjLSgTKNw-unsplash.jpg',
        presentation: {
          title: 'Digital Transformation of MSMEs in Indonesia',
          file: '/documents/presentations/anas-digital-msmes.pdf'
        }
      },
      {
        name: 'Dr. Siwage Dharma Negara',
        title: 'Senior Fellow',
        organization: 'ISEAS-Yusof Ishak Institute',
        bio: 'Dr. Siwage Dharma Negara researches economic development in Indonesia with a focus on industrial policy and technological innovation.',
        image: '/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg',
        presentation: {
          title: 'Digital Infrastructure Development in Indonesia',
          file: '/documents/presentations/negara-digital-infrastructure.pdf'
        }
      }
    ],
    status: 'past',
  }
];

const EventDetail = () => {
  const params = useParams();
  const slug = params.slug as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [speakerFilter, setSpeakerFilter] = useState('');
  const [showSpeakersInMain, setShowSpeakersInMain] = useState(false);
  
  // Filter speakers based on search input
  const filteredSpeakers = event?.speakers?.filter(speaker => {
    if (!speakerFilter) return true;
    const searchTerm = speakerFilter.toLowerCase();
    return (
      speaker.name.toLowerCase().includes(searchTerm) ||
      (speaker.organization && speaker.organization.toLowerCase().includes(searchTerm))
    );
  });
  
  // Fetch event data
  useEffect(() => {
    // Find the event with the matching slug
    const foundEvent = EVENTS.find(e => e.slug === slug);
    setEvent(foundEvent || null);
  }, [slug]);
  
  useEffect(() => {
    if (event) {
      // Determine if speakers should be shown in main content area based on count
      setShowSpeakersInMain(event.speakers && event.speakers.length > 4);
    }
  }, [event]);
  
  // Helper functions for photo gallery navigation
  const nextPhoto = () => {
    if (event?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % event.photos!.length);
    }
  };
  
  const prevPhoto = () => {
    if (event?.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + event.photos!.length) % event.photos!.length);
    }
  };
  
  if (!event) {
    return (
      <>
        <NavBar />
        <main className="pt-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
              <p className="text-gray-600 mb-8">The event you&apos;re looking for doesn&apos;t exist or has been moved.</p>
              <Link href="/events" className="inline-flex items-center text-accent hover:underline">
                <FiArrowLeft className="mr-2" />
                Back to Events
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {event ? (
        <>
          {/* Event Header */}
          <div className="bg-primary/10 pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4">
                <Link href="/events" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  <FiArrowLeft className="mr-2" />
                  Back to All Events
                </Link>
                
                <div className="flex flex-wrap gap-2 mb-2">
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
                        Public
                      </>
                    ) : (
                      <>
                        <FiLock className="mr-1" />
                        Private
                      </>
                    )}
                  </span>
                  {event.status === 'upcoming' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      Upcoming
                    </span>
                  )}
                  {event.status === 'ongoing' && (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                      Happening Now
                    </span>
                  )}
                  {event.status === 'past' && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                      Past Event
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{event.title}</h1>
                
                <p className="text-lg text-gray-700 mt-2 mb-4">{event.excerpt}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-700 mt-2">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FiClock className="mr-2 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FiMapPin className="mr-2 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.topics.map((topic, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
                
                {event.status === 'upcoming' && event.registrationLink && (
                  <div className="mt-6">
                    <Link 
                      href={event.registrationLink} 
                      className="inline-block bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md font-medium"
                    >
                      Register Now
                    </Link>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      {event.accessType === 'public' ? 
                        'Free and open to the public. Registration required.' : 
                        'This is a private event. Registration by invitation only.'}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="inline-flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <FiLink className="mr-1" />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                  
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#1DA1F2] hover:opacity-80"
                  >
                    <FiTwitter className="mr-1" />
                    Share on Twitter
                  </a>
                  
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#0A66C2] hover:opacity-80"
                  >
                    <FiLinkedin className="mr-1" />
                    Share on LinkedIn
                  </a>
                  
                  <a 
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Check out this event: ${event.title}\n\n${window.location.href}`)}`}
                    className="inline-flex items-center text-gray-700 hover:text-gray-900"
                  >
                    <FiMail className="mr-1" />
                    Share via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Content */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  {/* Main Image/Poster */}
                  <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                    <Image 
                      src={event.posterImage || event.image}
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
                  
                  {/* Speakers section when there are many speakers */}
                  {showSpeakersInMain && (
                    <div className="bg-white rounded-lg shadow-md p-8 mb-12">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold">Speakers</h2>
                        <div className="relative w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Search speakers..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full"
                            value={speakerFilter}
                            onChange={(e) => setSpeakerFilter(e.target.value)}
                          />
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      
                      {filteredSpeakers && filteredSpeakers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredSpeakers.map((speaker, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative h-48 w-full">
                                <Image
                                  src={speaker.image}
                                  alt={speaker.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-lg">{speaker.name}</h3>
                                <p className="text-sm text-gray-600">{speaker.title}</p>
                                <p className="text-sm text-primary mb-2">{speaker.organization}</p>
                                <p className="text-sm line-clamp-3 mb-3">{speaker.bio}</p>
                                
                                {speaker.presentation && (
                                  <Link href={speaker.presentation.file} 
                                    className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <FiDownload className="mr-1" />
                                    Download presentation
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No speakers match your search criteria.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* YouTube Video (if available) */}
                  {event.youtubeUrl && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Recording</h2>
                      <div className="relative pt-[56.25%] rounded-lg overflow-hidden shadow-lg">
                        <iframe
                          src={event.youtubeUrl}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full"
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  {/* Photo Gallery (if available) */}
                  {event.photos && event.photos.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Photos</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {event.photos.map((photo, index) => (
                          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                            <div 
                              className="relative aspect-w-3 aspect-h-2 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                setCurrentPhotoIndex(index);
                                setIsGalleryOpen(true);
                              }}
                            >
                              <Image 
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-gray-700 mb-2">{photo.alt}</p>
                              <a 
                                href={photo.src}
                                download={`event-photo-${index + 1}.jpg`}
                                className="inline-flex items-center text-xs text-primary hover:text-primary/80"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FiDownload className="mr-1" />
                                Download Photo
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sidebar - Speakers for events with few speakers */}
                <div className="lg:col-span-1">
                  {!showSpeakersInMain && (
                    <div className="bg-white rounded-lg p-6 shadow-md sticky top-24">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Event Speakers</h2>
                        {event.speakers && event.speakers.length > 2 && (
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="pl-8 pr-2 py-1 text-sm border rounded-md"
                              value={speakerFilter}
                              onChange={(e) => setSpeakerFilter(e.target.value)}
                            />
                            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        {filteredSpeakers && filteredSpeakers.length > 0 ? (
                          filteredSpeakers.map((speaker, index) => (
                            <div key={index} className="pb-6 last:pb-0 space-y-3">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-4">
                                  <div className="w-16 h-16 relative rounded-full overflow-hidden">
                                    <Image 
                                      src={speaker.image}
                                      alt={speaker.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">{speaker.name}</h3>
                                  <p className="text-sm text-gray-600">{speaker.title}</p>
                                  <p className="text-sm text-primary">{speaker.organization}</p>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 text-sm">{speaker.bio}</p>
                              
                              {speaker.presentation && (
                                <a 
                                  href={speaker.presentation.file} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                                >
                                  <FiDownload className="mr-2" />
                                  {speaker.presentation.title}
                                </a>
                              )}
                              {index < filteredSpeakers.length - 1 && (
                                <div className="border-t border-gray-100 mt-6"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4">No speakers match your search criteria.</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {showSpeakersInMain && (
                    <div className="bg-white rounded-lg p-6 shadow-md sticky top-24">
                      <h2 className="text-xl font-bold mb-6">Event Materials</h2>
                      
                      {/* Materials and resources can go here */}
                      <div className="space-y-4">
                        {event.additionalMaterials ? (
                          event.additionalMaterials.map((material, index) => (
                            <div key={index} className="flex items-start">
                              <FiFile className="text-primary mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <a 
                                  href={material.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="font-medium text-gray-900 hover:text-primary"
                                >
                                  {material.title}
                                </a>
                                <p className="text-sm text-gray-600">{material.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <FiInfo className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-gray-500">Event materials will be available after the event concludes.</p>
                          </div>
                        )}
                      </div>
                      
                      {event.status === 'upcoming' && event.registrationLink && (
                        <div className="pt-6 mt-6 border-t border-gray-100">
                          <Link 
                            href={event.registrationLink} 
                            className="inline-block w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md font-medium text-center"
                          >
                            Register Now
                          </Link>
                        </div>
                      )}
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
      
      <Footer />
    </div>
  );
}

export default EventDetail; 