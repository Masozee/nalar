"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiPlayCircle, FiYoutube, FiFileText, FiFilter, FiX } from "react-icons/fi";

// Sample media data
const mediaItems = [
  // Podcasts
  {
    id: "podcast-1",
    title: "Indonesia's Economic Prospects in 2024",
    type: "podcast",
    date: "2024-05-10",
    duration: "34 min",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    category: "Economics",
    speakers: ["Dr. Ahmad Sulaiman", "Lisa Wijaya"],
    description: "Analysis of Indonesia's economic outlook for 2024 amid global uncertainties."
  },
  {
    id: "podcast-2",
    title: "Navigating the South China Sea Disputes",
    type: "podcast",
    date: "2024-04-28",
    duration: "28 min",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
    category: "Security",
    speakers: ["Prof. Michael Chen", "Dr. Sarah Johnson"],
    description: "Discussing the latest developments in South China Sea territorial disputes."
  },
  
  // YouTube videos
  {
    id: "youtube-1",
    title: "ASEAN Summit 2024: Key Takeaways",
    type: "youtube",
    date: "2024-05-05",
    duration: "18:24",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
    category: "International Relations",
    speakers: ["Dr. James Wilson"],
    description: "Analysis of the recent ASEAN summit and its implications for regional cooperation."
  },
  {
    id: "youtube-2",
    title: "Climate Change Policies in Indonesia",
    type: "youtube",
    date: "2024-04-20",
    duration: "24:15",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    category: "Environment",
    speakers: ["Prof. Siti Nurhayati", "John Peterson"],
    description: "Examining Indonesia's approach to climate change and sustainability."
  },
  
  // News appearances
  {
    id: "news-1",
    title: "CSIS on CNN: Regional Security Analysis",
    type: "news",
    date: "2024-05-12",
    duration: "Interview",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
    category: "Security",
    speakers: ["Dr. Robert Chen"],
    description: "CSIS expert discusses regional security challenges on CNN International.",
    source: "CNN International"
  },
  {
    id: "news-2",
    title: "ASEAN Economic Integration: CSIS on Bloomberg",
    type: "news",
    date: "2024-05-01",
    duration: "Article",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    category: "Economics",
    speakers: ["Dr. Maria Santos"],
    description: "CSIS economist explains ASEAN economic integration prospects on Bloomberg.",
    source: "Bloomberg"
  }
];

const mediaTypes = ["All Media", "Podcasts", "YouTube", "News"];
const categories = [
  "All Categories",
  "Economics",
  "Security",
  "International Relations",
  "Technology",
  "Environment",
  "Foreign Policy",
];

export default function MediaPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeType, setActiveType] = useState("All Media");
  const [isMobile, setIsMobile] = useState(false);
  
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
    const typeMatch = activeFilter === "all" || item.type === activeFilter;
    const categoryMatch = activeCategory === "All Categories" || item.category === activeCategory;
    return typeMatch && categoryMatch;
  });

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
                {mediaTypes.map((type) => (
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
                {categories.map((category) => (
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
              {filteredItems.map((item) => (
                <Link
                  href={`/media/${item.type}/${item.id}`}
                  key={item.id}
                  className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute bottom-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      {item.type === "podcast" && <FiPlayCircle className="mr-1" />}
                      {item.type === "youtube" && <FiYoutube className="mr-1" />}
                      {item.type === "news" && <FiFileText className="mr-1" />}
                      {item.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-medium text-gray-500 mb-2 flex justify-between">
                      <span>{item.category}</span>
                      <span>{new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">{item.title}</h3>
                    <div className="text-xs text-gray-500">
                      <span>Featuring: </span>
                      {item.speakers.join(', ')}
                    </div>
                  </div>
                </Link>
              ))}
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