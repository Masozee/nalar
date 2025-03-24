'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBarChart2, FiGlobe, FiPieChart, FiTrendingUp } from 'react-icons/fi';

const dashboards = [
  {
    id: 1,
    title: "Indonesia Economic Indicators",
    icon: <FiPieChart className="w-5 h-5" />,
    description: "Comprehensive visualization of key economic indicators for Indonesia, including GDP growth, inflation rates, and foreign investment trends.",
    link: "/dashboards/economic-indicators",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
  },
  {
    id: 2,
    title: "Regional Trade Analysis",
    icon: <FiBarChart2 className="w-5 h-5" />,
    description: "Interactive visualization of trade flows between ASEAN countries, highlighting key exports, imports, and emerging trade patterns.",
    link: "/dashboards/regional-trade",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
  },
  {
    id: 3,
    title: "Political Survey Results",
    icon: <FiTrendingUp className="w-5 h-5" />,
    description: "Visualization of public opinion trends on key political issues in Indonesia, based on CSIS's quarterly nationwide surveys.",
    link: "/dashboards/political-surveys",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
  },
  {
    id: 4,
    title: "Global Relations Index",
    icon: <FiGlobe className="w-5 h-5" />,
    description: "Interactive tracker of Indonesia's diplomatic and economic relations with key global partners, including strength of ties and recent developments.",
    link: "/dashboards/global-relations",
    image: "/bg/muska-create-K5OIYotY9GA-unsplash.png",
  },
];

const Dashboard = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Data Dashboards</h2>
          <Link 
            href="/dashboards" 
            className="flex items-center text-accent text-lg font-medium hover:underline"
          >
            Explore All Data <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dashboards.map((dashboard, index) => (
            <motion.div
              key={dashboard.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white hover:bg-teal/5 transition-all border-animate-bottom relative shadow"
            >
              <div className="h-48 relative overflow-hidden">
                <Image 
                  src={dashboard.image}
                  alt={dashboard.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{dashboard.title}</h3>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-accent text-white p-3 rounded-full">
                  {dashboard.icon}
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">{dashboard.description}</p>
                <Link 
                  href={dashboard.link} 
                  className="btn-accent inline-flex items-center text-lg font-medium px-5 py-2"
                >
                  View Dashboard <FiArrowRight className="ml-2" />
                </Link>
              </div>
              <div className="absolute top-0 left-0 w-full h-full border-animate-bottom pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 bg-white p-8 border-animate-left border border-accent/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0 md:max-w-2xl">
              <h3 className="text-2xl font-bold text-primary mb-3">Custom Research Reports</h3>
              <p className="text-lg text-gray-700">
                Need specialized data analysis? Our research team can create custom reports and visualizations tailored to your specific requirements.
              </p>
            </div>
            <Link 
              href="/research/custom" 
              className="btn-accent inline-flex items-center text-lg font-medium px-6 py-3 whitespace-nowrap"
            >
              Request Report <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard; 