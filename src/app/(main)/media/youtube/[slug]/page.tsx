'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function YouTubeDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      // Redirect to the main media detail page with youtube type
      router.replace(`/media/youtube/${slug}`);
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading video...</p>
      </div>
    </div>
  );
} 