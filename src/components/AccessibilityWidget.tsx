'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiRefreshCw } from 'react-icons/fi';
import { IoMdEye } from 'react-icons/io';
import { MdHearing } from 'react-icons/md';
import { FaHandPaper, FaBrain, FaFlask, FaUser } from 'react-icons/fa';

type AccessibilityFeature = {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  isActive: () => boolean;
};

type AccessibilitySettings = {
  'high-contrast'?: boolean;
  'font-size'?: string;
  'dyslexia-font'?: boolean;
  'reduced-motion'?: boolean;
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState<AccessibilitySettings>({});
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings) as AccessibilitySettings;
      setActiveFeatures(settings);
      
      // Apply saved settings
      if (settings['high-contrast']) {
        document.documentElement.classList.add('high-contrast');
      }
      
      if (settings['font-size']) {
        document.documentElement.style.fontSize = settings['font-size'];
      }
      
      if (settings['dyslexia-font']) {
        document.body.classList.add('dyslexia-friendly');
      }
      
      if (settings['reduced-motion']) {
        document.documentElement.classList.add('reduced-motion');
      }
    }
  }, []);
  
  // Save settings to localStorage
  const saveSettings = (settingsUpdate: Partial<AccessibilitySettings>) => {
    const newSettings = { ...activeFeatures, ...settingsUpdate };
    setActiveFeatures(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };
  
  // Reset all accessibility settings
  const resetAllSettings = () => {
    // Remove all accessibility classes
    document.documentElement.classList.remove('high-contrast');
    document.documentElement.classList.remove('reduced-motion');
    document.body.classList.remove('dyslexia-friendly');
    
    // Reset font size
    document.documentElement.style.fontSize = '';
    
    // Clear localStorage
    localStorage.removeItem('accessibility-settings');
    
    // Reset state
    setActiveFeatures({});
  };
  
  // Handle high contrast mode
  const toggleHighContrast = () => {
    const isActive = document.documentElement.classList.toggle('high-contrast');
    saveSettings({ 'high-contrast': isActive });
  };
  
  // Handle font size
  const increaseFontSize = () => {
    const html = document.documentElement;
    const currentSize = parseFloat(window.getComputedStyle(html).fontSize);
    const newSize = `${currentSize * 1.1}px`;
    html.style.fontSize = newSize;
    saveSettings({ 'font-size': newSize });
  };
  
  // Handle dyslexia-friendly font
  const toggleDyslexiaFont = () => {
    const isActive = document.body.classList.toggle('dyslexia-friendly');
    saveSettings({ 'dyslexia-font': isActive });
  };
  
  // Handle reduced motion
  const toggleReducedMotion = () => {
    const isActive = document.documentElement.classList.toggle('reduced-motion');
    saveSettings({ 'reduced-motion': isActive });
  };
  
  const accessibilityFeatures: AccessibilityFeature[] = [
    {
      id: 'visual-contrast',
      name: 'High Contrast',
      icon: <IoMdEye className="w-5 h-5" />,
      action: toggleHighContrast,
      isActive: () => document.documentElement.classList.contains('high-contrast')
    },
    {
      id: 'visual-text',
      name: 'Larger Text',
      icon: <IoMdEye className="w-5 h-5" />,
      action: increaseFontSize,
      isActive: () => !!activeFeatures['font-size']
    },
    {
      id: 'hearing',
      name: 'Captions',
      icon: <MdHearing className="w-5 h-5" />,
      action: () => alert('Captions feature would be enabled in a full implementation'),
      isActive: () => false
    },
    {
      id: 'motor',
      name: 'Keyboard Nav',
      icon: <FaHandPaper className="w-5 h-5" />,
      action: () => alert('Keyboard navigation feature would be enabled in a full implementation'),
      isActive: () => false
    },
    {
      id: 'cognitive',
      name: 'Dyslexia Font',
      icon: <FaBrain className="w-5 h-5" />,
      action: toggleDyslexiaFont,
      isActive: () => document.body.classList.contains('dyslexia-friendly')
    },
    {
      id: 'epilepsy',
      name: 'Reduce Motion',
      icon: <FaFlask className="w-5 h-5" />,
      action: toggleReducedMotion,
      isActive: () => document.documentElement.classList.contains('reduced-motion')
    },
    {
      id: 'elderly',
      name: 'Larger UI',
      icon: <FaUser className="w-5 h-5" />,
      action: () => alert('Larger UI elements feature would be enabled in a full implementation'),
      isActive: () => false
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
            className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-[320px]"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 dark:text-white">Accessibility Options</h3>
              <button 
                onClick={resetAllSettings}
                className="text-sm px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md flex items-center"
                title="Reset all accessibility settings"
              >
                <FiRefreshCw className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {accessibilityFeatures.map(feature => (
                <button
                  key={feature.id}
                  onClick={feature.action}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                    feature.isActive() 
                      ? 'bg-accent text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
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