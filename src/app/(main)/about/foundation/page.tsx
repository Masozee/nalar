'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { FiCheck, FiDollarSign, FiGift, FiUsers, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface BoardMember {
  id: number;
  name: string;
  slug: string;
  position: string;
  organization: string;
  category: string;
  profile_url: string | null;
  profile_img: string;
}

interface Board {
  board_of_trustees: BoardMember[];
  board_of_supervisors: BoardMember[];
  board_of_directors: BoardMember[];
}

interface BoardData {
  board: Board;
}

export default function Foundation() {
  const [boardData, setBoardData] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await fetch('https://beta.parlemenkita.org/api/board/');
        if (!response.ok) {
          throw new Error('Failed to fetch board data');
        }
        const data: BoardData = await response.json();
        setBoardData(data.board);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, []);

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="pt-0">
          <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-white/20 rounded w-32 mx-auto mb-4"></div>
                  <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-6"></div>
                  <div className="h-6 bg-white/20 rounded w-64 mx-auto"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <main className="pt-0">
          <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h1 className="text-4xl font-bold !text-white mb-6">Error Loading Board Data</h1>
                <p className="text-white/80">{error}</p>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  const renderBoardSection = (title: string, members: BoardMember[], description: string) => (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">{title}</h2>
          <p className="text-lg text-gray-700">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
            >
              <div className="aspect-w-3 aspect-h-4 relative h-80">
                <Image 
                  src={member.profile_img} 
                  alt={member.name} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                <p className="text-accent font-medium mb-4">{member.position}</p>
                <p className="text-gray-600 mb-6">{member.organization}</p>
                {member.profile_url && (
                  <div className="flex items-center space-x-4">
                    <a 
                      href={member.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-accent hover:text-primary font-medium"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <>
      <NavBar />
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative w-full h-[40vh] min-h-[300px] bg-[#005357]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#005357] to-[#005357]/80 z-10" />
          <Image
            src="/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"
            alt="CSIS Foundation"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'overlay' }}
            priority
          />
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-accent px-4 py-2 mb-4 w-fit"
            >
              <span className="text-lg font-medium text-white">Foundation</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold !text-white mb-4"
            >
              CSIS Foundation
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-green-100 max-w-2xl"
            >
              Supporting Indonesia&apos;s future through policy research and leadership development
            </motion.p>
          </div>
        </section>

        {/* About Navigation */}
        <section className="sticky top-16 z-40 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto py-4 gap-8">
              <Link href="/about" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                Overview
              </Link>
              <Link href="/about/history" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                History
              </Link>
              <Link href="/about/board-of-directors" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                Board of Directors
              </Link>
              <Link href="/about/foundation" className="text-accent font-bold whitespace-nowrap border-b-2 border-accent px-1 py-2">
                CSIS Foundation
              </Link>
              <Link href="/about/logo" className="text-gray-600 hover:text-accent font-bold whitespace-nowrap px-1 py-2">
                Behind The Logo
              </Link>
            </nav>
          </div>
        </section>


        {boardData && (
          <>
            {renderBoardSection(
              "Board of Trustees", 
              boardData.board_of_trustees,
              "Provides strategic oversight and governance to ensure CSIS fulfills its mission and maintains financial sustainability."
            )}
            
            {renderBoardSection(
              "Board of Directors", 
              boardData.board_of_directors,
              "Manages institutional affairs and implements strategic decisions to advance CSIS Indonesia's research mission."
            )}
            
            {renderBoardSection(
              "Board of Supervisors", 
              boardData.board_of_supervisors,
              "Oversees institutional compliance and ensures adherence to governance standards and best practices."
            )}
          </>
        )}

        {/* Foundation Information */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Foundation Governance</h2>
              <p className="text-lg text-gray-700 mb-8">
                Our foundation board members provide strategic guidance, institutional oversight, and ensure the long-term sustainability of CSIS Indonesia's mission to advance policy research and public discourse.
              </p>
              <Link 
                href="/about/board-of-directors" 
                className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
              >
                View Executive Directors
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}