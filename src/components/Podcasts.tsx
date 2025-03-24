'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay, FiHeadphones, FiClock, FiCalendar } from 'react-icons/fi';

const podcasts = [
  {
    id: 1,
    title: "Indonesia's Economic Outlook for 2024",
    host: "Dr. Ahmad Setiawan",
    guest: "Prof. Maria Tantri",
    duration: "45:12",
    date: "May 15, 2024",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    excerpt: "A discussion on Indonesia's economic trajectory for 2024, exploring potential challenges and opportunities.",
    link: "/podcasts/indonesia-economic-outlook",
    featured: true
  },
  {
    id: 2,
    title: "ASEAN's Role in Regional Security",
    host: "Dr. Ahmad Setiawan",
    guest: "Dr. James Wong",
    duration: "38:45",
    date: "May 1, 2024",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
    excerpt: "Examining how ASEAN can effectively address security challenges in Southeast Asia.",
    link: "/podcasts/asean-regional-security",
    featured: false
  },
  {
    id: 3,
    title: "Climate Change Policy in Southeast Asia",
    host: "Dr. Ahmad Setiawan",
    guest: "Dr. Lisa Green",
    duration: "42:18",
    date: "April 15, 2024",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
    excerpt: "A critical analysis of climate policies and sustainability initiatives across Southeast Asian nations.",
    link: "/podcasts/climate-policy-southeast-asia",
    featured: false
  },
  {
    id: 4,
    title: "Digital Transformation and Governance",
    host: "Dr. Ahmad Setiawan",
    guest: "Dr. Rizki Pratama",
    duration: "36:50",
    date: "April 1, 2024",
    image: "/bg/muska-create-K5OIYotY9GA-unsplash.png",
    excerpt: "Exploring how digital technologies are reshaping governance structures in Indonesia.",
    link: "/podcasts/digital-transformation-governance",
    featured: false
  }
];

const Podcasts = () => {
  const featuredPodcast = podcasts.find(podcast => podcast.featured);
  const otherPodcasts = podcasts.filter(podcast => !podcast.featured);

  return (
    <section className="py-16 bg-green-50 border-t border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Latest Podcasts</h2>
          <Link 
            href="/podcasts" 
            className="flex items-center text-accent text-lg font-medium hover:underline"
          >
            All Episodes <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Featured Podcast */}
          {featuredPodcast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-1 lg:col-span-7"
            >
              <div className="bg-white border-animate-top">
                <div className="relative h-[320px] w-full overflow-hidden">
                  <Image 
                    src={featuredPodcast.image}
                    alt={featuredPodcast.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition-all group">
                      <FiPlay className="text-4xl text-white ml-1 group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="p-6 text-white">
                      <div className="flex justify-between items-center mb-3">
                        <span className="bg-accent/80 backdrop-blur-sm px-3 py-1 rounded-sm">
                          Featured Episode
                        </span>
                        <div className="flex space-x-4">
                          <span className="flex items-center">
                            <FiClock className="mr-1" /> {featuredPodcast.duration}
                          </span>
                          <span className="flex items-center">
                            <FiCalendar className="mr-1" /> {featuredPodcast.date}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold mb-2 drop-shadow-md">{featuredPodcast.title}</h3>
                      <div className="mb-2">
                        <span className="font-medium">Host: {featuredPodcast.host}</span> | 
                        <span className="font-medium ml-2">Guest: {featuredPodcast.guest}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-lg text-gray-700 mb-4">{featuredPodcast.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <Link 
                      href={featuredPodcast.link} 
                      className="btn-accent inline-flex items-center text-lg font-medium px-6 py-3"
                    >
                      Listen Now <FiHeadphones className="ml-2" />
                    </Link>
                    <div className="flex space-x-3">
                      <button className="text-gray-700 hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-4 17v-10l9 5.146-9 4.854z"/>
                        </svg>
                      </button>
                      <button className="text-gray-700 hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-6 8h5v10h2v-10h5l-6-6-6 6z"/>
                        </svg>
                      </button>
                      <button className="text-gray-700 hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-12v-2h12v2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Podcast Player */}
          <div className="col-span-1 lg:col-span-5">
            <div className="bg-primary text-white h-full p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FiHeadphones className="mr-2" /> CSIS Podcast Player
              </h3>
              <div className="space-y-4 mb-6">
                <div className="font-medium">Now Playing:</div>
                <div className="text-xl font-bold">{featuredPodcast?.title}</div>
                <div className="flex justify-between text-sm opacity-80">
                  <span>Host: {featuredPodcast?.host}</span>
                  <span>{featuredPodcast?.duration}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="relative h-1.5 bg-white/20 rounded overflow-hidden">
                  <div className="absolute h-full bg-accent w-1/3 rounded"></div>
                </div>
                <div className="flex justify-between text-sm mt-2 text-white/70">
                  <span>15:20</span>
                  <span>{featuredPodcast?.duration}</span>
                </div>
              </div>
              
              <div className="flex justify-center space-x-6 mb-6">
                <button className="p-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </button>
                <button className="p-2 hover:text-accent transition-colors bg-accent/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <button className="hover:text-accent transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center space-x-3">
                  <button className="p-1 hover:text-accent transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828-3.536-3.536 2.828-2.828m13.86 5.656l2.828 2.828-3.536 3.536-2.828-2.828" />
                    </svg>
                  </button>
                  <button className="p-1 hover:text-accent transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button className="p-1 hover:text-accent transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <button className="hover:text-accent transition-colors flex items-center">
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Other Podcasts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherPodcasts.map((podcast, index) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white card-hover"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src={podcast.image}
                  alt={podcast.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <button className="w-16 h-16 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition-all">
                    <FiPlay className="text-3xl text-white ml-1" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 bg-primary text-white py-1 px-2 text-sm">
                  {podcast.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-primary hover:text-accent transition-colors">
                  <Link href={podcast.link}>{podcast.title}</Link>
                </h3>
                <div className="flex justify-between text-gray-500 text-sm mb-4">
                  <span>Host: {podcast.host}</span>
                  <span>{podcast.date}</span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-2">{podcast.excerpt}</p>
                <Link 
                  href={podcast.link} 
                  className="text-accent font-medium hover:underline flex items-center"
                >
                  Listen to Episode <FiHeadphones className="ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Podcasts; 