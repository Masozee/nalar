'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';

const events = [
  {
    id: 1,
    title: "Economic Policy in Post-Pandemic Southeast Asia",
    type: "Conference",
    date: "June 15, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Grand Hyatt Jakarta",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    excerpt: "Join leading economists and policymakers for a comprehensive discussion on economic recovery policies in Southeast Asia.",
    link: "/events/economic-policy-post-pandemic",
    featured: true,
    attendees: 120,
  },
  {
    id: 2,
    title: "Geopolitical Dynamics in the Indo-Pacific Region",
    type: "Webinar",
    date: "June 22, 2024",
    time: "2:00 PM - 4:00 PM",
    location: "Online",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
    excerpt: "A virtual discussion exploring the changing geopolitical landscape in the Indo-Pacific and implications for regional stability.",
    link: "/events/geopolitical-dynamics-indo-pacific",
    featured: false,
    attendees: 250,
  },
  {
    id: 3,
    title: "Workshop on Election Reform in Indonesia",
    type: "Workshop",
    date: "July 5, 2024",
    time: "9:00 AM - 3:00 PM",
    location: "CSIS Indonesia Headquarters",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
    excerpt: "A hands-on workshop focusing on electoral reform proposals and implementation strategies for Indonesia.",
    link: "/events/election-reform-workshop",
    featured: false,
    attendees: 45,
  },
  {
    id: 4,
    title: "South China Sea Maritime Security Forum",
    type: "Roundtable",
    date: "July 12, 2024",
    time: "1:00 PM - 5:00 PM",
    location: "Shangri-La Hotel Jakarta",
    image: "/bg/muska-create-K5OIYotY9GA-unsplash.png",
    excerpt: "A high-level roundtable discussion on maritime security challenges in the South China Sea and potential diplomatic solutions.",
    link: "/events/maritime-security-forum",
    featured: false,
    attendees: 60,
  },
];

const Events = () => {
  const featuredEvent = events.find(event => event.featured);
  const upcomingEvents = events.filter(event => !event.featured);

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Upcoming Events</h2>
          <Link 
            href="/events" 
            className="flex items-center text-accent text-lg font-medium hover:underline"
          >
            All Events <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Event */}
          {featuredEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-1 lg:col-span-7 relative"
            >
              <div className="bg-primary/5 border-l-4 border-accent h-full">
                <div className="relative h-[320px] w-full overflow-hidden">
                  <Image 
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute top-0 left-0 bg-accent text-white py-2 px-4 z-10">
                    Featured Event
                  </div>
                </div>
                <div className="p-8">
                  <div className="inline-block bg-teal text-white px-3 py-1 text-sm font-medium mb-4">
                    {featuredEvent.type}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">{featuredEvent.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center text-gray-700">
                      <FiCalendar className="mr-2 text-accent" />
                      <span>{featuredEvent.date}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiMapPin className="mr-2 text-accent" />
                      <span>{featuredEvent.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiUsers className="mr-2 text-accent" />
                      <span>{featuredEvent.attendees} Expected</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 mb-6">{featuredEvent.excerpt}</p>
                  <Link 
                    href={featuredEvent.link} 
                    className="btn-accent inline-flex items-center text-lg font-medium px-6 py-3"
                  >
                    Register Now <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Upcoming Events */}
          <div className="col-span-1 lg:col-span-5">
            <div className="border border-gray-200 bg-white shadow-lg h-full">
              <h3 className="text-xl font-bold p-4 bg-primary text-white uppercase">Upcoming Events</h3>
              <div className="divide-y divide-gray-200">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition-colors flex"
                  >
                    <div className="w-24 h-24 relative flex-shrink-0 mr-4">
                      <Image 
                        src={event.image}
                        alt={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-teal font-medium">{event.type}</span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <FiCalendar className="mr-1" /> {event.date}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-primary mb-2">
                        <Link href={event.link} className="hover:text-accent transition-colors">
                          {event.title}
                        </Link>
                      </h4>
                      <div className="text-gray-700 text-sm flex items-center mb-1">
                        <FiMapPin className="mr-1 text-accent" /> {event.location}
                      </div>
                      <Link 
                        href={event.link} 
                        className="text-accent text-sm font-medium hover:underline flex items-center"
                      >
                        More Details <FiArrowRight className="ml-1" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <Link 
                  href="/events/calendar" 
                  className="block w-full py-2 text-center border border-accent text-accent font-medium hover:bg-accent hover:text-white transition-colors"
                >
                  View Events Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events; 