'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiRefreshCw, FiX, FiMinus, FiPlus, FiEyeOff, FiLink, FiMessageSquare } from 'react-icons/fi';
import { IoMdEye } from 'react-icons/io';
import { MdHearing, MdTextFields, MdFilter, MdMouse } from 'react-icons/md';
import { FaHandPaper, FaBrain, FaFlask, FaUser } from 'react-icons/fa';

type AccessibilityFeature = {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  isActive: () => boolean;
  description?: string;
  group?: 'visual' | 'reading' | 'motion' | 'interface';
};

type AccessibilitySettings = {
  'high-contrast'?: boolean;
  'text-size'?: string;
  'dyslexia-font'?: boolean;
  'reduced-motion'?: boolean;
  'monochrome'?: boolean;
  'cursor-size'?: string;
  'hide-images'?: boolean;
  'highlight-links'?: boolean;
  'bold-text'?: boolean;
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState<AccessibilitySettings>({});
  const [textSizeLevel, setTextSizeLevel] = useState(0); // 0: normal, 1: larger, 2: larger-2x, 3: larger-3x
  const [cursorSizeLevel, setCursorSizeLevel] = useState(0); // 0: normal, 1: large, 2: x-large
  
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
      
      if (settings['text-size']) {
        document.documentElement.classList.add(settings['text-size']);
        // Set initial text size level
        if (settings['text-size'] === 'larger-text') setTextSizeLevel(1);
        else if (settings['text-size'] === 'larger-text-2x') setTextSizeLevel(2);
        else if (settings['text-size'] === 'larger-text-3x') setTextSizeLevel(3);
      }
      
      if (settings['dyslexia-font']) {
        document.body.classList.add('dyslexia-friendly');
      }
      
      if (settings['reduced-motion']) {
        document.documentElement.classList.add('reduced-motion');
      }
      
      if (settings['monochrome']) {
        document.documentElement.classList.add('monochrome');
      }
      
      if (settings['cursor-size']) {
        document.documentElement.classList.add(settings['cursor-size']);
        // Set initial cursor size level
        if (settings['cursor-size'] === 'cursor-large') setCursorSizeLevel(1);
        else if (settings['cursor-size'] === 'cursor-x-large') setCursorSizeLevel(2);
      }
      
      if (settings['hide-images']) {
        document.documentElement.classList.add('hide-images');
      }
      
      if (settings['highlight-links']) {
        document.documentElement.classList.add('highlight-links');
      }
      
      if (settings['bold-text']) {
        document.documentElement.classList.add('bold-text');
      }
    }
  }, []);
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Save settings to localStorage
  const saveSettings = (settingsUpdate: Partial<AccessibilitySettings>) => {
    const newSettings = { ...activeFeatures, ...settingsUpdate };
    setActiveFeatures(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };
  
  // Handle font size increase
  const increaseFontSize = () => {
    if (textSizeLevel >= 3) return; // Max level reached
    
    // Remove existing text size classes
    document.documentElement.classList.remove('larger-text', 'larger-text-2x', 'larger-text-3x');
    
    // Increment level
    const newLevel = textSizeLevel + 1;
    setTextSizeLevel(newLevel);
    
    // Apply new text size class based on level
    let newSizeClass = '';
    if (newLevel === 1) newSizeClass = 'larger-text';
    else if (newLevel === 2) newSizeClass = 'larger-text-2x';
    else if (newLevel === 3) newSizeClass = 'larger-text-3x';
    
    // Apply class and save setting
    if (newSizeClass) {
      document.documentElement.classList.add(newSizeClass);
      saveSettings({ 'text-size': newSizeClass });
    }
  };
  
  // Handle font size decrease
  const decreaseFontSize = () => {
    if (textSizeLevel <= 0) return; // Min level reached
    
    // Remove existing text size classes
    document.documentElement.classList.remove('larger-text', 'larger-text-2x', 'larger-text-3x');
    
    // Decrement level
    const newLevel = textSizeLevel - 1;
    setTextSizeLevel(newLevel);
    
    // Apply new text size class based on level
    let newSizeClass = '';
    if (newLevel === 1) newSizeClass = 'larger-text';
    else if (newLevel === 2) newSizeClass = 'larger-text-2x';
    else if (newLevel === 3) newSizeClass = 'larger-text-3x';
    
    // Apply class and save setting
    if (newSizeClass) {
      document.documentElement.classList.add(newSizeClass);
      saveSettings({ 'text-size': newSizeClass });
    } else {
      saveSettings({ 'text-size': undefined });
    }
  };
  
  // Handle cursor size increase
  const increaseCursorSize = () => {
    if (cursorSizeLevel >= 2) return; // Max level reached
    
    // Remove existing cursor size classes
    document.documentElement.classList.remove('cursor-large', 'cursor-x-large');
    
    // Increment level
    const newLevel = cursorSizeLevel + 1;
    setCursorSizeLevel(newLevel);
    
    // Apply new cursor size class based on level
    let newSizeClass = '';
    if (newLevel === 1) newSizeClass = 'cursor-large';
    else if (newLevel === 2) newSizeClass = 'cursor-x-large';
    
    // Apply class and save setting
    if (newSizeClass) {
      document.documentElement.classList.add(newSizeClass);
      saveSettings({ 'cursor-size': newSizeClass });
    }
  };
  
  // Handle cursor size decrease
  const decreaseCursorSize = () => {
    if (cursorSizeLevel <= 0) return; // Min level reached
    
    // Remove existing cursor size classes
    document.documentElement.classList.remove('cursor-large', 'cursor-x-large');
    
    // Decrement level
    const newLevel = cursorSizeLevel - 1;
    setCursorSizeLevel(newLevel);
    
    // Apply new cursor size class based on level
    let newSizeClass = '';
    if (newLevel === 1) newSizeClass = 'cursor-large';
    else if (newLevel === 2) newSizeClass = 'cursor-x-large';
    
    // Apply class and save setting
    if (newSizeClass) {
      document.documentElement.classList.add(newSizeClass);
      saveSettings({ 'cursor-size': newSizeClass });
    } else {
      saveSettings({ 'cursor-size': undefined });
    }
  };
  
  // Reset all accessibility settings
  const resetAllSettings = () => {
    // Remove all accessibility classes
    document.documentElement.classList.remove(
      'high-contrast', 
      'reduced-motion', 
      'larger-text', 
      'larger-text-2x', 
      'larger-text-3x',
      'monochrome',
      'cursor-large',
      'cursor-x-large',
      'hide-images',
      'highlight-links',
      'bold-text'
    );
    document.body.classList.remove('dyslexia-friendly');
    
    // Reset levels
    setTextSizeLevel(0);
    setCursorSizeLevel(0);
    
    // Clear localStorage
    localStorage.removeItem('accessibility-settings');
    
    // Reset state
    setActiveFeatures({});
  };
  
  // Toggle functions
  const toggleHighContrast = () => {
    const isActive = document.documentElement.classList.toggle('high-contrast');
    saveSettings({ 'high-contrast': isActive });
  };
  
  const toggleDyslexiaFont = () => {
    const isActive = document.body.classList.toggle('dyslexia-friendly');
    saveSettings({ 'dyslexia-font': isActive });
  };
  
  const toggleReducedMotion = () => {
    const isActive = document.documentElement.classList.toggle('reduced-motion');
    saveSettings({ 'reduced-motion': isActive });
  };
  
  const toggleMonochrome = () => {
    const isActive = document.documentElement.classList.toggle('monochrome');
    saveSettings({ 'monochrome': isActive });
  };
  
  const toggleHideImages = () => {
    const isActive = document.documentElement.classList.toggle('hide-images');
    saveSettings({ 'hide-images': isActive });
  };
  
  const toggleHighlightLinks = () => {
    const isActive = document.documentElement.classList.toggle('highlight-links');
    saveSettings({ 'highlight-links': isActive });
  };
  
  const toggleBoldText = () => {
    const isActive = document.documentElement.classList.toggle('bold-text');
    saveSettings({ 'bold-text': isActive });
  };
  
  const accessibilityFeatures: AccessibilityFeature[] = [
    // Visual Features
    {
      id: 'visual-contrast',
      name: 'High Contrast',
      icon: <IoMdEye className="w-5 h-5" />,
      action: toggleHighContrast,
      isActive: () => document.documentElement.classList.contains('high-contrast'),
      description: 'Enhances visibility with strong color contrasts',
      group: 'visual'
    },
    {
      id: 'monochrome',
      name: 'Monochrome',
      icon: <MdFilter className="w-5 h-5" />,
      action: toggleMonochrome,
      isActive: () => document.documentElement.classList.contains('monochrome'),
      description: 'Displays content in black and white',
      group: 'visual'
    },
    {
      id: 'hide-images',
      name: 'Hide Images',
      icon: <FiEyeOff className="w-5 h-5" />,
      action: toggleHideImages,
      isActive: () => document.documentElement.classList.contains('hide-images'),
      description: 'For text-only experience',
      group: 'visual'
    },
    {
      id: 'highlight-links',
      name: 'Highlight Links',
      icon: <FiLink className="w-5 h-5" />,
      action: toggleHighlightLinks,
      isActive: () => document.documentElement.classList.contains('highlight-links'),
      description: 'Makes all hyperlinks more visible',
      group: 'reading'
    },
    {
      id: 'bold-text',
      name: 'Bold Text',
      icon: <MdTextFields className="w-5 h-5" />,
      action: toggleBoldText,
      isActive: () => document.documentElement.classList.contains('bold-text'),
      description: 'Makes all text bold for better readability',
      group: 'reading'
    },
    
    // Reading Features
    {
      id: 'cognitive',
      name: 'Dyslexia Font',
      icon: <FaBrain className="w-5 h-5" />,
      action: toggleDyslexiaFont,
      isActive: () => document.body.classList.contains('dyslexia-friendly'),
      description: 'Uses a more readable font for dyslexic users',
      group: 'reading'
    },
    
    // Motion Features
    {
      id: 'epilepsy',
      name: 'Reduce Motion',
      icon: <FaFlask className="w-5 h-5" />,
      action: toggleReducedMotion,
      isActive: () => document.documentElement.classList.contains('reduced-motion'),
      description: 'Minimizes animations and transitions',
      group: 'motion'
    },
    
    // Interface Features (placeholders)
    {
      id: 'hearing',
      name: 'Captions',
      icon: <MdHearing className="w-5 h-5" />,
      action: () => alert('Captions feature would be enabled in a full implementation'),
      isActive: () => false,
      description: 'Enables captions for audio content',
      group: 'interface'
    },
    {
      id: 'keyboard',
      name: 'Keyboard Nav',
      icon: <FaHandPaper className="w-5 h-5" />,
      action: () => alert('Keyboard navigation feature would be enabled in a full implementation'),
      isActive: () => false,
      description: 'Enhances keyboard navigation',
      group: 'interface'
    },
    {
      id: 'larger-ui',
      name: 'Larger UI',
      icon: <FaUser className="w-5 h-5" />,
      action: () => alert('Larger UI elements feature would be enabled in a full implementation'),
      isActive: () => false,
      description: 'Makes UI elements larger and easier to interact with',
      group: 'interface'
    }
  ];

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  // Toggle switch component
  const ToggleSwitch = ({ isOn, onToggle, disabled = false }: { isOn: boolean, onToggle: () => void, disabled?: boolean }) => (
    <div 
      onClick={disabled ? undefined : onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
        isOn ? 'bg-accent' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  );

  return (
    <>
      {/* Fixed floating buttons in the right side of the screen */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4">
        {/* Accessibility button with hover animation */}
        <div className="relative flex justify-end w-14 h-14">
          <motion.button
            onClick={toggleMenu}
            className="group bg-accent text-white p-3 rounded-l-lg shadow-lg hover:bg-accent/90 transition-colors flex items-center justify-center h-14 w-14 absolute right-0"
            whileHover={{ 
              width: 170,
              transition: { duration: 0.3 }
            }}
            initial={{ width: 56 }}
            aria-label="Accessibility options"
          >
            <div className="flex items-center absolute left-4">
              <Image 
                src="/accessibility-icon.svg" 
                alt="Accessibility" 
                width={24} 
                height={24}
                className="w-6 h-6 text-white"
              />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 absolute left-14 font-medium text-white">
              Aksesibilitas
            </span>
            <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Configure accessibility settings
            </span>
          </motion.button>
        </div>
        
        {/* Feedback button with hover animation */}
        <div className="relative flex justify-end w-14 h-14">
          <motion.button
            onClick={() => {
              const event = new CustomEvent('openFeedbackPopup');
              document.dispatchEvent(event);
            }}
            className="group bg-accent text-white p-3 rounded-l-lg shadow-lg hover:bg-accent/90 transition-colors flex items-center justify-center h-14 w-14 absolute right-0"
            whileHover={{ 
              width: 170,
              transition: { duration: 0.3 }
            }}
            initial={{ width: 56 }}
            aria-label="Provide feedback"
          >
            <div className="flex items-center absolute left-4">
              <FiMessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 absolute left-14 font-medium text-white">
              Feedback
            </span>
            <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Share your feedback with us
            </span>
          </motion.button>
        </div>
      </div>

      {/* Full-screen drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Right side drawer - now wider for two columns */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 right-0 bottom-0 w-[40rem] bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto accessibility-drawer border-l border-gray-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-primary">Accessibility Options</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetAllSettings}
                    className="text-sm p-2 text-red-600 hover:bg-red-100 rounded-md flex items-center gap-1"
                    title="Reset all accessibility settings"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    <span>Reset All</span>
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-sm p-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center"
                    title="Close accessibility panel"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Size Controls Section - Full Width */}
              <div className="mb-6 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="text-primary font-medium mb-4 border-b border-gray-100 pb-2">Size Adjustments</h4>
                
                {/* Text Size Control */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="mr-3 text-lg text-primary"><MdTextFields className="w-5 h-5" /></span>
                      <span className="font-medium text-gray-800">Text Size</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={decreaseFontSize}
                        disabled={textSizeLevel === 0}
                        className={`p-2 rounded-md ${textSizeLevel === 0 ? 'text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        aria-label="Decrease text size"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <div className="w-8 text-center font-medium">{textSizeLevel}</div>
                      <button 
                        onClick={increaseFontSize}
                        disabled={textSizeLevel === 3}
                        className={`p-2 rounded-md ${textSizeLevel === 3 ? 'text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        aria-label="Increase text size"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 ml-8 mt-1 mb-0">
                    Increases text size for better readability
                  </p>
                </div>
                
                {/* Cursor Size Control */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="mr-3 text-lg text-primary"><MdMouse className="w-5 h-5" /></span>
                      <span className="font-medium text-gray-800">Cursor Size</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={decreaseCursorSize}
                        disabled={cursorSizeLevel === 0}
                        className={`p-2 rounded-md ${cursorSizeLevel === 0 ? 'text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        aria-label="Decrease cursor size"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <div className="w-8 text-center font-medium">{cursorSizeLevel}</div>
                      <button 
                        onClick={increaseCursorSize}
                        disabled={cursorSizeLevel === 2}
                        className={`p-2 rounded-md ${cursorSizeLevel === 2 ? 'text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        aria-label="Increase cursor size"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 ml-8 mt-1 mb-0">
                    Makes cursor larger and more visible
                  </p>
                </div>
              </div>
              
              {/* Feature Categories in Equal Height Columns */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Visual & Motion */}
                <div className="flex flex-col space-y-6">
                  {/* Visual Features */}
                  <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-primary font-medium mb-4 border-b border-gray-100 pb-2">Visual Settings</h4>
                    <div className="space-y-4 flex-grow">
                      {accessibilityFeatures
                        .filter(feature => feature.group === 'visual')
                        .map((feature, index, array) => (
                        <div 
                          key={feature.id}
                          className={`w-full ${index !== array.length - 1 ? 'border-b border-gray-100 pb-4 mb-4' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span className="mr-3 text-lg text-primary">{feature.icon}</span>
                              <span className="font-medium text-gray-800 group relative">
                                {feature.name}
                                <span className="absolute left-0 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                                  {feature.description}
                                </span>
                              </span>
                            </div>
                            <ToggleSwitch 
                              isOn={feature.isActive()} 
                              onToggle={feature.action}
                              disabled={feature.group === 'interface'}
                            />
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-500 ml-8 mt-1 mb-0">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Motion Features */}
                  <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-primary font-medium mb-4 border-b border-gray-100 pb-2">Motion Settings</h4>
                    <div className="space-y-4 flex-grow">
                      {accessibilityFeatures
                        .filter(feature => feature.group === 'motion')
                        .map((feature, index, array) => (
                        <div 
                          key={feature.id}
                          className={`w-full ${index !== array.length - 1 ? 'border-b border-gray-100 pb-4 mb-4' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span className="mr-3 text-lg text-primary">{feature.icon}</span>
                              <span className="font-medium text-gray-800 group relative">
                                {feature.name}
                                <span className="absolute left-0 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                                  {feature.description}
                                </span>
                              </span>
                            </div>
                            <ToggleSwitch 
                              isOn={feature.isActive()} 
                              onToggle={feature.action}
                              disabled={feature.group === 'interface'}
                            />
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-500 ml-8 mt-1 mb-0">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Reading & Interface */}
                <div className="flex flex-col space-y-6">
                  {/* Reading Features */}
                  <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-primary font-medium mb-4 border-b border-gray-100 pb-2">Reading Settings</h4>
                    <div className="space-y-4 flex-grow">
                      {accessibilityFeatures
                        .filter(feature => feature.group === 'reading')
                        .map((feature, index, array) => (
                        <div 
                          key={feature.id}
                          className={`w-full ${index !== array.length - 1 ? 'border-b border-gray-100 pb-4 mb-4' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span className="mr-3 text-lg text-primary">{feature.icon}</span>
                              <span className="font-medium text-gray-800 group relative">
                                {feature.name}
                                <span className="absolute left-0 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                                  {feature.description}
                                </span>
                              </span>
                            </div>
                            <ToggleSwitch 
                              isOn={feature.isActive()} 
                              onToggle={feature.action}
                              disabled={feature.group === 'interface'}
                            />
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-500 ml-8 mt-1 mb-0">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interface Features */}
                  <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-primary font-medium mb-4 border-b border-gray-100 pb-2">Interface (Coming Soon)</h4>
                    <div className="space-y-4 flex-grow">
                      {accessibilityFeatures
                        .filter(feature => feature.group === 'interface')
                        .map((feature, index, array) => (
                        <div 
                          key={feature.id}
                          className={`w-full ${index !== array.length - 1 ? 'border-b border-gray-100 pb-4 mb-4' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span className="mr-3 text-lg text-primary">{feature.icon}</span>
                              <span className="font-medium text-gray-800 group relative">
                                {feature.name}
                                <span className="absolute left-0 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 w-auto">
                                  {feature.description}
                                </span>
                              </span>
                            </div>
                            <ToggleSwitch 
                              isOn={feature.isActive()} 
                              onToggle={feature.action}
                              disabled={true}
                            />
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-500 ml-8 mt-1 mb-0">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 