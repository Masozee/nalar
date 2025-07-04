'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PublicationRedirect() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  useEffect(() => {
    // Redirect to the new URL structure
    router.replace(`/publication/${slug}`);
  }, [router, slug]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the new page.</p>
      </div>
    </div>
  );
}
