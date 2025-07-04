/**
 * API service for fetching scholars data from the backend
 */

export interface Department {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  date_created: string;
  publish: boolean;
}

export interface Expertise {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_name?: any;
}

export interface Publication {
  id: number;
  title: string;
  slug: string;
  date_publish: string;
  image: string;
  category_info?: {
    id: number;
    name: string;
    slug: string;
  };
  authors: {
    id: number;
    name: string;
    slug: string;
  }[];
  description?: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  date_start: string;
  date_end: string | null;
  location: string;
  image: string;
  description?: string;
}

export interface Scholar {
  id: number;
  name: string;
  slug: string;
  position: string;
  organization: string;
  category: string;
  expertise: Expertise[];
  department: Department[];
  profile_url: string;
  profile_img: string;
  // Simplified interface with only the minimum required fields
}

/**
 * Fetches scholars data from the API with only the minimum required fields
 * @returns Promise with scholars data array
 */
export async function fetchScholars(): Promise<Scholar[]> {
  // Only request the minimum fields needed for the scholars page
  const minimalFields = 'name,slug,position,organization,profile_url,profile_img,expertise,department';
  const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/persons/scholars/?fields=${minimalFields}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch scholars: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetches a single scholar by slug
 * @param slug The scholar's slug
 * @returns Promise with scholar data
 */
export async function fetchScholarBySlug(slug: string): Promise<Scholar> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/persons/${slug}/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch scholar: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
