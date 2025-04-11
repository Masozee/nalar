'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBarChart2, FiGlobe, FiPieChart, FiTrendingUp, FiDatabase, FiMap } from 'react-icons/fi';

interface DashboardItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  image: string;
}

interface DashboardCardProps {
  dashboard: DashboardItem;
  index: number;
  delayOffset?: number;
}

const dashboards: DashboardItem[] = [
  {
    id: 1,
    title: "Indonesia's Strategic Dependency Dashboard",
    icon: <FiPieChart className="w-5 h-5" />,
    description: "Comprehensive visualization of key economic indicators for Indonesia, including GDP growth, inflation rates, and foreign investment trends.",
    link: "https://isdp.csis.or.id",
    image: "/bg/getty-images-PWFDb-sRcsY-unsplash.jpg",
  },
  {
    id: 2,
    title: "Collective Violence Early Warning Dataset",
    icon: <FiBarChart2 className="w-5 h-5" />,
    description: "Interactive visualization of trade flows between ASEAN countries, highlighting key exports, imports, and emerging trade patterns.",
    link: "https://violence.csis.or.id",
    image: "/bg/pawel-janiak-49LBMXrY5BE-unsplash.jpg",
  },
  {
    id: 3,
    title: "Hatespeech Dashboard",
    icon: <FiTrendingUp className="w-5 h-5" />,
    description: "Visualization of public opinion trends on key political issues in Indonesia, based on CSIS's quarterly nationwide surveys.",
    link: "https://hatespeech.csis.or.id",
    image: "/bg/jason-leung-XigshA91R6M-unsplash.jpg",
  },
  {
    id: 4,
    title: "Decarbonization for Development",
    icon: <FiGlobe className="w-5 h-5" />,
    description: "Interactive tracker of Indonesia's diplomatic and economic relations with key global partners, including strength of ties and recent developments.",
    link: "https://dfdlab.org",
    image: "/bg/getty-images-PWFDb-sRcsY-unsplash.jpg",
  },
  {
    id: 5,
    title: "ASEAN Economic Integration",
    icon: <FiDatabase className="w-5 h-5" />,
    description: "Comprehensive analysis of ASEAN economic integration metrics and cross-border investments.",
    link: "/dashboards/asean-economic",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
  },
  {
    id: 6,
    title: "Maritime Security Tracker",
    icon: <FiMap className="w-5 h-5" />,
    description: "Real-time monitoring of maritime security incidents in Southeast Asian waters.",
    link: "/dashboards/maritime-security",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
  },
];

// Memoized Dashboard Card component to prevent unnecessary re-renders
const DashboardCard = memo(({ dashboard, index, delayOffset = 0 }: DashboardCardProps) => (
  <motion.div
    key={dashboard.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: (index + delayOffset) * 0.05 }}
    className="col-span-12 md:col-span-3 bg-white shadow"
    layout
  >
    <div className="dashboard-image h-48 relative overflow-hidden">
      <Image 
        src={dashboard.image}
        alt={dashboard.title}
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        priority={index < 2}
        style={{ objectFit: 'cover' }}
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="text-lg font-bold text-primary mb-4">{dashboard.title}</h3>
      <Link 
        href={dashboard.link} 
        className="btn-accent inline-flex items-center justify-center text-sm font-semibold px-4 py-2 w-full"
      >
        View Dashboard <FiArrowRight className="ml-2" />
      </Link>
    </div>
  </motion.div>
));

DashboardCard.displayName = 'DashboardCard';

const Dashboard = () => {
  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Data at a Glance</h2>
          <Link 
            href="/dashboards" 
            className="flex items-center text-accent text-lg font-semibold hover:underline"
          >
            Explore All Data <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        {/* First Row: Text (col-6) and 2 cards (col-3 each) */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Text Section - col-6 */}
          <div className="col-span-12 md:col-span-6 bg-white p-6 shadow">
            <h3 className="text-2xl font-bold text-primary mb-4">Interactive Data Dashboards</h3>
            <p className="text-gray-700 mb-4">
              CSIS Indonesia offers a range of interactive data visualization tools that provide insights into key regional and global trends.
            </p>
            <p className="text-gray-700 mb-4">
              Our dashboards combine robust data analysis with user-friendly interfaces, allowing researchers, policymakers, and the public to explore complex datasets and draw meaningful conclusions.
            </p>
            <p className="text-gray-700">
              Each dashboard represents a different aspect of our research focus areas, from economic indicators to security metrics and social issues.
            </p>
          </div>
          
          {/* First two cards - col-3 each */}
          {dashboards.slice(0, 2).map((dashboard, index) => (
            <DashboardCard 
              key={dashboard.id} 
              dashboard={dashboard} 
              index={index} 
            />
          ))}
        </div>
        
        {/* Second Row: 4 cards (col-3 each) */}
        <div className="grid grid-cols-12 gap-6">
          {dashboards.slice(2, 6).map((dashboard, index) => (
            <DashboardCard 
              key={dashboard.id} 
              dashboard={dashboard} 
              index={index} 
              delayOffset={2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Dashboard); 