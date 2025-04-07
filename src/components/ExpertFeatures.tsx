'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink, FiUsers, FiBookOpen } from 'react-icons/fi';

const experts = [
  {
    id: 1,
    name: "Shannon K. O'Neil",
    title: "Senior Vice President, Director of Studies, and Maurice R. Greenberg Chair",
    expertiseAreas: ["Trade", "Supply Chains", "Democracy"],
    featuredPublication: {
      title: "Trump's Tariffs Mark the End of an Era for Free Trade in North America",
      source: "Washington Post",
      date: "April 5, 2023",
      link: "/publications/trumps-tariffs-end-era"
    },
    image: "/experts/shannon-oneil.jpg",
  },
  {
    id: 2,
    name: "Dr. Ahmad Faisal",
    title: "Senior Fellow, Southeast Asia Program",
    expertiseAreas: ["Regional Security", "ASEAN", "China Relations"],
    featuredPublication: {
      title: "ASEAN's Diplomatic Balancing Act Between China and the United States",
      source: "Foreign Affairs",
      date: "May 12, 2024",
      link: "/publications/asean-diplomatic-balancing"
    },
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
  },
  {
    id: 3,
    name: "Dr. Sarah Johnson",
    title: "Director, Economics Program",
    expertiseAreas: ["Digital Economy", "Trade Policy", "Financial Markets"],
    featuredPublication: {
      title: "Digital Trade Agreements: The New Frontier in Indo-Pacific Relations",
      source: "The Diplomat",
      date: "June 1, 2024",
      link: "/publications/digital-trade-agreements"
    },
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
  }
];

const recentPublications = [
  {
    id: 1,
    title: "Indonesia's Economic Outlook 2024",
    category: "Economics",
    date: "May 10, 2024"
  },
  {
    id: 2,
    title: "ASEAN's Strategic Position in US-China Relations",
    category: "International Relations",
    date: "April 28, 2024"
  },
  {
    id: 3,
    title: "Political Transformation in Southeast Asia",
    category: "Politics",
    date: "April 15, 2024"
  }
];

export default function ExpertFeatures() {
  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary">Expert Features</h2>
          <Link 
            href="/experts" 
            className="flex items-center text-accent text-base font-medium hover:underline"
          >
            View All Experts <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Expert Cards */}
          {experts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-sm"
            >
              <div className="flex flex-col h-full">
                <div className="p-5 flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image 
                      src={expert.image}
                      alt={expert.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">{expert.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 italic">{expert.title}</p>
                  </div>
                </div>
                
                <div className="px-5 pb-3">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.expertiseAreas.map((area, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-primary px-2 py-1 rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-auto border-t border-gray-100">
                  <div className="p-4">
                    <div className="mb-1">
                      <Link 
                        href={expert.featuredPublication.link}
                        className="text-sm font-medium text-primary hover:text-accent transition-colors"
                      >
                        {expert.featuredPublication.title}
                      </Link>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{expert.featuredPublication.source}</span>
                      <span>{expert.featuredPublication.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Newsletter Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-primary shadow-md rounded-sm"
          >
            <div className="p-5 text-white h-full flex flex-col">
              <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
              <p className="text-sm mb-4 text-white/80">Subscribe to our newsletter for the latest research and expert analysis.</p>
              
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase mb-2 text-white/70">Recent Publications</h4>
                <ul className="space-y-2">
                  {recentPublications.map((pub) => (
                    <li key={pub.id} className="text-xs border-l-2 border-accent pl-2">
                      <span className="block text-white/80">{pub.title}</span>
                      <span className="text-white/60 text-[10px]">{pub.date} • {pub.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full p-2 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button className="w-full py-2 text-sm font-medium bg-accent hover:bg-accent/90 text-white transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 