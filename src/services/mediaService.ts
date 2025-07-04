// Use Next.js API routes instead of calling backend directly
const API_BASE_URL = '/api';

export interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  date_created: string;
  publish: boolean;
  parent_name?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Department {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  date_created: string;
  publish: boolean;
}

export interface Person {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  position: string;
  department: Department;
}

export interface MediaPerson {
  id: number;
  person: Person;
  order: number;
  role: string;
  notes: string;
}

export interface MediaItem {
  id: number;
  title: string;
  slug: string;
  media_type: string;
  description: string;
  thumbnail: string | null;
  thumbnail_credit: string;
  publish_date: string;
  featured: boolean;
  topic: Topic[];
  department: Department[];
  project_info: any;
  publish: boolean;
  viewed: number;
  persons: MediaPerson[];
  // New fields for external links
  link: string | null;
  transformed_link: string | null;
  // Existing podcast/YouTube specific fields
  podcast_url?: string | null;
  podcast_platform?: string | null;
  episode_number?: number | null;
  duration?: string | null;
  youtube_url?: string | null;
  youtube_embed?: string | null;
  youtube_id?: string | null;
  news_source?: string | null;
  news_url?: string | null;
  author?: string | null;
}

export interface MediaResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MediaItem[];
}

export interface MediaFilters {
  media_type?: string;
  topic?: string;
  department?: string;
  featured?: boolean;
  page_size?: number;
  cursor?: string;
}

// Fallback data converter
const convertLocalDataToMediaItems = (localData: any[]): MediaItem[] => {
  return localData.map((item, index) => ({
    id: index + 1,
    title: item.title,
    slug: item.slug,
    media_type: item.type?.toLowerCase() === 'op-ed' ? 'news' : 'news',
    description: item.snippet || '',
    thumbnail: item.imageUrl || null,
    thumbnail_credit: '',
    publish_date: item.publicationDate || new Date().toISOString(),
    featured: index < 3, // First 3 items are featured
    topic: [{
      id: 1,
      name: item.source || 'General',
      slug: item.source?.toLowerCase().replace(/\s+/g, '-') || 'general',
      description: '',
      image: null,
      date_created: new Date().toISOString(),
      publish: true
    }],
    department: [{
      id: 1,
      name: 'CSIS Indonesia',
      slug: 'csis-indonesia',
      description: '',
      image: '',
      date_created: new Date().toISOString(),
      publish: true
    }],
    project_info: null,
    publish: true,
    viewed: 0,
    persons: [{
      id: 1,
      person: {
        id: 1,
        name: 'CSIS Expert',
        slug: 'csis-expert',
        photo: null,
        position: 'Researcher',
        department: {
          id: 1,
          name: 'CSIS Indonesia',
          slug: 'csis-indonesia',
          description: '',
          image: '',
          date_created: new Date().toISOString(),
          publish: true
        }
      },
      order: 1,
      role: 'Author',
      notes: ''
    }],
    // New fields with fallback values
    link: null,
    transformed_link: null,
    podcast_url: null,
    podcast_platform: null,
    episode_number: null,
    duration: null,
    youtube_url: null,
    youtube_embed: null,
    youtube_id: null,
    news_source: null,
    news_url: null,
    author: null
  }));
};

/**
 * Fetch media items from the API
 */
