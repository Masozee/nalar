'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiBriefcase, FiArrowRight, FiUsers, FiBookOpen, FiFilter, FiSearch, FiChevronDown } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function CareersPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const filterOptions = [
    { id: 'all', name: 'All Positions' },
    { id: 'research', name: 'Research Positions' },
    { id: 'internship', name: 'Internships' },
    { id: 'admin', name: 'Administrative' },
    { id: 'management', name: 'Management' }
  ];

  const careers = [
    {
      id: 1,
      title: 'Research Fellow - International Relations',
      category: 'research',
      type: 'Full-time',
      location: 'Jakarta, Indonesia',
      department: 'International Relations',
      deadline: 'August 30, 2023',
      description: 'Join our team as a Research Fellow specializing in International Relations focused on Southeast Asia regional dynamics.',
      slug: 'research-fellow-international-relations'
    },
    {
      id: 2,
      title: 'Senior Research Fellow - Economics',
      category: 'research',
      type: 'Full-time',
      location: 'Jakarta, Indonesia',
      department: 'Economics',
      deadline: 'September 15, 2023',
      description: 'Lead research initiatives on economic development and policy in Indonesia and broader Southeast Asia.',
      slug: 'senior-research-fellow-economics'
    },
    {
      id: 3,
      title: 'Summer Internship Program',
      category: 'internship',
      type: 'Internship',
      location: 'Jakarta, Indonesia',
      department: 'Various',
      deadline: 'March 31, 2023',
      description: 'Gain experience working alongside our researchers on policy issues affecting Indonesia and the region.',
      slug: 'summer-internship-program'
    },
    {
      id: 4,
      title: 'Administrative Assistant',
      category: 'admin',
      type: 'Full-time',
      location: 'Jakarta, Indonesia',
      department: 'Administration',
      deadline: 'Open until filled',
      description: 'Support the operations of our research teams through administrative assistance and coordination.',
      slug: 'administrative-assistant'
    },
    {
      id: 5,
      title: 'Project Manager - Security Studies',
      category: 'management',
      type: 'Full-time',
      location: 'Jakarta, Indonesia',
      department: 'Security Studies',
      deadline: 'July 30, 2023',
      description: 'Oversee projects related to security studies, managing resources, timelines, and deliverables.',
      slug: 'project-manager-security-studies'
    },
    {
      id: 6,
      title: 'Research Internship - Maritime Affairs',
      category: 'internship',
      type: 'Internship',
      location: 'Jakarta, Indonesia',
      department: 'Maritime Affairs',
      deadline: 'November 15, 2023',
      description: 'Work with our Maritime Affairs department on research related to regional maritime security issues.',
      slug: 'research-internship-maritime-affairs'
    }
  ];

  const filteredCareers = careers.filter(career => {
    const matchesFilter = filter === 'all' || career.category === filter;
    const matchesSearch = 
      career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Careers at CSIS
            </h1>
            <p className="text-xl text-gray-700">
              Join our team of researchers, policy experts, and professionals dedicated to advancing policy solutions in Indonesia and beyond.
            </p>
          </div>
        </div>
      </section>
      
      {/* Opportunity Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Opportunity Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Research Fellows */}
            <div className="bg-gray-50 p-8 h-full">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6">
                <FiBookOpen className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Research Fellows</h3>
              <p className="text-gray-600 mb-6">
                Join CSIS as a Research Fellow to contribute to cutting-edge policy research on Indonesia and international affairs. Research positions are available at junior, mid-career, and senior levels.
              </p>
              <Link 
                href="/careers/research-fellow" 
                className="inline-flex items-center text-primary font-medium hover:text-primary/80"
              >
                View Research Fellow Positions
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Internships */}
            <div className="bg-gray-50 p-8 h-full">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6">
                <FiUsers className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Internships</h3>
              <p className="text-gray-600 mb-6">
                Our internship programs offer students and recent graduates valuable experience working alongside policy researchers. Internships are available throughout the year across various departments.
              </p>
              <Link 
                href="/careers/internship" 
                className="inline-flex items-center text-primary font-medium hover:text-primary/80"
              >
                View Internship Opportunities
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Staff Positions */}
            <div className="bg-gray-50 p-8 h-full">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6">
                <FiBriefcase className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Staff Positions</h3>
              <p className="text-gray-600 mb-6">
                We regularly seek talented individuals for administrative, management, communications, and other operational roles that support our research mission.
              </p>
              <Link 
                href="/careers/staff" 
                className="inline-flex items-center text-primary font-medium hover:text-primary/80"
              >
                View Staff Positions
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current Openings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Current Openings</h2>
          
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search positions..."
                className="w-full pl-12 py-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center bg-white py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FiFilter className="mr-2" />
                Filter by Category
                <FiChevronDown className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilters && (
                <div className="mt-2 bg-white border border-gray-300 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {filterOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setFilter(option.id)}
                        className={`px-4 py-2 ${filter === option.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Job Listings */}
          {filteredCareers.length > 0 ? (
            <div className="space-y-6">
              {filteredCareers.map(career => (
                <div key={career.id} className="bg-white p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{career.title}</h3>
                    <div className="mt-2 md:mt-0 flex items-center">
                      <span className="text-gray-600 mr-4">{career.type}</span>
                      <Link
                        href={`/careers/${career.slug}`}
                        className="inline-flex items-center bg-primary py-2 px-4 text-white hover:bg-primary/90"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600">{career.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-y-2">
                    <div className="w-full sm:w-1/2 lg:w-1/4 flex items-center text-gray-600">
                      <span className="font-medium mr-2">Department:</span> {career.department}
                    </div>
                    <div className="w-full sm:w-1/2 lg:w-1/4 flex items-center text-gray-600">
                      <span className="font-medium mr-2">Location:</span> {career.location}
                    </div>
                    <div className="w-full lg:w-1/2 flex items-center text-gray-600">
                      <span className="font-medium mr-2">Application Deadline:</span> {career.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 text-center">
              <p className="text-lg text-gray-600 mb-4">No positions matching your criteria were found.</p>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center bg-primary py-2 px-4 text-white hover:bg-primary/90"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* Working at CSIS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us</h2>
            <p className="text-xl text-gray-600">
              CSIS Indonesia provides a collaborative environment where experts from diverse backgrounds contribute to policy discussions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impactful Work</h3>
              <p className="text-gray-600">
                Contribute to research and policy recommendations that influence decision-making at the highest levels of government and business.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Growth</h3>
              <p className="text-gray-600">
                Develop your expertise through mentorship, research projects, and collaboration with leading policy experts in the region.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Network</h3>
              <p className="text-gray-600">
                Connect with a network of researchers, policymakers, and thought leaders from around the world through our international partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Don&apos;t See a Position That Fits?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We&apos;re always looking for talented individuals to join our team. Submit your resume for future consideration.
          </p>
          <Link 
            href="/careers/general-application"
            className="inline-flex items-center bg-primary py-3 px-6 text-white text-lg hover:bg-primary/90"
          >
            Submit General Application
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 