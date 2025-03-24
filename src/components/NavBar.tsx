'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [publicationsMenuOpen, setPublicationsMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const publicationsRef = useRef<HTMLDivElement>(null);

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
    setPublicationsMenuOpen(!publicationsMenuOpen);
  };

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'Experts', href: '/experts' },
    { name: 'Publications', href: '/publications', hasDropdown: true },
    { name: 'Events', href: '/events' },
    { name: 'Contact Us', href: '/contact' },
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

  const handleNavClick = (name: string) => {
    setActiveItem(name);
    setIsOpen(false);
    
    if (name !== 'Publications') {
      setPublicationsMenuOpen(false);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="CSIS Indonesia Logo" 
                width={90} 
                height={25} 
                priority
              />
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-6">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <button
                    onClick={() => togglePublicationsMenu()}
                    className={`text-base font-medium transition-colors flex items-center ${
                      activeItem === item.name 
                        ? 'text-accent border-b-2 border-accent' 
                        : 'text-primary hover:text-teal'
                    }`}
                  >
                    {item.name}
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${publicationsMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link 
                    href={item.href}
                    onClick={() => handleNavClick(item.name)}
                    className={`text-base font-medium transition-colors ${
                      activeItem === item.name 
                        ? 'text-accent border-b-2 border-accent' 
                        : 'text-primary hover:text-teal'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Search button */}
            <button
              onClick={toggleSearch}
              className="p-2 text-primary hover:text-accent transition-colors"
              aria-label="Search"
            >
              <FiSearch className="h-5 w-5" />
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleSearch}
              className="p-2 text-primary hover:text-accent transition-colors"
              aria-label="Search"
            >
              <FiSearch className="h-5 w-5" />
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-accent hover:bg-gray-100/50 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white/95 backdrop-blur-md shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            item.hasDropdown ? (
              <div key={item.name}>
                <button
                  onClick={() => togglePublicationsMenu()}
                  className={`w-full text-left block px-3 py-2 text-lg font-medium ${
                    activeItem === item.name 
                      ? 'text-accent bg-gray-100/50' 
                      : 'text-primary hover:text-teal hover:bg-gray-100/30'
                  } flex justify-between items-center`}
                >
                  {item.name}
                  <svg
                    className={`h-4 w-4 transition-transform ${publicationsMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {publicationsMenuOpen && (
                  <div className="pl-4 space-y-1 mt-1">
                    {publicationCategories.slice(0, 4).map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => handleNavClick(item.name)}
                        className="block px-3 py-2 text-base text-gray-600 hover:text-accent"
                      >
                        {category.name}
                      </Link>
                    ))}
                    <Link
                      href="/publications/categories"
                      onClick={() => handleNavClick(item.name)}
                      className="block px-3 py-2 text-base text-accent font-medium"
                    >
                      View All Categories
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick(item.name)}
                className={`block px-3 py-2 text-lg font-medium ${
                  activeItem === item.name 
                    ? 'text-accent bg-gray-100/50' 
                    : 'text-primary hover:text-teal hover:bg-gray-100/30'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Publications Mega Menu (Desktop) */}
      {publicationsMenuOpen && (
        <div 
          ref={publicationsRef}
          className="absolute left-0 w-full hidden md:block bg-white shadow-xl border-t border-gray-200 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <h3 className="text-lg font-bold text-primary mb-4">Publication Categories</h3>
                <div className="space-y-2">
                  {publicationCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="flex justify-between items-center py-2 text-gray-700 hover:text-accent transition-colors"
                    >
                      <span>{category.name}</span>
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{category.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="col-span-4">
                <h3 className="text-lg font-bold text-primary mb-4">Featured Publications</h3>
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
                      <h4 className="font-medium text-primary hover:text-accent transition-colors">Indonesia's Economic Outlook 2024</h4>
                      <p className="text-sm text-gray-500">Economics • May 10, 2024</p>
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
                      <h4 className="font-medium text-primary hover:text-accent transition-colors">ASEAN's Strategic Position in US-China Relations</h4>
                      <p className="text-sm text-gray-500">International Relations • April 28, 2024</p>
                    </div>
                  </div>
                </div>
                <Link 
                  href="/publications" 
                  className="inline-block mt-4 text-accent font-medium hover:underline"
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
        </div>
      )}

      {/* Search Popup */}
      {searchOpen && (
        <div 
          ref={searchRef}
          className="absolute top-20 left-0 w-full bg-white shadow-sm border-t border-gray-200 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center border-b border-gray-300 pb-2">
              <FiSearch className="h-5 w-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search publications, events, experts..." 
                className="w-full outline-none text-lg"
                autoFocus
              />
              <button 
                onClick={toggleSearch}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">POPULAR SEARCHES</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm">Southeast Asia</button>
                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm">Indonesia Economy</button>
                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm">US-China Relations</button>
                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm">Maritime Security</button>
                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm">Digital Economy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>
    </nav>
  );
};

export default NavBar; 