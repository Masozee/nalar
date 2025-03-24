'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiExternalLink, FiCalendar, FiClock } from 'react-icons/fi';

const newsItems = [
  {
    id: 1,
    title: "CSIS Director Speaks at UN Forum on Sustainable Development",
    source: "Jakarta Post",
    date: "May 18, 2024",
    time: "14:30",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    excerpt: "Dr. Amelia Wong, Director of CSIS Indonesia, delivered a keynote speech on sustainable development goals in Southeast Asia.",
    link: "/news/csis-director-un-forum",
    sourceLink: "https://jakartapost.com",
    featured: true,
  },
  {
    id: 2,
    title: "New Report Highlights Infrastructure Challenges in Indonesia",
    source: "Tempo",
    date: "May 12, 2024",
    time: "09:15",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
    excerpt: "CSIS Indonesia released a comprehensive report on infrastructure development challenges facing the country.",
    link: "/news/infrastructure-challenges-report",
    sourceLink: "https://tempo.co",
    featured: false,
  },
  {
    id: 3,
    title: "CSIS Experts Discuss Regional Security at ASEAN Summit",
    source: "Kompas",
    date: "May 5, 2024",
    time: "11:45",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
    excerpt: "A panel of CSIS experts participated in discussions on regional security at the recent ASEAN Summit in Manila.",
    link: "/news/regional-security-asean",
    sourceLink: "https://kompas.com",
    featured: false,
  },
  {
    id: 4,
    title: "CSIS Launches New Research Initiative on Climate Change",
    source: "CNN Indonesia",
    date: "April 30, 2024",
    time: "16:20",
    image: "/bg/muska-create-K5OIYotY9GA-unsplash.png",
    excerpt: "The Center announced a major new research initiative focusing on climate change impacts in Southeast Asia.",
    link: "/news/climate-research-initiative",
    sourceLink: "https://cnn.id",
    featured: false,
  },
  {
    id: 5,
    title: "Indonesian Economic Recovery Shows Promising Signs, CSIS Analysis Reveals",
    source: "Bisnis Indonesia",
    date: "April 25, 2024",
    time: "10:30",
    image: "/bg/wildan-kurniawan-m0JLVP04Heo-unsplash.png",
    excerpt: "The latest economic analysis from CSIS Indonesia indicates positive trends in the country's economic recovery efforts.",
    link: "/news/economic-recovery-trends",
    sourceLink: "https://bisnis.com",
    featured: false,
  },
  {
    id: 6,
    title: "CSIS Researcher Wins International Award for Southeast Asia Study",
    source: "The Jakarta Globe",
    date: "April 20, 2024",
    time: "13:45",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    excerpt: "Dr. Lina Hartati of CSIS Indonesia has been recognized with a prestigious international award for her research on regional cooperation.",
    link: "/news/researcher-award",
    sourceLink: "https://jakartaglobe.id",
    featured: false,
  },
];

const News = () => {
  const featuredNews = newsItems.find(news => news.featured);
  const otherNews = newsItems.filter(news => !news.featured);

  return (
    <section className="py-12 bg-green-50 border-t border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary">CSIS on News</h2>
          <Link 
            href="/news" 
            className="flex items-center text-accent text-base font-medium hover:underline"
          >
            All News <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured News */}
          {featuredNews && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-1 lg:col-span-8 relative"
            >
              <div className="bg-white shadow-lg border-glow border-pulse">
                <div className="relative h-[250px] w-full overflow-hidden">
                  <Image 
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute top-0 left-0 bg-accent text-white py-1 px-3 z-10 text-sm">
                    Breaking News
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base text-teal font-medium">{featuredNews.source}</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-gray-500 text-xs">
                        <FiCalendar className="mr-1" /> {featuredNews.date}
                      </span>
                      <span className="flex items-center text-gray-500 text-xs">
                        <FiClock className="mr-1" /> {featuredNews.time}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary">{featuredNews.title}</h3>
                  <p className="text-base text-gray-700 mb-4">{featuredNews.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <Link 
                      href={featuredNews.link} 
                      className="inline-flex items-center btn-accent text-base font-medium px-4 py-2"
                    >
                      Read Full Story <FiArrowRight className="ml-2" />
                    </Link>
                    <a 
                      href={featuredNews.sourceLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-teal text-sm hover:underline"
                    >
                      Source: {featuredNews.source} <FiExternalLink className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* News Sidebar */}
          <div className="col-span-1 lg:col-span-4">
            <div className="bg-white border-t-4 border-accent mb-8">
              <h3 className="text-base font-bold p-3 bg-accent text-white">Latest Updates</h3>
              <div className="divide-y divide-gray-200">
                {otherNews.slice(0, 3).map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-teal font-medium">{news.source}</span>
                      <span className="text-gray-500">{news.date}</span>
                    </div>
                    <Link href={news.link}>
                      <h4 className="text-sm font-bold hover:text-accent transition-colors">{news.title}</h4>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary p-5 text-white">
              <h3 className="text-base font-bold mb-3">Subscribe to Updates</h3>
              <p className="mb-3 text-sm">Get the latest news and updates from CSIS Indonesia delivered to your inbox.</p>
              <div className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full p-2 border border-white/20 bg-primary/80 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
                <button className="w-full py-2 btn-accent font-medium text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {otherNews.slice(0, 3).map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white border-animate-left card-hover"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image 
                  src={news.image}
                  alt={news.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute top-0 left-0 px-2 py-1 bg-teal text-white font-medium text-xs">
                  {news.source}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">{news.date}</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-primary hover:text-accent transition-colors">
                  <Link href={news.link}>{news.title}</Link>
                </h3>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{news.excerpt}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={news.link} 
                    className="text-accent font-medium hover:underline flex items-center text-sm"
                  >
                    Read More <FiArrowRight className="ml-1" />
                  </Link>
                  <a 
                    href={news.sourceLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-500 hover:text-teal text-xs flex items-center"
                  >
                    Source <FiExternalLink className="ml-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News; 