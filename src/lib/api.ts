// API utility functions for data fetching

// Environment variables for API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const S3_BUCKET_URL = 'https://s3-csis-web.s3.ap-southeast-1.amazonaws.com';

// Type definitions for API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Interface definitions for different data types
export interface Publication {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  publishDate: string;
  author: string;
  category: string;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  date_release: string;
  description: string;
  image: string;
  image_credit?: string;
  publish: boolean;
  date_created: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  time_start?: string;
  time_end?: string;
  location: string;
  description: string;
  image: string;
  isOnline: boolean;
  registrationLink: string;
  speaker?: Array<{id: number; name: string; slug: string}>;
  opening_speech?: Array<{id: number; name: string; slug: string}>;
  closing_remarks?: Array<{id: number; name: string; slug: string}>;
  photos?: string[];
}

export interface Podcast {
  id: string;
  title: string;
  audioUrl: string;
  coverImage: string;
  publishDate: string;
  duration: string;
  host: string;
  guests: string[];
  spotifyEmbed?: string;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  expertise: string[];
  email: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface HotTopic {
  id: number;
  title: string;
  description: string;
  image: string;
  slug: string;
  color: string;
}

export interface Dashboard {
  id: number;
  title: string;
  icon: string;
  description: string;
  link: string;
  image: string;
}

// Homepage API types
export interface HomepageData {
  the_latest: {
    latest_publication: {
      id: number;
      title: string;
      slug: string;
      date: string;
      image: string;
      authors: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
    } | null;
    category_publications: Array<{
      category: {
        id: number;
        name: string;
        slug: string;
      };
      publication: {
        id: number;
        title: string;
        slug: string;
        date: string;
        image: string;
        authors: Array<{
          id: number;
          name: string;
          slug: string;
        }>;
      };
    }>;
  };
  events: Array<{
    id: number;
    title: string;
    slug: string;
    date_start: string;
    date_end: string | null;
    time_start: string | null;
    time_end: string | null;
    location: string | null;
    image: string | null;
    is_upcoming: boolean;
  }>;
  publications: {
    latest_publications: Array<{
      id: number;
      title: string;
      slug: string;
      date: string;
      image: string;
      authors: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
    }>;
    category_publications: Array<{
      category: {
        id: number;
        name: string;
        slug: string;
      };
      publication: {
        id: number;
        title: string;
        slug: string;
        date: string;
        image: string;
        authors: Array<{
          id: number;
          name: string;
          slug: string;
        }>;
      };
    }>;
    journal_links: Array<{
      name: string;
      url: string;
    }>;
  };
  csis_on_news: Array<{
    id: number;
    title: string;
    author: {
      id: number;
      name: string;
      slug: string;
    };
    source: string;
    date: string | null;
    link: string | null;
    category: string;
  }>;
}

// Generic fetch function with error handling
async function fetchWithErrorHandling<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Revalidate data every hour
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API fetch error for ${url}:`, error);
    return {
      data: {} as T,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Function to fetch data from local JSON files
export async function fetchLocalData<T>(path: string): Promise<ApiResponse<T>> {
  try {
    // In production, we would fetch from an API
    // For development, we're using dynamic imports of JSON files
    const data = await import(`../../data/${path}.json`).then(
      (module) => module.default || module
    );
    return { data: data as T };
  } catch (error) {
    console.error(`Error loading local data (${path}):`, error);
    return {
      data: {} as T,
      error: error instanceof Error ? error.message : 'Failed to load local data',
    };
  }
}

// Function to fetch data from API when available, fallback to local data
export async function fetchData<T>(endpoint: string, localPath: string): Promise<ApiResponse<T>> {
  // If API_URL is set and not empty, try to fetch from API first
  if (API_URL && API_URL !== '') {
    try {
      const apiResponse = await fetchWithErrorHandling<T>(`${API_URL}/${endpoint}`);
      if (!apiResponse.error) {
        return apiResponse;
      }
      // If API fetch fails, fall back to local data
      console.warn(`API fetch failed, falling back to local data for ${localPath}`);
    } catch (error) {
      console.warn(`API fetch error, falling back to local data for ${localPath}:`, error);
    }
  } else {
    console.info(`No API URL configured, using local data for ${localPath}`);
  }
  
  // Fallback to local data
  return fetchLocalData<T>(localPath);
}

// Function to fetch data from S3 bucket
export async function fetchS3Data<T>(path: string): Promise<ApiResponse<T>> {
  return fetchWithErrorHandling<T>(`${S3_BUCKET_URL}/${path}`);
}

// Specific data fetching functions for different types of content
export async function fetchHotTopics(): Promise<ApiResponse<HotTopic[]>> {
  // Use local hot topics data
  console.info('Using local hot topics data');
  return {
    data: [
      {
        id: 1,
        title: "Climate Change",
        description: "Research on climate change impacts and policy responses in Southeast Asia",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/chris-leboutillier-TUJud0AWAPI-unsplash.jpg",
        slug: "climate-change",
        color: "#34D399"
      },
      {
        id: 2,
        title: "Digital Economy",
        description: "Analysis of digital transformation trends and economic impacts",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/arnaud-jaegers-IBWJsMObnnU-unsplash.jpg",
        slug: "digital-economy",
        color: "#60A5FA"
      },
      {
        id: 3,
        title: "US-China Relations",
        description: "Implications of US-China dynamics for Southeast Asia",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/kurt-cotoaga-cV73uDwuti0-unsplash.jpg",
        slug: "us-china-relations",
        color: "#F87171"
      }
    ]
  };
}

export async function fetchPublications(): Promise<ApiResponse<Publication[]>> {
  // Use local publications data
  console.info('Using local publications data');
  return {
    data: [
      {
        id: "p1",
        title: "Indonesia's Strategic Position in ASEAN",
        slug: "indonesia-strategic-position-asean",
        summary: "Analysis of Indonesia's diplomatic role in ASEAN and its implications",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/scottsdale-mint-kGpq0hj_xc0-unsplash.jpg",
        publishDate: "2024-05-10",
        author: "Dr. Lina Alexandra",
        category: "International Relations"
      },
      {
        id: "p2",
        title: "Economic Outlook 2024: Post-Pandemic Recovery",
        slug: "economic-outlook-2024",
        summary: "Comprehensive analysis of Indonesia's economic trends for 2024",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/kurt-cotoaga-cV73uDwuti0-unsplash.jpg",
        publishDate: "2024-04-25",
        author: "Dr. Yose Rizal",
        category: "Economics"
      },
      {
        id: "p3",
        title: "Maritime Security in the South China Sea",
        slug: "maritime-security-south-china-sea",
        summary: "Assessment of security challenges in the South China Sea",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/arnaud-jaegers-IBWJsMObnnU-unsplash.jpg",
        publishDate: "2024-03-18",
        author: "Dr. Evan Laksmana",
        category: "Security Studies"
      }
    ]
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  current_page?: number;
  total_pages?: number;
}

export async function fetchEvents(cursor?: string, status?: string, page_size: number = 12): Promise<ApiResponse<PaginatedResponse<Event>>> {
  try {
    // Connect to the actual API endpoint
    let apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/events/`;
    
