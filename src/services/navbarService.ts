// Use the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PublicationCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  href: string;
}

export interface FeaturedPublication {
  id: number;
  title: string;
  slug: string;
  date_publish: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  image: string;
}

export interface PublicationDropdownData {
  categories: PublicationCategory[];
  featured_publications: FeaturedPublication[];
  latest_research: FeaturedPublication;
}

export interface MediaCategory {
  name: string;
  href: string;
  count: number;
}

export interface MediaItem {
  id: number;
  title: string;
  slug: string;
  media_type: string;
  thumbnail: string;
  publish_date: string;
  topic?: {
    id: number;
    name: string;
    slug: string;
  }[];
  duration?: string; // For podcasts
}

export interface MediaDropdownData {
  categories: MediaCategory[];
  latest_podcasts: MediaItem[];
  latest_video: MediaItem;
}

export interface NavbarConfig {
  publications: PublicationDropdownData;
  media: MediaDropdownData;
}

/**
 * Fetch navbar configuration data
 */
export const fetchNavbarConfig = async (): Promise<NavbarConfig> => {
  try {
    console.log('Fetching navbar config from:', `${API_BASE_URL}/config/navbar/`);
    
    // Add mode: 'cors' and remove credentials for development
    const response = await fetch(`${API_BASE_URL}/config/navbar/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error(`Failed to fetch navbar configuration data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Navbar data fetched successfully');
    return data;
  } catch (error) {
    // Check if it's a network error (CORS or connection issue)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error when fetching navbar data - possible CORS or connection issue:', error);
    } else {
      console.error('Error fetching navbar configuration data:', error);
    }
    
    // For development, add mock data
    console.log('Using fallback navbar data');
    return {
      publications: {
        categories: [
          { id: 1, name: 'Economics', slug: 'economics', count: 24, href: '/publications/economics' },
          { id: 2, name: 'Politics', slug: 'politics', count: 18, href: '/publications/politics' },
          { id: 3, name: 'International Relations', slug: 'international-relations', count: 32, href: '/publications/international-relations' },
        ],
        featured_publications: [],
        latest_research: null
      },
      media: {
        categories: [
          { name: 'Podcasts', href: '/media/podcasts', count: 42 },
          { name: 'YouTube', href: '/media/youtube', count: 76 },
          { name: 'CSIS on News', href: '/media/news', count: 54 },
        ],
        latest_podcasts: [],
        latest_video: null
      }
    };
  }
};

/**
 * Fetch publication dropdown data for navbar
 * @deprecated Use fetchNavbarConfig instead
 */
export const fetchPublicationDropdownData = async (): Promise<PublicationDropdownData> => {
  try {
    const navbarConfig = await fetchNavbarConfig();
    return navbarConfig.publications;
  } catch (error) {
    console.error('Error fetching publication dropdown data:', error);
    return {
      categories: [],
      featured_publications: [],
      latest_research: null
    };
  }
};

/**
 * Fetch media dropdown data for navbar
 * @deprecated Use fetchNavbarConfig instead
 */
export const fetchMediaDropdownData = async (): Promise<MediaDropdownData> => {
  try {
    const navbarConfig = await fetchNavbarConfig();
    return navbarConfig.media;
  } catch (error) {
    console.error('Error fetching media dropdown data:', error);
    return {
      categories: [],
      latest_podcasts: [],
      latest_video: null
    };
  }
};
