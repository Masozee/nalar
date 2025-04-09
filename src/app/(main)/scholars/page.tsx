'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi';

// Sample scholars data
const scholars = [
  {
    id: 'scholar-001',
    name: 'Dr. Sarah Chen',
    title: 'Senior Fellow',
    expertise: ['International Relations', 'Southeast Asian Politics'],
    bio: 'Dr. Chen specializes in Southeast Asian political dynamics and international relations. She has published extensively on regional security issues and ASEAN integration.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    email: 'sarah.chen@csis.or.id',
    twitter: '@sarahchen',
    linkedin: 'sarahchen',
    website: 'www.sarahchen.com'
  },
  {
    id: 'scholar-002',
    name: 'Prof. James Wilson',
    title: 'Research Director',
    expertise: ['Economics', 'Development Studies'],
    bio: 'Professor Wilson leads CSIS\'s economic research initiatives. His work focuses on sustainable development and economic policy in emerging markets.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    email: 'james.wilson@csis.or.id',
    twitter: '@jameswilson',
    linkedin: 'jameswilson',
    website: 'www.jameswilson.ac.id'
  },
  {
    id: 'scholar-003',
    name: 'Dr. Maria Rodriguez',
    title: 'Senior Researcher',
    expertise: ['Climate Policy', 'Environmental Studies'],
    bio: 'Dr. Rodriguez\'s research examines the intersection of climate policy and economic development in Southeast Asia. She has advised multiple governments on climate action plans.',
    image: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
    email: 'maria.rodriguez@csis.or.id',
    twitter: '@mariarodriguez',
    linkedin: 'mariarodriguez',
    website: 'www.mariarodriguez.id'
  },
  {
    id: 'scholar-004',
    name: 'Dr. Alex Kumar',
    title: 'Research Fellow',
    expertise: ['Digital Policy', 'Technology Governance'],
    bio: 'Dr. Kumar focuses on digital policy and technology governance in Southeast Asia. His work addresses the challenges of digital transformation and regulatory frameworks.',
    image: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
    email: 'alex.kumar@csis.or.id',
    twitter: '@alexkumar',
    linkedin: 'alexkumar',
    website: 'www.alexkumar.id'
  },
  {
    id: 'scholar-005',
    name: 'Dr. Rudi Hartono',
    title: 'Senior Fellow',
    expertise: ['Indonesian Politics', 'Public Policy'],
    bio: 'Dr. Hartono is a leading expert on Indonesian politics and public policy. His research examines governance reforms and political institutions in Indonesia.',
    image: '/bg/heather-green-bQTzJzwQfJE-unsplash.png',
    email: 'rudi.hartono@csis.or.id',
    twitter: '@rudihartono',
    linkedin: 'rudihartono',
    website: 'www.rudihartono.id'
  }
];

// Expertise tags for filtering
const expertiseTags = Array.from(new Set(scholars.flatMap(scholar => scholar.expertise)));

export default function ScholarsPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
            alt="Scholars background"
            fill
            style={{ objectFit: 'cover', opacity: 0.3 }}
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Our Scholars</h1>
          <p className="mt-6 text-xl max-w-3xl">
            Meet our team of distinguished researchers and experts who are shaping the discourse on Southeast Asian affairs.
          </p>
        </div>
      </div>

      {/* Expertise Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2">
          {expertiseTags.map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-white rounded-full text-sm font-medium text-primary hover:bg-accent hover:text-white transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Scholars Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scholars.map((scholar) => (
            <div key={scholar.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={scholar.image}
                  alt={scholar.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary">{scholar.name}</h3>
                <p className="text-accent mb-2">{scholar.title}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {scholar.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{scholar.bio}</p>
                <div className="flex space-x-4">
                  <a
                    href={`mailto:${scholar.email}`}
                    className="text-gray-400 hover:text-accent"
                    title="Email"
                  >
                    <FiMail className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://twitter.com/${scholar.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent"
                    title="Twitter"
                  >
                    <FiTwitter className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://linkedin.com/in/${scholar.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent"
                    title="LinkedIn"
                  >
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://${scholar.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent"
                    title="Website"
                  >
                    <FiGlobe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 