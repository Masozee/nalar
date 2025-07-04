import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiFileText, FiUser, FiVideo, FiRadio } from 'react-icons/fi';
import { SearchResultItem } from '@/services/searchService';

interface SearchResultCardProps {
  result: SearchResultItem;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  // Helper function to get the appropriate icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'publications':
        return <FiFileText className="w-5 h-5" />;
      case 'events':
        return <FiCalendar className="w-5 h-5" />;
      case 'people':
        return <FiUser className="w-5 h-5" />;
      case 'media':
        return <FiVideo className="w-5 h-5" />;
      case 'news':
        return <FiRadio className="w-5 h-5" />;
      default:
        return <FiFileText className="w-5 h-5" />;
    }
  };

  // Helper function to get the appropriate URL based on category
  const getItemUrl = (result: SearchResultItem) => {
    switch (result.category) {
      case 'publications':
        return `/publications/${result.slug}`;
      case 'events':
        return `/events/${result.slug}`;
      case 'people':
        return `/scholars/${result.slug}`;
      case 'media':
        return `/media/${result.slug}`;
      case 'news':
        return `/news/${result.slug}`;
      default:
        return `/${result.slug}`;
    }
  };

  // Helper function to get the appropriate date field based on category
  const getItemDate = (result: SearchResultItem) => {
    if (result.date_publish) return result.date_publish;
    if (result.date_created) return result.date_created;
    if (result.date_release) return result.date_release;
    if (result.publish_date) return result.publish_date;
    if (result.date_start) return result.date_start;
    return '';
  };

  // Helper function to get the appropriate title based on category
  const getItemTitle = (result: SearchResultItem) => {
    return result.title || result.name || 'Untitled';
  };

  // Helper function to get the appropriate image based on category
  const getItemImage = (result: SearchResultItem) => {
    return result.image || result.photo || result.thumbnail || '/placeholder-image.jpg';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const itemUrl = getItemUrl(result);
  const itemTitle = getItemTitle(result);
  const itemDate = getItemDate(result);
  const itemImage = getItemImage(result);
  const formattedDate = formatDate(itemDate);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      <Link href={itemUrl} className="block h-full">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={itemImage}
            alt={itemTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // Fallback image if the original fails to load
              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
            }}
          />
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium capitalize">
            {result.category}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="mr-2">{getCategoryIcon(result.category)}</span>
            <span>{formattedDate}</span>
            {result.relevance_score !== undefined && (
              <span className="ml-auto bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                Score: {result.relevance_score.toFixed(2)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{itemTitle}</h3>
        </div>
      </Link>
    </div>
  );
};

export default SearchResultCard;
