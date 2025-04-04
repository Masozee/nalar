'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiHelpCircle } from 'react-icons/fi';

export default function StickyFeedback() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };
  
  const handleSurveyClick = () => {
    window.open('https://example.com/feedback-survey', '_blank');
  };
  
  return (
    <div className="fixed bottom-0 left-0 z-40 w-full pointer-events-none">
      <div className="container mx-auto px-4 pointer-events-none">
        <div className="relative pointer-events-auto">
          {/* Sticky feedback bar */}
          <motion.div 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-t-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ height: 56 }}
            animate={{ height: isExpanded ? 'auto' : 56 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header bar - always visible */}
            <div 
              className="h-14 px-4 flex items-center justify-between cursor-pointer bg-accent/5"
              onClick={handleToggle}
            >
              <div className="flex items-center space-x-2">
                <FiHelpCircle className="text-accent w-5 h-5" />
                <div className="font-medium text-primary group relative">
                  Accessibility & Feedback
                  <span className="absolute left-0 -top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                    Access accessibility options or provide feedback
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = "#accessibility";
                  }}
                  className="text-xs px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  aria-label="Open accessibility options"
                >
                  <span className="group relative">
                    Accessibility
                    <span className="absolute left-0 -top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                      Configure accessibility settings
                    </span>
                  </span>
                </button>
                <motion.button
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-gray-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={isExpanded ? "Collapse feedback panel" : "Expand feedback panel"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </motion.button>
              </div>
            </div>
            
            {/* Expandable content */}
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-0">
                    This website is currently in development and may contain dummy content.
                    We're working hard to improve it, and your feedback means a lot to us!
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleSurveyClick}
                    className="text-sm px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                  >
                    <span className="group relative">
                      Take Survey
                      <span className="absolute right-0 -top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                        Share your feedback with us
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 