'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function FeedbackPopup() {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleClose = () => {
    setIsExpanded(false);
  };
  
  const handleSurveyClick = () => {
    // Open the CSIS survey link
    window.open('https://csis.or.id/O/webSurvey', '_blank');
    // Optionally close the popup after clicking survey
    // setIsExpanded(false);
  };
  
  return (
    <>
      {/* No longer need the minimized button */}
      
      {/* Expanded feedback popup - now centered */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 shadow-lg rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 relative">
              <button 
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Close notice"
              >
                <FiX className="w-4 h-4" />
              </button>
              
              <div className="pt-2">
                <h4 className="text-primary font-medium mb-2 pr-6">Development Notice</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  This website is currently in development and may contain dummy content.
                  We're working hard to improve it, and your feedback means a lot to us!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  🙏 If you don't mind, please take a moment to fill out our short survey.
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleClose}
                    className="text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Maybe later
                  </button>
                  <button
                    onClick={handleSurveyClick}
                    className="text-sm px-3 py-1.5 bg-accent text-white rounded-md hover:bg-accent/90"
                  >
                    Take Survey
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 