    // Add status filter if provided (upcoming or past)
    if (status && (status === 'upcoming' || status === 'past')) {
      apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/events/${status}/`;
    }
    
    // Add cursor for pagination if provided
    if (cursor) {
      apiUrl += `?cursor=${encodeURIComponent(cursor)}`;
      // Add page_size parameter if cursor is provided
      apiUrl += `&page_size=${page_size}`;
    } else {
      // If no cursor, start with page_size parameter
      apiUrl += `?page_size=${page_size}`;
    }
    
    console.info('Fetching events from API:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    
    // The API returns a paginated response with 'results' containing the array of events
    if (jsonResponse.results && Array.isArray(jsonResponse.results)) {
      // Transform the API data to match our Event interface
      const transformedEvents = jsonResponse.results.map((event: any) => ({
        id: event.id.toString(),
        title: event.title,
        slug: event.slug,
        date: event.date_start,
        time_start: event.time_start,
        time_end: event.time_end,
        location: event.location || 'TBD',
        description: event.description || '',
        image: event.image || '',
        isOnline: event.location ? false : true,
        registrationLink: event.link || '',
        speaker: event.speaker || [],
        opening_speech: event.opening_speech || [],
        closing_remarks: event.closing_remarks || [],
        photos: event.photos || []
      }));
      
      return { 
        data: {
          count: jsonResponse.count,
          next: jsonResponse.next,
          previous: jsonResponse.previous,
          results: transformedEvents,
          page_size: jsonResponse.page_size || page_size,
          has_next: jsonResponse.has_next || false,
          has_previous: jsonResponse.has_previous || false,
          current_page: jsonResponse.current_page || 1,
          total_pages: jsonResponse.total_pages || Math.ceil(jsonResponse.count / (jsonResponse.page_size || page_size))
        } 
      };
    } else {
      console.error('Unexpected API response format:', jsonResponse);
      return { 
        data: {
          count: 0,
          next: null,
          previous: null,
          results: [],
          page_size: 10,
          has_next: false,
          has_previous: false
        }, 
        error: 'Unexpected API response format' 
      };
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return empty data array with error message
    return {
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
        page_size: 10,
        has_next: false,
        has_previous: false
      },
      error: error instanceof Error ? error.message : 'Unknown error fetching events'
    };
  }
}

export async function fetchPodcasts(): Promise<ApiResponse<Podcast[]>> {
  // Use local podcast data instead of trying to fetch from API
  console.info('Using local podcast data');
  return {
    data: [
      {
        id: "1",
        title: "Indonesia's Economic Outlook for 2024",
        audioUrl: "https://example.com/podcasts/episode1.mp3",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/scottsdale-mint-kGpq0hj_xc0-unsplash.jpg",
        publishDate: "May 15, 2024",
        duration: "45:12",
        host: "Dr. Ahmad Setiawan",
        guests: ["Prof. Maria Tantri"],
        spotifyEmbed: "<iframe style=\"border-radius:12px\" src=\"https://open.spotify.com/embed/episode/38rDuvI4LB4gJbBtlKv9gm?utm_source=generator\" width=\"100%\" height=\"352\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\" loading=\"lazy\"></iframe>"
      },
      {
        id: "2",
        title: "ASEAN's Role in Regional Security",
        audioUrl: "https://example.com/podcasts/episode2.mp3",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/kurt-cotoaga-cV73uDwuti0-unsplash.jpg",
        publishDate: "May 1, 2024",
        duration: "38:45",
        host: "Dr. Ahmad Setiawan",
        guests: ["Dr. James Wong"]
      },
      {
        id: "3",
        title: "Climate Change Policy in Southeast Asia",
        audioUrl: "https://example.com/podcasts/episode3.mp3",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/chris-leboutillier-TUJud0AWAPI-unsplash.jpg",
        publishDate: "April 15, 2024",
        duration: "42:18",
        host: "Dr. Ahmad Setiawan",
        guests: ["Dr. Lisa Green"]
      },
      {
        id: "4",
        title: "Digital Transformation and Governance",
        audioUrl: "https://example.com/podcasts/episode4.mp3",
        coverImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/arnaud-jaegers-IBWJsMObnnU-unsplash.jpg",
        publishDate: "April 1, 2024",
        duration: "36:50",
        host: "Dr. Ahmad Setiawan",
        guests: ["Dr. Rizki Pratama"]
      }
    ]
  };
}

export async function fetchExperts(): Promise<ApiResponse<Expert[]>> {
  // Use local experts data
  console.info('Using local experts data');
  return {
    data: [
      {
        id: "ex1",
        name: "Dr. Lina Alexandra",
        title: "Head of International Relations Department",
        bio: "Expert in ASEAN relations and regional security",
        profileImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/scottsdale-mint-kGpq0hj_xc0-unsplash.jpg",
        expertise: ["International Relations", "ASEAN", "Security"],
        email: "lina@example.com",
        socialLinks: {
          twitter: "https://twitter.com/linaalexandra",
          linkedin: "https://linkedin.com/in/linaalexandra"
        }
      },
      {
        id: "ex2",
        name: "Dr. Yose Rizal",
        title: "Senior Economist",
        bio: "Specializes in macroeconomic analysis and policy",
        profileImage: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/kurt-cotoaga-cV73uDwuti0-unsplash.jpg",
        expertise: ["Economics", "Trade", "Development"],
        email: "yose@example.com",
        socialLinks: {
          linkedin: "https://linkedin.com/in/yoserizal"
        }
      }
    ]
  };
}

export async function fetchDashboards(): Promise<ApiResponse<Dashboard[]>> {
  // Use the mockDashboardData directly instead of trying to fetch from API
  console.info('Using local dashboard data');
  return {
    data: [
      {
        id: 1,
        title: "Economic Indicators",
        icon: "chart-line",
        description: "Real-time economic indicators for Southeast Asia",
        link: "/dashboards/economic-indicators",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/chris-leboutillier-TUJud0AWAPI-unsplash.jpg"
      },
      {
        id: 2,
        title: "Regional Security",
        icon: "shield-alt",
        description: "Defense spending and security metrics",
        link: "/dashboards/regional-security",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/kurt-cotoaga-cV73uDwuti0-unsplash.jpg"
      },
      {
        id: 3,
        title: "Climate Impact",
        icon: "cloud-sun",
        description: "Climate change effects across ASEAN",
        link: "/dashboards/climate-impact",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/scottsdale-mint-kGpq0hj_xc0-unsplash.jpg"
      },
      {
        id: 4,
        title: "Digital Transformation",
        icon: "laptop-code",
        description: "Digital adoption rates and tech infrastructure",
        link: "/dashboards/digital-transformation",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/arnaud-jaegers-IBWJsMObnnU-unsplash.jpg"
      },
      {
        id: 5,
        title: "Trade Flows",
        icon: "exchange-alt",
        description: "Import/export data and trade agreements",
        link: "/dashboards/trade-flows",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/publication/planet-volumes-7dnIhDzIDnI-unsplash.jpg"
      },
      {
        id: 6,
        title: "Political Stability",
        icon: "balance-scale",
        description: "Governance indicators and political risk analysis",
        link: "/dashboards/political-stability",
        image: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/event/img/Dialog_Penguatan....jpg"
      }
    ]
  };
}

import homepageData from '../../data/homepage.json';

// Add Next.js fetch types
type NextFetchRequestConfig = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export const fetchHomepage = async (): Promise<ApiResponse<HomepageData>> => {
  try {
    // Check if we're in development or the API URL is set
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    
    // If we have an API URL, try to fetch from it
    if (BASE_URL && BASE_URL !== '') {
      try {
        const apiUrl = `${BASE_URL}/homepage/`;
        
        const res = await fetch(apiUrl, {
          next: { revalidate: 3600 }, // Revalidate every hour
        } as NextFetchRequestConfig);

        if (!res.ok) {
          throw new Error(`Failed to fetch homepage: ${res.status}`);
        }

        const data = await res.json();
        // Ensure all image URLs are absolute
        if (data) {
          // Process the_latest section
          if (data.the_latest && data.the_latest.latest_publication && data.the_latest.latest_publication.image) {
            data.the_latest.latest_publication.image = ensureAbsoluteImageUrl(data.the_latest.latest_publication.image, BASE_URL);
          }
          
          // Process category_publications
          if (data.the_latest && data.the_latest.category_publications) {
            data.the_latest.category_publications.forEach(item => {
              if (item.publication && item.publication.image) {
                item.publication.image = ensureAbsoluteImageUrl(item.publication.image, BASE_URL);
              }
            });
          }
          
          // Process events
          if (data.events) {
            data.events.forEach(event => {
              if (event.image) {
                event.image = ensureAbsoluteImageUrl(event.image, BASE_URL);
              }
            });
          }
          
          // Process publications
          if (data.publications) {
            // Latest publications
            if (data.publications.latest_publications) {
              data.publications.latest_publications.forEach(pub => {
                if (pub.image) {
                  pub.image = ensureAbsoluteImageUrl(pub.image, BASE_URL);
                }
              });
            }
            
            // Category publications
            if (data.publications.category_publications) {
              data.publications.category_publications.forEach(item => {
                if (item.publication && item.publication.image) {
                  item.publication.image = ensureAbsoluteImageUrl(item.publication.image, BASE_URL);
                }
              });
            }
          }
        }
        
        return { data };
      } catch (error) {
        console.warn('Error fetching from API, falling back to local data:', error);
        // Fall back to local data on API error, don't throw
      }
    }
    
    // Process local data to ensure images have proper paths
    const processedData = JSON.parse(JSON.stringify(homepageData));
    
    // Return local data if API is not available or failed
    console.info('Using local homepage data');
    return { 
      data: processedData as HomepageData
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return local fallback data with error
    return { 
      data: homepageData as HomepageData,
      error: error instanceof Error ? error.message : 'Failed to fetch homepage data'
    };
  }
};

// Helper function to ensure image URLs are absolute
function ensureAbsoluteImageUrl(imageUrl: string, baseUrl: string): string {
  if (!imageUrl) return '/placeholder-image.jpg';
  
  // If the URL already starts with http/https, it's already absolute
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it starts with a slash, append to base URL
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // Otherwise, add a slash and append
  return `${baseUrl}/${imageUrl}`;
}

// This section was removed to fix duplicate interface declarations

export async function fetchNews(cursor?: string, page_size: number = 12): Promise<ApiResponse<PaginatedResponse<News>>> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let url = `${API_URL}/api/news/?page_size=${page_size}`;
    
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Revalidate data every hour
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching news: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process image URLs to ensure they're absolute
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.map((news: News) => ({
        ...news,
        image: ensureAbsoluteImageUrl(news.image, API_URL),
      }));
    }
    
    return { data };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
        page_size: page_size,
        has_next: false,
        has_previous: false,
        current_page: 1,
        total_pages: 0,
      },
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

// Export a default object for convenient imports
const api = {
  fetchLocalData,
  fetchData,
  fetchS3Data,
  fetchHotTopics,
  fetchPublications,
  fetchEvents,
  fetchPodcasts,
  fetchExperts,
  fetchDashboards,
  fetchHomepage,
  ensureAbsoluteImageUrl,
  fetchNews,
};

export default api;