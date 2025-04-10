'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [publicationsMenuOpen, setPublicationsMenuOpen] = useState(false);
  const [mediaMenuOpen, setMediaMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const publicationsRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (publicationsRef.current && !publicationsRef.current.contains(event.target as Node)) {
        setPublicationsMenuOpen(false);
      }
      if (mediaRef.current && !mediaRef.current.contains(event.target as Node)) {
        setMediaMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const togglePublicationsMenu = () => {
    if (mediaMenuOpen) setMediaMenuOpen(false);
    setPublicationsMenuOpen(!publicationsMenuOpen);
  };

  const toggleMediaMenu = () => {
    if (publicationsMenuOpen) setPublicationsMenuOpen(false);
    setMediaMenuOpen(!mediaMenuOpen);
  };

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'Scholars', href: '/scholars' },
    { name: 'Publications', href: '/publications', hasDropdown: true },
    { name: 'Media', href: '/media', hasDropdown: true },
    { name: 'Events', href: '/events' },
    { name: 'News', href: '/news' },
  ];

  const publicationCategories = [
    { name: 'Economics', href: '/publications/economics', count: 24 },
    { name: 'Politics', href: '/publications/politics', count: 18 },
    { name: 'International Relations', href: '/publications/international-relations', count: 32 },
    { name: 'Security', href: '/publications/security', count: 15 },
    { name: 'Governance', href: '/publications/governance', count: 12 },
    { name: 'Foreign Policy', href: '/publications/foreign-policy', count: 20 },
    { name: 'Energy', href: '/publications/energy', count: 10 },
    { name: 'Maritime Affairs', href: '/publications/maritime', count: 8 },
  ];

  const mediaCategories = [
    { name: 'Podcasts', href: '/media/podcasts', count: 42 },
    { name: 'YouTube', href: '/media/youtube', count: 76 },
    { name: 'CSIS on News', href: '/media/news', count: 54 },
  ];

  const handleNavClick = (name: string) => {
    setActiveItem(name);
    setIsOpen(false);
    
    if (name !== 'Publications') {
      setPublicationsMenuOpen(false);
    }
    
    if (name !== 'Media') {
      setMediaMenuOpen(false);
    }
  };

  // Add animation variants for menu items
  const menuItemVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  };

  const topNavItems = [
    { name: 'CSIS Journals', href: '/journals' },
    { name: 'Shop', href: '/shop' },
    { name: 'Careers', href: '/careers' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      {/* Top Navbar */}
      <div className="hidden lg:block border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12 items-center">
            {/* Logo on the left - bigger and without effects */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo-max.png" 
                  alt="CSIS Indonesia Logo" 
                  width={120} 
                  height={42}
                  className="py-2"
                  style={{ objectFit: 'contain', imageRendering: 'crisp-edges' }}
                  priority
                />
              </Link>
            </div>
            
            {/* Top right items: CSIS Journals, Shop, Careers */}
            <div className="flex items-center space-x-6 main-nav">
              {topNavItems.map((item) => (
                <motion.div key={item.name} whileHover="hover" variants={menuItemVariants}>
                  <Link 
                    href={item.href}
                    className="text-sm font-semibold text-gray-600 hover:text-accent transition-colors font-sans nav-link"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop navigation - Main menu on left */}
          <div className="hidden md:flex items-center space-x-8 main-nav">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <motion.button
                    whileHover="hover"
                    variants={menuItemVariants}
                    onClick={() => item.name === 'Publications' ? togglePublicationsMenu() : toggleMediaMenu()}
                    className={`text-base font-semibold transition-colors flex items-center font-sans nav-link ${
                      activeItem === item.name 
                        ? 'text-accent active' 
                        : 'text-primary hover:text-teal'
                    }`}
                  >
                    {item.name}
                    {(item.name === 'Publications' ? publicationsMenuOpen : mediaMenuOpen) ? (
                      <motion.svg
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 180] }}
                        transition={{ duration: 0.3 }}
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </motion.svg>
                    ) : (
                      <motion.svg
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 180] }}
                        transition={{ duration: 0.3 }}
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </motion.svg>
                    )}
                  </motion.button>
                ) : (
                  <motion.div whileHover="hover" variants={menuItemVariants}>
                    <Link 
                      href={item.href}
                      onClick={() => handleNavClick(item.name)}
                      className={`text-base font-semibold transition-colors font-sans nav-link ${
                        activeItem === item.name 
                          ? 'text-accent active' 
                          : 'text-primary hover:text-teal'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          
          {/* Search button on right */}
          <div className="hidden md:flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSearch}
              className="p-2 text-primary hover:text-accent transition-colors"
              aria-label="Search"
            >
              <FiSearch className="h-5 w-5" />
            </motion.button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo-max.png" 
                  alt="CSIS Indonesia Logo" 
                  width={100} 
                  height={35}
                  className="py-2"
                  style={{ objectFit: 'contain', imageRendering: 'crisp-edges' }}
                  priority
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSearch}
                className="p-2 text-primary hover:text-accent transition-colors"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMenu}
                className="p-2 text-primary hover:text-accent transition-colors"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Publications dropdown menu */}
      <AnimatePresence>
        {publicationsMenuOpen && (
          <motion.div
            ref={publicationsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-3">
                  <h3 className="text-lg font-bold text-primary mb-4 font-sans">Publication Categories</h3>
                  <div className="space-y-2">
                    {publicationCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex justify-between items-center py-2 text-gray-700 hover:text-accent transition-colors font-sans"
                        onClick={() => {
                          setPublicationsMenuOpen(false);
                          setActiveItem('Publications');
                        }}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{category.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-span-4">
                  <h3 className="text-lg font-bold text-primary mb-4 font-sans">Featured Publications</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-20 relative flex-shrink-0">
                        <Image 
                          src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
                          alt="Featured publication"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary hover:text-accent transition-colors font-sans">Indonesia&apos;s Economic Outlook 2024</h4>
                        <p className="text-sm text-gray-500 font-sans">Economics • May 10, 2024</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-16 w-20 relative flex-shrink-0">
                        <Image 
                          src="/bg/heather-green-bQTzJzwQfJE-unsplash.png"
                          alt="Featured publication"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary hover:text-accent transition-colors font-sans">ASEAN&apos;s Strategic Position in US-China Relations</h4>
                        <p className="text-sm text-gray-500 font-sans">International Relations • April 28, 2024</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/publications" 
                    className="inline-block mt-4 text-accent font-semibold hover:underline font-sans"
                  >
                    View all publications →
                  </Link>
                </div>
                <div className="col-span-5 bg-green-50 p-4 rounded">
                  <h3 className="text-lg font-bold text-primary mb-2">Latest Research Report</h3>
                  <div className="flex gap-4">
                    <div className="h-32 w-40 relative flex-shrink-0">
                      <Image 
                        src="/bg/muska-create-5MvNlQENWDM-unsplash.png"
                        alt="Latest research report"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">Maritime Security Challenges in Southeast Asia</h4>
                      <p className="text-sm text-gray-600 mb-2">A comprehensive analysis of current maritime security challenges in the region and potential solutions.</p>
                      <Link 
                        href="/publications/maritime-security-challenges" 
                        className="text-sm bg-accent text-white px-3 py-1 inline-block hover:bg-accent/90 transition-colors"
                      >
                        Read Research
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Media dropdown menu */}
      <AnimatePresence>
        {mediaMenuOpen && (
          <motion.div
            ref={mediaRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-3">
                  <h3 className="text-lg font-bold text-primary mb-4 font-sans">Media Categories</h3>
                  <div className="space-y-2">
                    {mediaCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex justify-between items-center py-2 text-gray-700 hover:text-accent transition-colors font-sans"
                        onClick={() => {
                          setMediaMenuOpen(false);
                          setActiveItem('Media');
                        }}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{category.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-span-4">
                  <h3 className="text-lg font-bold text-primary mb-4 font-sans">Latest Podcasts</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 relative flex-shrink-0">
                        <Image 
                          src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
                          alt="Latest podcast"
                          fill
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary hover:text-accent transition-colors font-sans">South China Sea Disputes</h4>
                        <p className="text-sm text-gray-500 font-sans">Security • 28 min</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-16 w-16 relative flex-shrink-0">
                        <Image 
                          src="/bg/heather-green-bQTzJzwQfJE-unsplash.png"
                          alt="Latest podcast"
                          fill
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary hover:text-accent transition-colors font-sans">Indonesia's Digital Economy</h4>
                        <p className="text-sm text-gray-500 font-sans">Economics • 32 min</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/media/podcasts" 
                    className="inline-block mt-4 text-accent font-semibold hover:underline font-sans"
                  >
                    View all podcasts →
                  </Link>
                </div>
                <div className="col-span-5 bg-blue-50 p-4 rounded">
                  <h3 className="text-lg font-bold text-primary mb-2">Latest Video</h3>
                  <div className="flex gap-4">
                    <div className="h-32 w-40 relative flex-shrink-0">
                      <Image 
                        src="/bg/muska-create-5MvNlQENWDM-unsplash.png"
                        alt="Latest video"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-accent/80 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">ASEAN Summit 2024: Key Takeaways</h4>
                      <p className="text-sm text-gray-600 mb-2">Analysis of the recent ASEAN summit and its implications for regional cooperation.</p>
                      <Link 
                        href="/media/youtube/asean-summit-2024" 
                        className="text-sm bg-accent text-white px-3 py-1 inline-block hover:bg-accent/90 transition-colors"
                      >
                        Watch Video
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-20"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const searchInput = e.currentTarget.querySelector('input');
                  const query = searchInput?.value.trim();
                  if (query) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                  toggleSearch();
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search for publications, events, experts..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none text-lg"
                  autoFocus
                />
                <div className="absolute right-4 top-4 flex items-center space-x-2">
                  <motion.button 
                    type="submit"
                    className="text-gray-500 hover:text-accent transition-colors"
                  >
                    <FiSearch className="h-6 w-6" />
                  </motion.button>
                  <motion.button 
                    type="button"
                    onClick={toggleSearch}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX className="h-5 w-5" />
                  </motion.button>
                </div>
              </form>
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <h3 className="text-sm font-semibold text-gray-500 mb-3 font-sans">POPULAR SEARCHES</h3>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="/search?q=Southeast%20Asia"
                    onClick={toggleSearch}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-sans"
                  >
                    Southeast Asia
                  </a>
                  <a 
                    href="/search?q=Indonesia%20Economy"
                    onClick={toggleSearch}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-sans"
                  >
                    Indonesia Economy
                  </a>
                  <a 
                    href="/search?q=US-China%20Relations"
                    onClick={toggleSearch}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-sans"
                  >
                    US-China Relations
                  </a>
                  <a 
                    href="/search?q=Maritime%20Security"
                    onClick={toggleSearch}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-sans"
                  >
                    Maritime Security
                  </a>
                  <a 
                    href="/search?q=Digital%20Economy"
                    onClick={toggleSearch}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-sans"
                  >
                    Digital Economy
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1 main-nav">
              {/* Main nav items in mobile */}
              {navItems.map((item) => (
                <div key={item.name} className="px-2 pt-2 pb-3 space-y-1">
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => item.name === 'Publications' ? togglePublicationsMenu() : toggleMediaMenu()}
                        className="flex justify-between items-center w-full text-left px-3 py-2 rounded-md text-base font-semibold text-primary hover:text-accent hover:bg-gray-50 font-sans"
                      >
                        {item.name}
                        {(item.name === 'Publications' ? publicationsMenuOpen : mediaMenuOpen) ? (
                          <motion.svg
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 180] }}
                            transition={{ duration: 0.3 }}
                            className="ml-1 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </motion.svg>
                        ) : (
                          <motion.svg
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 180] }}
                            transition={{ duration: 0.3 }}
                            className="ml-1 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </motion.svg>
                        )}
                      </button>
                      
                      {/* Rest of dropdown content */}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => handleNavClick(item.name)}
                      className={`block py-3 text-base font-semibold nav-link ${
                        activeItem === item.name ? 'text-accent' : 'text-gray-900 hover:text-accent'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar; 