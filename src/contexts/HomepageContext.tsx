'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { HomepageData } from '@/lib/api';

interface HomepageContextType {
  homepageData: HomepageData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export function HomepageProvider({ children }: { children: ReactNode }) {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.fetchHomepage();
      
      if (response.error) {
        setError(response.error);
      } else {
        setHomepageData(response.data);
      }
    } catch (err) {
      setError('Failed to load homepage data');
      console.error('Homepage data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return (
    <HomepageContext.Provider value={{ homepageData, isLoading, error, refetch }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage(): HomepageContextType {
  const context = useContext(HomepageContext);
  if (context === undefined) {
    throw new Error('useHomepage must be used within a HomepageProvider');
  }
  return context;
} 