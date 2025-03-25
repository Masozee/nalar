'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiFilter, FiX, FiUser, FiBriefcase, FiGrid, FiList } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { EXPERTS } from './data';

export default function ExpertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Extract unique departments for filtering
  const departments = Array.from(new Set(EXPERTS.map(expert => expert.department)));
  
  // Extract unique expertise areas for filtering
  const expertiseAreas = Array.from(
    new Set(EXPERTS.flatMap(expert => expert.expertise))
  ).sort();

  // Filter experts based on search query and selected filters
  const filteredExperts = EXPERTS.filter(expert => {
    const matchesQuery = 
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      expert.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.some(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesDepartment = selectedDepartment ? 
      expert.department === selectedDepartment : true;
    
    const matchesExpertise = selectedExpertise ? 
      expert.expertise.includes(selectedExpertise) : true;
    
    return matchesQuery && matchesDepartment && matchesExpertise;
  });

  // Sort experts: featured first, then alphabetically by name
  const sortedExperts = [...filteredExperts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name);
  });

  const featuredExperts = EXPERTS.filter(expert => expert.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Experts
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Meet the scholars and researchers behind CSIS Indonesia&apos;s influential policy analysis and research.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search experts by name, position, or expertise..."
                className="w-full px-12 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Experts (shown only when no search/filter is active) */}
      {!searchQuery && !selectedDepartment && !selectedExpertise && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Experts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredExperts.map(expert => (
                <Link 
                  href={`/experts/${expert.slug}`} 
                  key={expert.id}
                  className="group h-full"
                >
                  <div className="bg-white h-full flex flex-col transition-all hover:translate-y-[-3px]">
                    <div className="relative h-64">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {expert.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{expert.position}</p>
                      <p className="text-primary text-sm">{expert.department}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-2 mt-auto pt-3">
                        {expert.expertise.slice(0, 2).map((area, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1">
                            {area}
                          </span>
                        ))}
                        {expert.expertise.length > 2 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1">
                            +{expert.expertise.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* All Experts Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and View Controls */}
          <div className="flex flex-wrap justify-between items-center mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FiFilter className="mr-2" />
                Filters
                {(selectedDepartment || selectedExpertise) && (
                  <span className="ml-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center">
                    {(selectedDepartment ? 1 : 0) + (selectedExpertise ? 1 : 0)}
                  </span>
                )}
              </button>
              
              {(selectedDepartment || selectedExpertise) && (
                <button
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedExpertise('');
                  }}
                  className="text-primary hover:text-primary/80 text-sm flex items-center"
                >
                  <FiX className="mr-1" />
                  Clear filters
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm mr-2">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
          
          {/* Filter Menu */}
          {filterMenuOpen && (
            <div className="bg-white p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiBriefcase className="mr-2" />
                  Department
                </h3>
                <div className="space-y-2">
                  <div 
                    className={`cursor-pointer px-3 py-2 ${selectedDepartment === '' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedDepartment('')}
                  >
                    All Departments
                  </div>
                  {departments.map(dept => (
                    <div 
                      key={dept}
                      className={`cursor-pointer px-3 py-2 ${selectedDepartment === dept ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FiUser className="mr-2" />
                  Area of Expertise
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-4">
                  <div 
                    className={`cursor-pointer px-3 py-2 ${selectedExpertise === '' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedExpertise('')}
                  >
                    All Areas of Expertise
                  </div>
                  {expertiseAreas.map(area => (
                    <div 
                      key={area}
                      className={`cursor-pointer px-3 py-2 ${selectedExpertise === area ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedExpertise(area)}
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Results Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {sortedExperts.length === EXPERTS.length ? 'All Experts' : 'Search Results'}
            </h2>
            <p className="text-gray-600">
              Showing {sortedExperts.length} {sortedExperts.length === 1 ? 'expert' : 'experts'}
              {selectedDepartment && ` in ${selectedDepartment}`}
              {selectedExpertise && ` specializing in ${selectedExpertise}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          {/* Experts Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedExperts.map(expert => (
                <Link 
                  href={`/experts/${expert.slug}`} 
                  key={expert.id}
                  className="group h-full"
                >
                  <div className="bg-white h-full flex flex-col transition-all hover:translate-y-[-3px]">
                    <div className="relative h-56">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {expert.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{expert.position}</p>
                      <p className="text-primary text-xs">{expert.department}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1 mt-auto pt-2">
                        {expert.expertise.slice(0, 2).map((area, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                            {area}
                          </span>
                        ))}
                        {expert.expertise.length > 2 && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                            +{expert.expertise.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Experts List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {sortedExperts.map(expert => (
                <Link 
                  href={`/experts/${expert.slug}`} 
                  key={expert.id}
                  className="group"
                >
                  <div className="bg-white p-4 flex flex-col md:flex-row gap-4 transition-all hover:translate-y-[-2px]">
                    <div className="h-24 w-24 shrink-0 relative overflow-hidden">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {expert.name}
                      </h3>
                      <p className="text-gray-600">{expert.position}</p>
                      <p className="text-primary text-sm">{expert.department}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {expert.expertise.map((area, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* No Results */}
          {sortedExperts.length === 0 && (
            <div className="py-12 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No experts found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('');
                  setSelectedExpertise('');
                }}
                className="inline-flex items-center px-4 py-2 bg-primary text-white hover:bg-primary/90"
              >
                <FiX className="mr-2" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 