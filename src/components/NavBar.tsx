'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNavbarConfig, NavbarConfig } from '@/services/navbarService';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [publicationsMenuOpen, setPublicationsMenuOpen] = useState(false);
  const [mediaMenuOpen, setMediaMenuOpen] = useState(false);
  const [navbarData, setNavbarData] = useState<NavbarConfig>({
    publications: {
      categories: [],
      featured_publications: [],
      latest_research: null
    },
    media: {
      categories: [],
      latest_podcasts: [],
      latest_video: null
    }
  });
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
  
  // Fetch navbar data from API
  useEffect(() => {
    const loadNavbarData = async () => {
      try {
        const data = await fetchNavbarConfig();
        if (data) {
          setNavbarData(data);
        }
      } catch (error) {
        console.error('Error loading navbar data:', error);
      }
    };
    
    loadNavbarData();
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

  // Handle hover for dropdown menus
  const handlePublicationsHover = () => {
    if (mediaMenuOpen) setMediaMenuOpen(false);
    setPublicationsMenuOpen(true);
  };

  const handleMediaHover = () => {
    if (publicationsMenuOpen) setPublicationsMenuOpen(false);
    setMediaMenuOpen(true);
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

  // Use data from the API instead of static arrays
  const publicationCategories = navbarData.publications.categories;
  const mediaCategories = navbarData.media.categories;

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

  // Remove zoom effect on hover
  const menuItemVariants = {
    hover: {
      // No scale effect
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
    <>
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
                      onMouseEnter={() => item.name === 'Publications' ? handlePublicationsHover() : handleMediaHover()}
                      onClick={() => item.name === 'Publications' ? togglePublicationsMenu() : toggleMediaMenu()}
                      className={`text-base font-semibold transition-colors flex items-center font-sans nav-link ${
                        activeItem === item.name 
                          ? 'text-accent' 
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
                            ? 'text-accent' 
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
                  {/* Publication Categories - Left Column */}
                  <div className="col-span-3">
                    <h3 className="text-lg font-bold text-primary mb-4 font-sans border-b border-gray-200 pb-2">Categories</h3>
                    <div className="space-y-1">
                      {publicationCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="flex justify-between items-center py-2 text-gray-700 hover:text-accent hover:bg-gray-50 px-2 rounded transition-all duration-200 font-sans"
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
                  
                  {/* Featured Publications - Middle Column */}
                  <div className="col-span-4">
                    <h3 className="text-lg font-bold text-primary mb-4 font-sans border-b border-gray-200 pb-2">Featured Publications</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {navbarData.publications.featured_publications.slice(0, 2).map((publication, index) => (
                        <Link 
                          href={`/publications/${publication.slug}`}
                          key={publication.id || index} 
                          className="group block py-2"
                        >
                          <div className="text-xs font-medium text-accent mb-1">
                            {publication.category?.name || 'Publication'} • {new Date(publication.date_publish).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div>
                            <h4 className="font-bold text-primary font-sans">
                              {publication.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/publications" 
                      className="inline-flex items-center mt-4 text-accent font-medium hover:underline group"
                    >
                      <span>View all publications</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                  
                  {/* Latest Research Report - Right Column */}
                  <div className="col-span-5">
                    <h3 className="text-lg font-bold text-primary mb-4 font-sans border-b border-gray-200 pb-2">Latest Research</h3>
                    {navbarData.publications.latest_research ? (
                      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg overflow-hidden">
                        <div className="relative">
                          <div className="aspect-[16/9] relative">
                            <Image 
                              src={navbarData.publications.latest_research.image || "/bg/muska-create-5MvNlQENWDM-unsplash.png"}
                              alt={navbarData.publications.latest_research.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute top-0 left-0 bg-accent text-white text-xs font-medium py-1 px-3">
                            NEW
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-xs font-medium text-accent">{navbarData.publications.latest_research.category?.name || 'Research'}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{new Date(navbarData.publications.latest_research.date_publish).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <Link 
                            href={`/publications/${navbarData.publications.latest_research.slug}`}
                          >
                            <div>
                              <h4 className="font-bold text-primary text-lg inline relative bg-left-bottom bg-gradient-to-r from-accent to-accent bg-no-repeat transition-all duration-300 bg-[length:0%_2px] group-hover:bg-[length:100%_2px] no-underline">
                                {navbarData.publications.latest_research.title}
                              </h4>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg overflow-hidden">
                        <div className="aspect-[16/9] relative">
                          <Image 
                            src="/bg/muska-create-5MvNlQENWDM-unsplash.png"
                            alt="Latest research report"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <Link 
                            href="/publications"
                          >
                            <div>
                              <h4 className="font-bold text-primary text-lg inline relative bg-left-bottom bg-gradient-to-r from-accent to-accent bg-no-repeat transition-all duration-300 bg-[length:0%_2px] group-hover:bg-[length:100%_2px] no-underline">
                                Research Reports
                              </h4>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
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
                      {navbarData.media.latest_podcasts.slice(0, 2).map((podcast, index) => (
                        <div key={podcast.id || index} className="flex gap-3">
                          <div className="h-16 w-16 relative flex-shrink-0">
                            <Image 
                              src={podcast.thumbnail || "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"}
                              alt={podcast.title}
                              fill
                              style={{ objectFit: 'cover', borderRadius: '4px' }}
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary hover:text-accent transition-colors font-sans">{podcast.title}</h4>
                            <p className="text-sm text-gray-500 font-sans">
                              {podcast.topic?.[0]?.name || 'Podcast'} • {podcast.duration || '30 min'}
                            </p>
                          </div>
                        </div>
                      ))}
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
                    {navbarData.media.latest_video ? (
                      <div className="flex gap-4">
                        <div className="h-32 w-40 relative flex-shrink-0">
                          <Image 
                            src={navbarData.media.latest_video.thumbnail || "/bg/muska-create-5MvNlQENWDM-unsplash.png"}
                            alt={navbarData.media.latest_video.title}
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
                          <h4 className="font-bold text-primary">{navbarData.media.latest_video.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">Latest video from CSIS Indonesia.</p>
                          <Link 
                            href={`/media/youtube/${navbarData.media.latest_video.slug}`} 
                            className="text-sm bg-accent text-white px-3 py-1 inline-block hover:bg-accent/90 transition-colors"
                          >
                            Watch Video
                          </Link>
                        </div>
                      </div>
                    ) : (
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
                          <h4 className="font-bold text-primary">CSIS Videos</h4>
                          <p className="text-sm text-gray-600 mb-2">Explore our latest videos and multimedia content.</p>
                          <Link 
                            href="/media/youtube" 
                            className="text-sm bg-accent text-white px-3 py-1 inline-block hover:bg-accent/90 transition-colors"
                          >
                            Browse Videos
                          </Link>
                        </div>
                      </div>
                    )}
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
    </>
  );
};

export default NavBar; 