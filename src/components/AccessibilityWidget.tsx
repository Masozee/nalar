'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings } from 'react-icons/fi';
import { IoMdEye } from 'react-icons/io';
import { MdHearing } from 'react-icons/md';
import { FaHandPaper, FaBrain, FaFlask, FaUser } from 'react-icons/fa';

type AccessibilityFeature = {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle high contrast mode
  const toggleHighContrast = () => {
    document.documentElement.classList.toggle('high-contrast');
  };
  
  // Handle font size
  const increaseFontSize = () => {
    const html = document.documentElement;
    const currentSize = parseFloat(window.getComputedStyle(html).fontSize);
    html.style.fontSize = `${currentSize * 1.1}px`;
  };
  
  // Handle dyslexia-friendly font
  const toggleDyslexiaFont = () => {
    document.body.classList.toggle('dyslexia-friendly');
  };
  
  // Handle reduced motion
  const toggleReducedMotion = () => {
    document.documentElement.classList.toggle('reduced-motion');
  };
  
  const accessibilityFeatures: AccessibilityFeature[] = [
    {
      id: 'visual-contrast',
      name: 'High Contrast',
      icon: <IoMdEye className="w-5 h-5" />,
      action: toggleHighContrast
    },
    {
      id: 'visual-text',
      name: 'Larger Text',
      icon: <IoMdEye className="w-5 h-5" />,
      action: increaseFontSize
    },
    {
      id: 'hearing',
      name: 'Captions',
      icon: <MdHearing className="w-5 h-5" />,
      action: () => alert('Captions feature would be enabled in a full implementation')
    },
    {
      id: 'motor',
      name: 'Keyboard Nav',
      icon: <FaHandPaper className="w-5 h-5" />,
      action: () => alert('Keyboard navigation feature would be enabled in a full implementation')
    },
    {
      id: 'cognitive',
      name: 'Dyslexia Font',
      icon: <FaBrain className="w-5 h-5" />,
      action: toggleDyslexiaFont
    },
    {
      id: 'epilepsy',
      name: 'Reduce Motion',
      icon: <FaFlask className="w-5 h-5" />,
      action: toggleReducedMotion
    },
    {
      id: 'elderly',
      name: 'Larger UI',
      icon: <FaUser className="w-5 h-5" />,
      action: () => alert('Larger UI elements feature would be enabled in a full implementation')
    }
  ];

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-8 right-20 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[250px]"
          >
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Accessibility Options</h3>
            <div className="grid grid-cols-2 gap-2">
              {accessibilityFeatures.map(feature => (
                <button
                  key={feature.id}
                  onClick={feature.action}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
                >
                  <span className="mr-2">{feature.icon}</span>
                  {feature.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleMenu}
        className="bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent/90 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Accessibility options"
      >
        <FiSettings className="w-6 h-6" />
      </motion.button>
    </div>
  );
} 