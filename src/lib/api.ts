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

export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  location: string;
  description: string;
  image: string;
  isOnline: boolean;
  registrationLink: string;
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
    console.error('API fetch error:', error);
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
  // If API_URL is set, try to fetch from API first
  if (API_URL) {
    try {
      const apiResponse = await fetchWithErrorHandling<T>(`${API_URL}/${endpoint}`);
      if (!apiResponse.error) {
        return apiResponse;
      }
      // If API fetch fails, fall back to local data
      console.warn(`API fetch failed, falling back to local data for ${localPath}`);
    } catch {
      console.warn(`API fetch error, falling back to local data for ${localPath}`);
    }
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
  return fetchData<HotTopic[]>('hot-topics', 'hot-topics');
}

export async function fetchPublications(): Promise<ApiResponse<Publication[]>> {
  return fetchData<Publication[]>('publications', 'publications-list');
}

export async function fetchEvents(): Promise<ApiResponse<Event[]>> {
  return fetchData<Event[]>('events', 'events');
}

export async function fetchPodcasts(): Promise<ApiResponse<Podcast[]>> {
  return fetchData<Podcast[]>('podcasts', 'media');
}

export async function fetchExperts(): Promise<ApiResponse<Expert[]>> {
  return fetchData<Expert[]>('experts', 'experts');
}

export async function fetchDashboards(): Promise<ApiResponse<Dashboard[]>> {
  return fetchData<Dashboard[]>('dashboards', 'dashboards');
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
};

export default api; 