
// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Define the search result interface
export interface SearchResultItem {
  id: number;
  title?: string;
  name?: string; // For people
  slug: string;
  image?: string;
  photo?: string; // For people
  thumbnail?: string; // For media
  date_publish?: string;
  date_created?: string;
  date_release?: string; // For news
  publish_date?: string; // For media
  date_start?: string; // For events
  category: string;
  relevance_score?: number;
}

// Define the pagination interface
export interface Pagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_results: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

// Define the search response interface
export interface SearchResponse {
  results: SearchResultItem[];
  result_count: {
    people?: number;
    publications?: number;
    events?: number;
    news?: number;
    media?: number;
    total: number;
  };
  timing: number;
  related_searches: string[];
  pagination: Pagination;
}

// Define search parameters interface
export interface SearchParams {
  q: string;
  page?: number;
  page_size?: number;
  models?: string[];
  order_by?: string;
  department?: string;
  topic?: string;
  date_from?: string;
  date_to?: string;
  use_relevance?: boolean;
}

/**
 * Search API service
 */
export const searchService = {
  /**
   * Search for content across all models
   * @param params Search parameters
   * @returns Search results with pagination
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    try {
      const url = new URL(`${API_BASE_URL}/search/`);
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v));
        } else if (value !== undefined && value !== "") {
          url.searchParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  },

  /**
   * Get popular searches
   * @param days Number of days to look back (default: 30)
   * @param limit Maximum number of results to return (default: 10)
   * @returns List of popular search terms
   */
  getPopularSearches: async (days = 30, limit = 10): Promise<string[]> => {
    try {
      const url = new URL(`${API_BASE_URL}/search/popular/`);
      url.searchParams.append('days', days.toString());
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.popular_searches;
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      throw error;
    }
  },

  /**
   * Get popular keywords
   * @param days Number of days to look back (default: 30)
   * @param limit Maximum number of results to return (default: 10)
   * @returns List of popular keywords
   */
  getPopularKeywords: async (days = 30, limit = 10): Promise<string[]> => {
    try {
      const url = new URL(`${API_BASE_URL}/search/keywords/`);
      url.searchParams.append('days', days.toString());
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.popular_keywords;
    } catch (error) {
      console.error('Error fetching popular keywords:', error);
      throw error;
    }
  }
};

export default searchService;