export const fetchMediaItems = async (filters: MediaFilters = {}): Promise<MediaResponse> => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.media_type) params.append('media_type', filters.media_type);
    if (filters.topic) params.append('topic', filters.topic);
    if (filters.department) params.append('department', filters.department);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.cursor) params.append('cursor', filters.cursor);
    
    const url = `${API_BASE_URL}/media${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Fetching media items from:', url);
    console.log('Starting API fetch request...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API response received:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media items: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Media items fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching media items:', error);
    console.log('Falling back to local data');
    
    // Fallback to local data
    try {
      const localData = await import('../../data/media.json');
      const mediaItems = convertLocalDataToMediaItems(localData.default);
      
      // Apply filters to local data
      let filteredItems = mediaItems;
      
      if (filters.media_type && filters.media_type !== 'all') {
        filteredItems = filteredItems.filter(item => item.media_type === filters.media_type);
      }
      
      if (filters.featured !== undefined) {
        filteredItems = filteredItems.filter(item => item.featured === filters.featured);
      }
      
      // Apply pagination
      const pageSize = filters.page_size || 20;
      const startIndex = 0; // For simplicity, we'll start from the beginning
      const endIndex = startIndex + pageSize;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);
      
      return {
        count: filteredItems.length,
        next: filteredItems.length > endIndex ? 'next' : null,
        previous: null,
        results: paginatedItems
      };
    } catch (localError) {
      console.error('Error loading local data:', localError);
      throw new Error('Failed to load media items from both API and local data');
    }
  }
};

/**
 * Fetch a single media item by slug
 */
export const fetchMediaItem = async (slug: string): Promise<MediaItem> => {
  try {
    const url = `${API_BASE_URL}/media/${slug}`;
    console.log('Fetching from backend:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Backend response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching media item:', error);
    throw error;
  }
};

/**
 * Get unique media types from provided media items or API
 */
export const getMediaTypes = async (mediaItems?: MediaItem[]): Promise<string[]> => {
  try {
    let items = mediaItems;
    if (!items) {
      const response = await fetchMediaItems({ page_size: 100 });
      items = response.results;
    }
    const types = [...new Set(items.map(item => item.media_type))];
    return types.length > 0 ? types : ['podcast', 'youtube', 'news'];
  } catch (error) {
    console.error('Error getting media types:', error);
    return ['podcast', 'youtube', 'news'];
  }
};

/**
 * Get unique topics from provided media items or API
 */
export const getTopics = async (mediaItems?: MediaItem[]): Promise<Topic[]> => {
  try {
    let items = mediaItems;
    if (!items) {
      const response = await fetchMediaItems({ page_size: 100 });
      items = response.results;
    }
    const allTopics = items.flatMap(item => item.topic);
    const uniqueTopics = allTopics.filter((topic, index, self) => 
      index === self.findIndex(t => t.id === topic.id)
    );
    return uniqueTopics.length > 0 ? uniqueTopics : [
      {
        id: 1,
        name: 'General',
        slug: 'general',
        description: 'General topics',
        image: null,
        date_created: new Date().toISOString(),
        publish: true
      }
    ];
  } catch (error) {
    console.error('Error getting topics:', error);
    return [
      {
        id: 1,
        name: 'General',
        slug: 'general',
        description: 'General topics',
        image: null,
        date_created: new Date().toISOString(),
        publish: true
      }
    ];
  }
};

/**
 * Get unique departments from provided media items or API
 */
export const getDepartments = async (mediaItems?: MediaItem[]): Promise<Department[]> => {
  try {
    let items = mediaItems;
    if (!items) {
      const response = await fetchMediaItems({ page_size: 100 });
      items = response.results;
    }
    const allDepartments = items.flatMap(item => item.department);
    const uniqueDepartments = allDepartments.filter((dept, index, self) => 
      index === self.findIndex(d => d.id === dept.id)
    );
    return uniqueDepartments.length > 0 ? uniqueDepartments : [
      {
        id: 1,
        name: 'CSIS Indonesia',
        slug: 'csis-indonesia',
        description: 'Centre for Strategic and International Studies',
        image: '',
        date_created: new Date().toISOString(),
        publish: true
      }
    ];
  } catch (error) {
    console.error('Error getting departments:', error);
    return [
      {
        id: 1,
        name: 'CSIS Indonesia',
        slug: 'csis-indonesia',
        description: 'Centre for Strategic and International Studies',
        image: '',
        date_created: new Date().toISOString(),
        publish: true
      }
    ];
  }
};