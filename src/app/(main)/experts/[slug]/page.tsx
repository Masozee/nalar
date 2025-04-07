'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiMail, 
  FiTwitter, 
  FiLinkedin, 
  FiBook, 
  FiFileText, 
  FiAward, 
  FiArrowLeft, 
  FiCalendar, 
  FiMapPin,
  FiUser,
  FiBriefcase
} from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { EXPERTS, Expert } from '../data';

export default function ExpertDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [expert, setExpert] = useState<Expert | null>(null);
  const [activeTab, setActiveTab] = useState<'publications' | 'speaking'>('publications');
  const [relatedExperts, setRelatedExperts] = useState<Expert[]>([]);

  useEffect(() => {
    // Find the expert with the matching slug
    const foundExpert = EXPERTS.find(e => e.slug === slug);
    
    if (foundExpert) {
      setExpert(foundExpert);
      
      // Find experts in the same department
      const related = EXPERTS.filter(e => 
        e.department === foundExpert.department && 
        e.id !== foundExpert.id
      ).slice(0, 3);
      
      setRelatedExperts(related);
    }
  }, [slug]);

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Expert Not Found</h1>
            <p className="text-gray-600 mb-8">The expert you&apos;re looking for doesn&apos;t exist or has been moved.</p>
            <Link 
              href="/experts" 
              className="inline-flex items-center text-primary hover:text-primary/80"
            >
              <FiArrowLeft className="mr-2" />
              Back to Experts
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Expert Header */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Link 
              href="/experts" 
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              <FiArrowLeft className="mr-2" />
              All Experts
            </Link>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="relative h-72 md:h-80 w-full rounded-lg overflow-hidden">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {expert.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4">
                <div className="flex items-center">
                  <FiBriefcase className="text-primary mr-2" />
                  <span className="text-gray-700">{expert.position}</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="text-primary mr-2" />
                  <span className="text-gray-700">{expert.department}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {expert.expertise.map((area, index) => (
                  <span 
                    key={index} 
                    className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {expert.email && (
                  <a 
                    href={`mailto:${expert.email}`}
                    className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    <FiMail className="mr-2" />
                    Email
                  </a>
                )}
                
                {expert.twitter && (
                  <a 
                    href={`https://twitter.com/${expert.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-md hover:bg-[#1DA1F2]/20 transition-colors"
                  >
                    <FiTwitter className="mr-2" />
                    Twitter
                  </a>
                )}
                
                {expert.linkedin && (
                  <a 
                    href={`https://www.linkedin.com/in/${expert.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-md hover:bg-[#0A66C2]/20 transition-colors"
                  >
                    <FiLinkedin className="mr-2" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Biography</h2>
                <div className="prose prose-lg max-w-none">
                  {expert.bio.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Publications & Speaking Tabs */}
              {(expert.publications?.length || expert.speaking_engagements?.length) && (
                <div className="bg-white rounded-lg p-8">
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setActiveTab('publications')}
                      className={`px-4 py-3 font-medium text-sm border-b-2 mr-4 ${
                        activeTab === 'publications' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="flex items-center">
                        <FiBook className="mr-2" />
                        Publications
                      </span>
                    </button>
                    
                    {expert.speaking_engagements?.length && (
                      <button
                        onClick={() => setActiveTab('speaking')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 ${
                          activeTab === 'speaking' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="flex items-center">
                          <FiAward className="mr-2" />
                          Speaking Engagements
                        </span>
                      </button>
                    )}
                  </div>
                  
                  {/* Publications Tab Content */}
                  {activeTab === 'publications' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications</h2>
                      
                      {expert.publications?.length ? (
                        <ul className="space-y-6">
                          {expert.publications.sort((a, b) => b.year - a.year).map((pub, index) => (
                            <li key={index} className="flex">
                              <div className="mr-4 flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <FiFileText className="text-primary w-5 h-5" />
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 hover:text-primary">
                                  <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                    {pub.title}
                                  </a>
                                </h3>
                                <div className="flex items-center mt-1 text-sm">
                                  <span className="text-gray-600 mr-3">{pub.year}</span>
                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    {pub.type}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No publications available.</p>
                      )}
                    </div>
                  )}
                  
                  {/* Speaking Engagements Tab Content */}
                  {activeTab === 'speaking' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Speaking Engagements</h2>
                      
                      {expert.speaking_engagements?.length ? (
                        <ul className="space-y-6">
                          {expert.speaking_engagements.map((event, index) => (
                            <li key={index} className="flex">
                              <div className="mr-4 flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <FiAward className="text-primary w-5 h-5" />
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {event.title}
                                </h3>
                                <p className="text-gray-600 text-sm my-1">{event.event}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <FiCalendar className="mr-1 text-gray-400" />
                                    {event.date}
                                  </div>
                                  <div className="flex items-center">
                                    <FiMapPin className="mr-1 text-gray-400" />
                                    {event.location}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No speaking engagements available.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Expert Education */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Education</h3>
                <ul className="space-y-4">
                  {expert.education.map((edu, index) => (
                    <li key={index} className="flex">
                      <div className="mr-3 pt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-gray-700">{edu}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Related Experts */}
              {relatedExperts.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Related Experts</h3>
                  <div className="space-y-6">
                    {relatedExperts.map(related => (
                      <Link 
                        href={`/experts/${related.slug}`} 
                        key={related.id}
                        className="group flex items-start"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                          <Image
                            src={related.image}
                            alt={related.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {related.name}
                          </h4>
                          <p className="text-gray-600 text-sm">{related.position}</p>
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
      
      <Footer />
    </div>
  );
} 