'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMessageSquare } from 'react-icons/fi';

export default function FeedbackPopup() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  
  useEffect(() => {
    // Show popup after 3 seconds if it hasn't been shown before
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
        setHasBeenShown(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasBeenShown]);
  
  useEffect(() => {
    // Listen for the custom event from AccessibilityWidget
    const handleOpenFeedback = () => {
      setIsExpanded(true);
    };
    
    document.addEventListener('openFeedbackPopup', handleOpenFeedback);
    
    return () => {
      document.removeEventListener('openFeedbackPopup', handleOpenFeedback);
    };
  }, []);
  
  const handleClose = () => {
    setIsExpanded(false);
  };
  
  const handleOpenPopup = () => {
    setIsExpanded(true);
  };
  
  const handleSurveyClick = () => {
    // In a real implementation, this would link to the survey
    window.open('https://example.com/feedback-survey', '_blank');
    // We don't close the popup here, so user can access it again if needed
  };
  
  return (
    <>
      {/* No longer need the minimized button since we'll call from AccessibilityWidget */}
      
      {/* Expanded feedback popup - now on the right side */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 bottom-24 z-40 w-72 shadow-lg rounded-l-lg bg-white dark:bg-gray-800 border-t border-l border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 relative">
              <button 
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Minimize feedback popup"
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