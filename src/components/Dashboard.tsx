'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import api, { Dashboard as DashboardItem } from '@/lib/api';

interface DashboardCardProps {
  dashboard: DashboardItem;
  index: number;
  delayOffset?: number;
}

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
        src={dashboard.image.startsWith('http') ? dashboard.image : dashboard.image}
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
  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboards = async () => {
      try {
        setIsLoading(true);
        const response = await api.fetchDashboards();
        
        if (response.error) {
          setError(response.error);
        } else {
          setDashboards(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboards');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboards();
  }, []);

  // Display loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="col-span-12 md:col-span-3 bg-gray-100 h-64 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Display error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboards</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // No dashboards available
  if (dashboards.length === 0) {
    return (
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold text-gray-600 mb-2">No Dashboards Available</h2>
            <p className="text-gray-500">Please check back later for our interactive dashboards.</p>
          </div>
        </div>
      </section>
    );
  }

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