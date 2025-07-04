import { NextRequest } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BACKEND_USERNAME = process.env.BACKEND_USERNAME || 'admin.csis';
const BACKEND_PASSWORD = process.env.BACKEND_PASSWORD || 'TanahAbang1971';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to the backend API
    const url = `${BACKEND_API_URL}/api/media/?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${BACKEND_USERNAME}:${BACKEND_PASSWORD}`).toString('base64')}`,
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return Response.json(
        { error: `Backend API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error in media API route:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 