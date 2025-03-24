'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiDownload, FiArrowRight, FiCalendar, FiUser } from 'react-icons/fi';

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

const Publications = () => {
  const featuredPublication = publications.find(pub => pub.featured);
  const otherPublications = publications.filter(pub => !pub.featured);

  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline mb-8">
          <h2 className="text-3xl font-bold text-primary">Research Publications</h2>
          <div className="ml-auto flex items-center space-x-3">
            <span className="text-gray-400">|</span>
            <Link 
              href="/publications/categories" 
              className="text-teal hover:text-accent flex items-center text-sm font-medium"
            >
              Browse By Category
            </Link>
          </div>
        </div>
        
        {featuredPublication && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 border-glow shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-1 bg-primary/5 flex flex-col justify-center p-6 border-animate-left relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <Image 
                    src={featuredPublication.image}
                    alt={featuredPublication.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="relative z-10">
                  <span className="bg-accent text-white px-3 py-1 mb-3 inline-block text-sm">Featured</span>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-primary">{featuredPublication.title}</h3>
                  <div className="flex items-center mb-1 text-teal text-sm">
                    <FiCalendar className="mr-2" />
                    <span>{featuredPublication.date}</span>
                  </div>
                  <div className="flex items-center mb-3 text-teal text-sm">
                    <FiUser className="mr-2" />
                    <span>{featuredPublication.author}</span>
                  </div>
                  <span className="px-3 py-1 border border-primary text-primary mb-4 inline-block text-sm">
                    {featuredPublication.category}
                  </span>
                  <Link
                    href={featuredPublication.link}
                    className="flex items-center justify-center btn-primary px-4 py-2 text-base font-medium"
                  >
                    Read Publication <FiArrowRight className="ml-2" />
                  </Link>
                  <button className="flex items-center justify-center mt-3 border border-teal text-teal px-4 py-2 text-sm hover:bg-teal hover:text-white transition-colors">
                    <FiDownload className="mr-2" /> Download PDF
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 p-6">
                <p className="text-base text-gray-700 mb-4">{featuredPublication.excerpt}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-l-teal p-4 bg-teal/5">
                    <h4 className="font-bold mb-2 text-primary text-base">Key Insights</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Analysis of current economic trends</li>
                      <li>Forecasts for major industry sectors</li>
                      <li>Policy recommendations for growth</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-l-accent p-4 bg-accent/5">
                    <h4 className="font-bold mb-2 text-primary text-base">Methodology</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Quantitative economic modeling</li>
                      <li>Expert interviews and surveys</li>
                      <li>Comparative analysis with regional peers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border-animate-top card-hover bg-white shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image 
                  src={publication.image}
                  alt={publication.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute top-0 right-0 px-2 py-1 bg-accent text-white font-medium text-xs">
                  {publication.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold mb-2 text-primary hover:text-teal transition-colors">
                  <Link href={publication.link}>{publication.title}</Link>
                </h3>
                <div className="flex items-center mb-1 text-gray-600 text-xs">
                  <FiCalendar className="mr-1 text-teal" />
                  <span>{publication.date}</span>
                </div>
                <div className="flex items-center mb-2 text-gray-600 text-xs">
                  <FiUser className="mr-1 text-teal" />
                  <span>{publication.author}</span>
                </div>
                <p className="text-gray-700 mb-3 text-sm">{publication.excerpt}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={publication.link} 
                    className="text-teal hover:text-accent font-medium flex items-center text-sm"
                  >
                    Read More <FiArrowRight className="ml-1" />
                  </Link>
                  <button className="text-gray-500 hover:text-accent flex items-center text-xs">
                    <FiDownload className="mr-1" /> PDF
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/publications" 
            className="inline-flex items-center justify-center bg-accent hover:bg-accent/90 text-white py-3 px-6 transition-colors font-medium"
          >
            View All Publications <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Publications; 