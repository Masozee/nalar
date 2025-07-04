'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiTwitter, FiLinkedin, FiGlobe, FiSearch } from 'react-icons/fi';
import { fetchScholars, type Scholar } from './api';
// Card components replaced with custom divs
import ScholarDetailModal from './ScholarDetailModal';

export default function ScholarsPage() {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [filteredScholars, setFilteredScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'card' | 'list'>('card');
  const [sort, setSort] = useState('Name');
  // Track loaded state for each image
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // Fetch scholars data
  useEffect(() => {
    const getScholars = async () => {
      try {
        setLoading(true);
        const scholars = await fetchScholars();
        // Always sort alphabetically by name
        const sorted = [...scholars].sort((a, b) => a.name.localeCompare(b.name));
        setScholars(sorted);
      } catch (err) {
        console.error('Error fetching scholars:', err);
        setError('Failed to load scholars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    getScholars();
  }, []);

  // Filter and sort scholars
  useEffect(() => {
    let filtered = scholars;
    if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    // Always keep alphabetically sorted by name
    filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    setFilteredScholars(filtered);
  }, [scholars, search, sort]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
        <Image
          src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
          alt="Scholars"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
          priority
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold !text-white mb-4"
          >
            Our Scholars
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-green-100 max-w-2xl"
          >
            Meet our team of distinguished researchers and experts who are shaping the discourse on Southeast Asian affairs.
          </motion.p>
        </div>
      </section>

      {/* Top Bar: Search and View Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-[#005357]">Scholars</h2>
            
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <input
                className="w-full rounded border px-3 py-2 pr-10"
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <FiSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                className={`px-3 py-2 rounded-l border border-gray-300 ${view === 'card' ? 'bg-[#005357] text-white' : 'bg-white text-[#005357]'}`}
                onClick={() => setView('card')}
                aria-label="Card view"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
              <button
                className={`px-3 py-2 rounded-r border border-gray-300 ${view === 'list' ? 'bg-[#005357] text-white' : 'bg-white text-[#005357]'}`}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="3"/><rect x="3" y="10.5" width="18" height="3"/><rect x="3" y="17" width="18" height="3"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scholars Content (Card/List switcher) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005357]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#005357] text-white rounded hover:bg-[#003e40]"
              >
                Reload
              </button>
            </div>
          ) : (
            <>
              {view === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredScholars.map((scholar, idx) => (
                    <div
                      data-slot="card"
                      key={scholar.id}
                      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm hover:shadow-lg transition-shadow h-auto"
                    >
                      <div className="relative w-full bg-gray-100 rounded-t-xl overflow-hidden" style={{ aspectRatio: '1 / 1' }} >
                        {scholar.profile_img ? (
                          <Image
                            src={scholar.profile_img}
                            alt={scholar.name}
                            fill
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover transition-opacity duration-300 ${imageLoaded[scholar.slug] ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(prev => ({ ...prev, [scholar.slug]: true }))}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V7lYuwAAAABJRU5ErkJggg=="
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div data-slot="card-content" className="px-6 flex flex-col">
                        <Link href={`/scholar/${scholar.slug}`}>
                          <div data-slot="card-title" className="text-lg font-extrabold text-[#005357] mb-3">{scholar.name}</div>
                        </Link>
                        <div data-slot="card-description" className="text-sm text-[#005357]/80 font-medium">{scholar.position}</div>
                        <div className={`text-gray-600 text-sm font-medium ${!scholar.expertise || scholar.expertise.length === 0 ? 'mb-5' : 'mb-3'}`}>{scholar.organization}</div>
                        {scholar.expertise && scholar.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 mb-5">
                            {scholar.expertise.slice(0, 2).map((exp, i) => (
                              <span key={i} className="inline-block px-3 py-1 bg-[#e6f0f0] rounded-full text-xs text-[#005357] font-medium">{exp.name}</span>
                            ))}
                            {scholar.expertise.length > 2 && (
                              <span className="inline-block px-3 py-1 bg-[#e6f0f0] rounded-full text-xs text-[#005357] font-medium">+{scholar.expertise.length - 2}</span>
                            )}
                          </div>
                        )}
                        {/* Removed globe icon */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y rounded-xl border overflow-hidden bg-white shadow-sm">
                  {filteredScholars.map((scholar, idx) => (
                    <div
                      key={scholar.id}
                      className="flex flex-col md:flex-row items-center gap-6 p-6 hover:bg-gray-50 transition"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center shadow-sm">
                        {scholar.profile_img ? (
                          <Image
                            src={scholar.profile_img}
                            alt={scholar.name}
                            fill
                            loading="lazy"
                            sizes="(max-width: 768px) 96px, 96px"
                            className={`object-cover transition-opacity duration-300 ${imageLoaded[scholar.slug] ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(prev => ({ ...prev, [scholar.slug]: true }))}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V7lYuwAAAABJRU5ErkJggg=="
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 text-center md:text-left">
                          <Link href={`/scholar/${scholar.slug}`}>
                            <h3 className="font-bold text-[#005357] text-xl mb-3">{scholar.name}</h3>
                          </Link>
                          <div className="text-[#005357]/80 font-medium mb-1">{scholar.position}</div>
                          <div className={`text-gray-600 font-medium ${!scholar.expertise || scholar.expertise.length === 0 ? 'mb-5' : 'mb-3'}`}>{scholar.organization}</div>
                          {scholar.expertise && scholar.expertise.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1 mb-4 justify-center md:justify-start">
                              {scholar.expertise.slice(0, 3).map((exp, i) => (
                                <span key={i} className="inline-block px-3 py-1 bg-[#e6f0f0] rounded-full text-xs text-[#005357] font-medium">{exp.name}</span>
                              ))}
                              {scholar.expertise.length > 3 && (
                                <span className="inline-block px-3 py-1 bg-[#e6f0f0] rounded-full text-xs text-[#005357] font-medium">+{scholar.expertise.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-[#e6f0f0] rounded-full text-xs text-[#005357] font-medium mb-4">{scholar.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Scholars Count */}
              <div className="text-center text-gray-500 mt-4">
                Showing {filteredScholars.length} {search ? 'matching' : ''} scholars
              </div>
            </>
          )}
          {/* Removed ScholarDetailModal */}
        </div>
      </div>
    </div>
  );
}