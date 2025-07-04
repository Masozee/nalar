"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiPlayCircle, FiYoutube, FiFileText, FiFilter, FiX } from "react-icons/fi";
import { 
  fetchMediaItems, 
  getMediaTypes, 
  getTopics, 
  getDepartments,
  MediaItem,
  MediaResponse,
  Topic,
  Department 
} from "@/services/mediaService";
import { getBestMediaUrl, getPlatformFromUrl } from "@/lib/mediaUtils";

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeType, setActiveType] = useState("All Media");
  const [isMobile, setIsMobile] = useState(false);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch media items and extract metadata from results
        const mediaResponse = await fetchMediaItems({ page_size: 50 });
        const typesData = await getMediaTypes(mediaResponse.results);
        const topicsData = await getTopics(mediaResponse.results);
        const departmentsData = await getDepartments(mediaResponse.results);
        
        setMediaItems(mediaResponse.results);
        setMediaTypes(typesData);
        setTopics(topicsData);
        setDepartments(departmentsData);
              } catch (err) {
        setError('Failed to load media items. Please try again later.');
        console.error('Error loading media data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Filter handlers
  const filterByType = (type: string) => {
    if (type === "All Media") {
      setActiveFilter("all");
    } else if (type === "Podcasts") {
      setActiveFilter("podcast");
    } else if (type === "YouTube") {
      setActiveFilter("youtube");
    } else if (type === "News") {
      setActiveFilter("news");
    }
    setActiveType(type);
  };
  
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
  };
  
  // Filter media items
  const filteredItems = mediaItems.filter(item => {
    const typeMatch = activeFilter === "all" || item.media_type === activeFilter;
    const categoryMatch = activeCategory === "All Categories" || 
      item.topic.some(topic => topic.name === activeCategory) ||
      item.department.some(dept => dept.name === activeCategory);
    return typeMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-teal transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get available filter options
  const mediaTypeOptions = ["All Media", ...mediaTypes.map(type => 
    type === "podcast" ? "Podcasts" : 
    type === "youtube" ? "YouTube" : 
    type === "news" ? "News" : type
  )];
  
  const categoryOptions = [
    "All Categories",
    ...topics.map(topic => topic.name),
    ...departments.map(dept => dept.name)
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-primary overflow-hidden">
        <Image 
          src="/bg/getty-images-C3gjLSgTKNw-unsplash.jpg" 
          alt="Media Hero Background"
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Media</h1>
            <p className="text-xl text-white opacity-90 max-w-2xl">
              Explore our library of podcasts, videos, and news appearances featuring CSIS experts discussing the most pressing global issues.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
          >
            <span className="flex items-center text-gray-700 font-medium">
              <FiFilter className="mr-2" /> 
              Filters
            </span>
            <span className="text-sm text-primary">
              {activeType !== "All Media" && `Type: ${activeType}`}
              {activeType !== "All Media" && activeCategory !== "All Categories" && " • "}
              {activeCategory !== "All Categories" && `Category: ${activeCategory}`}
            </span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            md:w-64 flex-shrink-0 bg-white rounded-lg p-4
            ${isMobile ? 'fixed inset-0 z-50 bg-white overflow-auto transform transition-transform duration-300 ease-in-out' : ''}
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile Close Button */}
            {isMobile && (
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-lg font-bold">Filters</h2>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">MEDIA TYPE</h3>
              <div className="space-y-2">
                {mediaTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      filterByType(type);
                      if (isMobile) setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeType === type
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">CATEGORY</h3>
              <div className="space-y-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      filterByCategory(category);
                      if (isMobile) setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeCategory === category
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          
          {/* Media Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">
                {activeType} 
                {activeCategory !== "All Categories" && ` • ${activeCategory}`}
              </h2>
              <p className="text-sm text-gray-500">Showing {filteredItems.length} results</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const mediaUrl = getBestMediaUrl(item);
                const platform = mediaUrl ? getPlatformFromUrl(mediaUrl) : '';
                
                return (
                  <Link 
                    key={item.id} 
                    href={`/media/${item.media_type}/${item.slug}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.thumbnail || "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute bottom-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        {item.media_type === "podcast" && <FiPlayCircle className="mr-1" />}
                        {item.media_type === "youtube" && <FiYoutube className="mr-1" />}
                        {item.media_type === "news" && <FiFileText className="mr-1" />}
                        {item.media_type === "podcast" ? "Podcast" : 
                         item.media_type === "youtube" ? "Video" : 
                         item.media_type === "news" ? "News" : item.media_type}
                      </div>
                      {/* Platform indicator */}
                      {platform && platform !== 'Unknown' && (
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {platform}
                        </div>
                      )}
                      {/* Playable indicator */}
                      {mediaUrl && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            {item.media_type === "podcast" && <FiPlayCircle className="text-white" size={24} />}
                            {item.media_type === "youtube" && <FiYoutube className="text-white" size={24} />}
                            {item.media_type === "news" && <FiFileText className="text-white" size={24} />}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-medium text-gray-500 mb-2 flex justify-between">
                        <span>{item.topic[0]?.name || item.department[0]?.name || 'General'}</span>
                        <span>{new Date(item.publish_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                      <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">{item.title}</h3>
                      <div className="text-xs text-gray-500 mb-2">
                        <span>Featuring: </span>
                        {item.persons.length > 0 ? 
                          item.persons.slice(0, 2).map(p => p.person.name).join(', ') + 
                          (item.persons.length > 2 ? ` +${item.persons.length - 2} more` : '') :
                          'CSIS Experts'}
                      </div>
                      {/* Media availability indicator */}
                      {mediaUrl && (
                        <div className="text-xs text-primary font-medium flex items-center">
                          {item.media_type === "podcast" && <FiPlayCircle className="mr-1" size={12} />}
                          {item.media_type === "youtube" && <FiYoutube className="mr-1" size={12} />}
                          {item.media_type === "news" && <FiFileText className="mr-1" size={12} />}
                          Available {platform && `on ${platform}`}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="bg-gray-50 p-8 text-center rounded-lg">
                <h3 className="text-lg font-medium text-gray-500 mb-2">No media found</h3>
                <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile filter overlay */}
      {showMobileFilters && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileFilters(false)}
        ></div>
      )}
    </div>
  );
} 