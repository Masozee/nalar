'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiUser, FiTag, FiArrowRight } from 'react-icons/fi';

// Sample news data
const newsItems = [
  {
    id: 'news-001',
    title: 'CSIS Hosts International Conference on Southeast Asian Security',
    slug: 'csis-hosts-international-conference',
    date: 'April 15, 2024',
    author: 'Dr. Sarah Chen',
    category: 'Events',
    excerpt: 'Leading experts from across Southeast Asia gathered at CSIS for a two-day conference on regional security challenges and opportunities.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    featured: true
  },
  {
    id: 'news-002',
    title: 'New Research Partnership Announced with ASEAN Universities',
    slug: 'new-research-partnership-asean',
    date: 'April 10, 2024',
    author: 'Prof. James Wilson',
    category: 'Research',
    excerpt: 'CSIS has established a new research partnership with leading universities across ASEAN to strengthen regional academic collaboration.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    featured: true
  },
  {
    id: 'news-003',
    title: 'CSIS Experts Contribute to UN Climate Report',
    slug: 'csis-experts-un-climate-report',
    date: 'April 5, 2024',
    author: 'Dr. Maria Rodriguez',
    category: 'Research',
    excerpt: 'CSIS researchers have contributed to the latest UN climate report, providing critical analysis on Southeast Asia\'s climate challenges.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    featured: false
  },
  {
    id: 'news-004',
    title: 'CSIS Launches New Digital Policy Initiative',
    slug: 'csis-digital-policy-initiative',
    date: 'April 1, 2024',
    author: 'Dr. Alex Kumar',
    category: 'Policy',
    excerpt: 'A new initiative aims to help Southeast Asian nations develop comprehensive digital policies for the rapidly evolving tech landscape.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    featured: false
  },
  {
    id: 'news-005',
    title: 'CSIS Welcomes New Senior Fellows',
    slug: 'csis-welcomes-new-senior-fellows',
    date: 'March 28, 2024',
    author: 'CSIS Staff',
    category: 'Announcements',
    excerpt: 'Three distinguished scholars have joined CSIS as Senior Fellows, bringing expertise in international relations, economics, and security studies.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    featured: false
  },
  {
    id: 'news-006',
    title: 'CSIS Publishes Special Report on Indonesia\'s Economic Outlook',
    slug: 'csis-indonesia-economic-outlook',
    date: 'March 25, 2024',
    author: 'Dr. Rudi Hartono',
    category: 'Publications',
    excerpt: 'A comprehensive analysis of Indonesia\'s economic prospects for 2024-2025, with recommendations for sustainable growth strategies.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    featured: false
  }
];

// Categories for filtering
const categories = [
  { name: 'All', count: newsItems.length },
  { name: 'Events', count: newsItems.filter(item => item.category === 'Events').length },
  { name: 'Research', count: newsItems.filter(item => item.category === 'Research').length },
  { name: 'Policy', count: newsItems.filter(item => item.category === 'Policy').length },
  { name: 'Announcements', count: newsItems.filter(item => item.category === 'Announcements').length },
  { name: 'Publications', count: newsItems.filter(item => item.category === 'Publications').length }
];

export default function NewsPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
            alt="News background"
            fill
            style={{ objectFit: 'cover', opacity: 0.3 }}
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">News & Updates</h1>
          <p className="mt-6 text-xl max-w-3xl">
            Stay informed about the latest research, events, and developments from CSIS Indonesia.
          </p>
        </div>
      </div>

      {/* Featured News */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-primary mb-8">Featured News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsItems.filter(item => item.featured).map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FiCalendar className="mr-1" />
                  <span>{item.date}</span>
                  <span className="mx-2">•</span>
                  <FiUser className="mr-1" />
                  <span>{item.author}</span>
                  <span className="mx-2">•</span>
                  <FiTag className="mr-1" />
                  <span>{item.category}</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.excerpt}</p>
                <Link 
                  href={`/news/${item.slug}`}
                  className="inline-flex items-center text-accent hover:text-accent/80"
                >
                  Read more
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All News */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-8">All News</h2>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.name}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-primary hover:bg-accent hover:text-white transition-colors"
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          
          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FiCalendar className="mr-1" />
                    <span>{item.date}</span>
                    <span className="mx-2">•</span>
                    <FiTag className="mr-1" />
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt}</p>
                  <Link 
                    href={`/news/${item.slug}`}
                    className="inline-flex items-center text-accent hover:text-accent/80"
                  >
                    Read more
                    <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 