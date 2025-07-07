'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { FiArrowLeft, FiCalendar, FiUser, FiEye } from 'react-icons/fi';

// API interfaces
interface PublicationAuthor {
  id: number;
  name: string;
  slug: string;
  position?: string;
  organization?: string;
  image?: string;
}

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  background?: string;
  keterangan?: string;
}

interface ApiPublication {
  id: number;
  title: string;
  slug: string;
  date_publish: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  category_info?: CategoryInfo;
  authors: PublicationAuthor[];
  file?: string;
  image: string;
  topic?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  download_count?: number;
  viewed?: number;
  tags?: string[];
}

interface APIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiPublication[];
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Publication card component
function PublicationCard({ 
  publication, 
  index, 
  formatDate, 
  handleDownload 
}: { 
  publication: ApiPublication; 
  index: number; 
  formatDate: (date: string) => string;
  handleDownload: (pub: ApiPublication) => void;
}) {
  return (
    <motion.div
      key={publication.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Publication Image */}
      <div className="aspect-w-16 aspect-h-9 relative h-48">
        <Image 
          src={publication.image || '/bg/default-publication.jpg'}
          alt={publication.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-accent text-white text-xs font-medium px-2 py-1 rounded">
            {publication.category_info?.name || publication.category.name}
          </span>
        </div>
      </div>

      {/* Publication Content */}
      <div className="p-6">
        {/* Date and Stats */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FiCalendar className="mr-1" />
          <span>{formatDate(publication.date_publish)}</span>
          {publication.viewed && (
            <>
              <span className="mx-2">•</span>
              <FiEye className="mr-1" />
              <span>{publication.viewed} views</span>
            </>
          )}
        </div>

        {/* Title */}
        <Link href={`/publication/${publication.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
            {publication.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">
          {stripHtml(publication.description)}
        </p>

        {/* Authors */}
        {publication.authors && publication.authors.length > 0 && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <FiUser className="mr-1" />
            <span>
              {formatAuthors(publication.authors)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/publication/${publication.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read More →
          </Link>
        </div>

        {/* Topics */}
        {publication.topic && publication.topic.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {publication.topic.slice(0, 3).map((topic) => (
                <Link
                  key={topic.id}
                  href={`/publications?topic=${encodeURIComponent(topic.name)}`}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {topic.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Utility function to format authors
const formatAuthors = (authors: PublicationAuthor[]): string => {
  if (!authors || authors.length === 0) return 'Unknown';
  
  if (authors.length === 1) {
    return authors[0].name;
  }
  
  const firstAuthor = authors[0].name;
  const remainingCount = authors.length - 1;
  return `${firstAuthor}, +${remainingCount} more`;
};

// Utility function to strip HTML tags
const stripHtml = (html: string): string => {
  if (typeof window !== 'undefined') {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  // Server-side fallback
  return html.replace(/<[^>]*>/g, '');
};

export default function CategoryPublications() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  
  const [publications, setPublications] = useState<ApiPublication[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCategoryPublications = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Fetch publications for this category
        const pubResponse = await fetch(`${API_BASE_URL}/publications/?category=${categorySlug}&page_size=100`);
        if (!pubResponse.ok) {
          throw new Error('Failed to fetch publications');
        }
        
        const pubData: APIResponse = await pubResponse.json();
        
        if (pubData.results.length === 0) {
          // Check if category exists by fetching all categories
          const catResponse = await fetch(`${API_BASE_URL}/publication-categories/`);
          if (catResponse.ok) {
            const categories = await catResponse.json();
            const categoryExists = categories.results?.some((cat: CategoryInfo) => cat.slug === categorySlug);
            
            if (!categoryExists) {
              setError('Category not found');
              return;
            }
          }
        }

        setPublications(pubData.results);
        setTotalCount(pubData.count);
        
        // Get category info from first publication or fetch separately
        if (pubData.results.length > 0) {
          const firstPub = pubData.results[0];
          setCategoryInfo(firstPub.category_info || {
            id: firstPub.category.id,
            name: firstPub.category.name,
            slug: firstPub.category.slug
          });
        } else {
          // Fetch category info separately if no publications
          const catResponse = await fetch(`${API_BASE_URL}/publication-categories/${categorySlug}/`);
          if (catResponse.ok) {
            const categoryData = await catResponse.json();
            setCategoryInfo(categoryData);
          }
        }
        
      } catch (err) {
        console.error('Error fetching category publications:', err);
        setError('Failed to load publications for this category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryPublications();
  }, [categorySlug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async (publication: ApiPublication) => {
    if (publication.file) {
      // Track download
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${API_BASE_URL}/publications/${publication.slug}/download/`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error tracking download:', error);
      }
      
      // Trigger download
      window.open(publication.file, '_blank');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/publications"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Publications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="min-h-screen bg-gray-50">
        {/* Category Header */}
        <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
          {categoryInfo?.background && (
            <Image
              src={categoryInfo.background}
              alt={categoryInfo.name || ''}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
              priority
            />
          )}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Link 
                href="/publications"
                className="inline-flex items-center text-green-100 hover:text-white transition-colors mb-4"
              >
                <FiArrowLeft className="mr-2" />
                Back to All Publications
              </Link>
              <div className="inline-block bg-accent px-4 py-2 w-fit">
                <span className="text-lg font-medium text-white">Category</span>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold !text-white mb-4"
            >
              {categoryInfo?.name || 'Publications'}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <p className="text-lg text-green-100">
                {totalCount} {totalCount === 1 ? 'publication' : 'publications'}
              </p>
              {categoryInfo?.keterangan && (
                <p className="text-lg text-green-100 max-w-2xl">
                  {categoryInfo.keterangan}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Publications Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {publications.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Publications Found</h2>
              <p className="text-gray-600 mb-6">
                There are currently no publications in the {categoryInfo?.name} category.
              </p>
              <Link 
                href="/publications"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Browse All Publications
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((publication, index) => (
                <PublicationCard
                  key={publication.id}
                  publication={publication}
                  index={index}
                  formatDate={formatDate}
                  handleDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </Suspense>
  );
}