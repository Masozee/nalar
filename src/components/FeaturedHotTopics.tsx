'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import FadeIn from './animations/FadeIn';

const hotTopics = [
  {
    id: 1,
    title: "Implications of Trump's Foreign Policy on Southeast Asia",
    author: "Dr. Sarah Johnson",
    category: "International Relations",
    date: "June 2, 2024"
  },
  {
    id: 2,
    title: "ASEAN-US Free Trade Agreement: Opportunities and Challenges",
    author: "Prof. Michael Wong",
    category: "Economics",
    date: "May 28, 2024"
  },
  {
    id: 3,
    title: "Global Supply Chain Restructuring: Impact on Indonesian Economy",
    author: "Dr. Budi Santoso",
    category: "Trade",
    date: "May 25, 2024"
  },
  {
    id: 4,
    title: "US-China Tensions: Strategic Options for ASEAN",
    author: "Dr. Ahmad Faisal",
    category: "Geopolitics",
    date: "May 20, 2024"
  },
  {
    id: 5,
    title: "Climate Change Initiatives in Southeast Asia: A Regional Approach",
    author: "Dr. Emily Nakamura",
    category: "Environment",
    date: "May 15, 2024"
  },
  {
    id: 6,
    title: "Digital Trade Regulations: ASEAN's Policy Framework",
    author: "Prof. David Lee",
    category: "Digital Economy",
    date: "May 10, 2024"
  }
];

export default function FeaturedHotTopics() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(3); // Default to desktop value
  const totalSlides = Math.ceil(hotTopics.length / itemsPerSlide);

  // Handle window resize and initial setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setItemsPerSlide(window.innerWidth >= 768 ? 3 : 1);
      };
      
      // Set initial value
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePrev = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  };

  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = 100 / totalSlides;
      sliderRef.current.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
    }
  }, [currentSlide, itemsPerSlide, totalSlides]);

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-baseline mb-8">
            <h2 className="text-3xl font-bold text-primary">Featured Hot Topics</h2>
            <div className="ml-auto flex items-center space-x-3">
              <Link 
                href="/publications/hot-topics" 
                className="text-teal hover:text-accent flex items-center text-sm font-medium"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
        </FadeIn>
        
        <FadeIn>
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                ref={sliderRef} 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ width: `${totalSlides * 100}%` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div 
                    key={slideIndex} 
                    className="flex"
                    style={{ width: `${100 / totalSlides}%` }}
                  >
                    {hotTopics
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((topic) => (
                        <div 
                          key={topic.id} 
                          className="px-3"
                          style={{ width: `${100 / itemsPerSlide}%` }}
                        >
                          <div className="bg-white p-5 border-t-4 border-accent shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                            <span className="text-xs font-semibold text-accent px-2 py-1 bg-accent/10 rounded mb-2 inline-block">
                              {topic.category}
                            </span>
                            <h3 className="font-bold text-primary text-lg md:text-xl mb-1 flex-grow">
                              <Link href={`/publications/hot-topics/${topic.id}`} className="hover:text-accent transition-colors">
                                {topic.title}
                              </Link>
                            </h3>
                            <div className="mt-4">
                              <p className="text-gray-600 text-sm mb-3">
                                By <span className="font-semibold">{topic.author}</span> • {topic.date}
                              </p>
                              <Link 
                                href={`/publications/hot-topics/${topic.id}`}
                                className="text-teal hover:text-accent text-sm font-medium flex items-center"
                              >
                                Read More <FiArrowRight className="ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <button 
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`absolute top-1/2 left-0 -ml-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 ${
                currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              aria-label="Previous slide"
            >
              <FiChevronLeft className="w-5 h-5 text-primary" />
            </button>
            
            <button 
              onClick={handleNext}
              disabled={currentSlide >= totalSlides - 1}
              className={`absolute top-1/2 right-0 -mr-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 ${
                currentSlide >= totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              aria-label="Next slide"
            >
              <FiChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-4 bg-accent' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
} 