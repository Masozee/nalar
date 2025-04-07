'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiDownload, FiArrowRight, FiCalendar, FiUser, FiExternalLink, FiBook } from 'react-icons/fi';
import FadeIn from './animations/FadeIn';

const publications = [
  {
    id: 1,
    title: "Indonesia's Economic Outlook 2024",
    category: 'Economics',
    author: 'Dr. Amelia Wong',
    date: 'May 10, 2024',
    excerpt: "A comprehensive analysis of Indonesia's economic prospects for 2024 and beyond.",
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    link: '/publications/indonesia-economic-outlook-2024',
    featured: true,
  },
  {
    id: 2,
    title: "ASEAN's Strategic Position in US-China Relations",
    category: 'International Relations',
    author: 'Dr. Ahmad Faisal',
    date: 'April 28, 2024',
    excerpt: "Examining ASEAN's role as a mediator between major global powers.",
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    link: '/publications/asean-strategic-position',
    featured: false,
  },
  {
    id: 3,
    title: 'Political Transformation in Southeast Asia',
    category: 'Politics',
    author: 'Dr. Nina Hartono',
    date: 'April 15, 2024',
    excerpt: 'The evolution of political systems in Southeast Asian nations in the past decade.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    link: '/publications/political-transformation-sea',
    featured: false,
  },
  {
    id: 4,
    title: 'Maritime Security Challenges in Southeast Asia',
    category: 'Security',
    author: 'Dr. Budi Santoso',
    date: 'April 8, 2024',
    excerpt: 'Analysis of current and emerging maritime security challenges in the Southeast Asian region.',
    image: '/bg/muska-create-K5OIYotY9GA-unsplash.png',
    link: '/publications/maritime-security-challenges',
    featured: false,
  },
  {
    id: 5,
    title: 'Digital Economy Trends in Indonesia',
    category: 'Economics',
    author: 'Dr. Sarah Johnson',
    date: 'April 1, 2024',
    excerpt: 'An overview of emerging trends in Indonesia\'s rapidly growing digital economy sector.',
    image: '/bg/wildan-kurniawan-m0JLVP04Heo-unsplash.png',
    link: '/publications/digital-economy-trends',
    featured: false,
  },
];

export default function Publications() {
  const featuredPublication = publications.find(pub => pub.featured);
  const otherPublications = publications.filter(pub => !pub.featured);

  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary">Research Publications</h2>
          <Link 
            href="/publications" 
            className="flex items-center text-accent text-base font-medium hover:underline"
          >
            View All <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Publication */}
          {featuredPublication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-1 lg:col-span-8 relative"
            >
              <div className="bg-white shadow-lg border-glow border-pulse">
                <div className="relative h-[250px] w-full overflow-hidden">
                  <Image 
                    src={featuredPublication.image}
                    alt={featuredPublication.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute top-0 left-0 bg-accent text-white py-1 px-3 z-10 text-sm">
                    Featured Research
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base text-teal font-medium">{featuredPublication.category}</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-gray-500 text-xs">
                        <FiCalendar className="mr-1" /> {featuredPublication.date}
                      </span>
                      <span className="flex items-center text-gray-500 text-xs">
                        <FiUser className="mr-1" /> {featuredPublication.author}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary">{featuredPublication.title}</h3>
                  <p className="text-base text-gray-700 mb-4">{featuredPublication.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <Link 
                      href={featuredPublication.link} 
                      className="inline-flex items-center btn-primary text-base font-medium px-4 py-2"
                    >
                      Read Publication <FiArrowRight className="ml-2" />
                    </Link>
                    <button
                      className="flex items-center text-teal text-sm hover:underline"
                    >
                      <FiDownload className="mr-1" /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Publications Sidebar */}
          <div className="col-span-1 lg:col-span-4">
            <div className="bg-white border-t-4 border-primary mb-8">
              <h3 className="text-base font-bold p-3 bg-primary text-white">Recent Publications</h3>
              <div className="divide-y divide-gray-200">
                {otherPublications.slice(0, 3).map((publication, index) => (
                  <motion.div
                    key={publication.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-teal font-medium">{publication.category}</span>
                      <span className="text-gray-500">{publication.date}</span>
                    </div>
                    <Link href={publication.link}>
                      <h4 className="text-sm font-bold hover:text-accent transition-colors">
                        {publication.title}
                      </h4>
                    </Link>
                    <div className="mt-1 text-xs text-gray-500">{publication.author}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary p-5 text-white">
              <h3 className="text-base font-bold mb-3">Request Publications</h3>
              <p className="mb-3 text-sm">Can't find what you're looking for? Request a research publication or report from our archives.</p>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Research topic" 
                  className="w-full p-2 border border-white/20 bg-primary/80 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
                <button className="w-full py-2 btn-accent font-medium text-sm">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {otherPublications.slice(0, 3).map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white border-animate-left card-hover"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image 
                  src={publication.image}
                  alt={publication.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute top-0 left-0 px-2 py-1 bg-teal text-white font-medium text-xs">
                  {publication.category}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">{publication.date}</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-primary hover:text-accent transition-colors">
                  <Link href={publication.link}>{publication.title}</Link>
                </h3>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{publication.excerpt}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={publication.link} 
                    className="text-accent font-medium hover:underline flex items-center text-sm"
                  >
                    Read More <FiArrowRight className="ml-1" />
                  </Link>
                  <span 
                    className="text-gray-500 text-xs flex items-center"
                  >
                    <FiUser className="mr-1" /> {publication.author}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 