'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { FiMail, FiLinkedin, FiTwitter } from 'react-icons/fi';

export default function BoardOfDirectors() {
  const executiveDirectors = [
    {
      name: 'Dr. Philips J. Vermonte',
      title: 'Executive Director',
      image: '/directors/director-1.jpg',
      bio: 'Dr. Philips J. Vermonte has been the Executive Director of CSIS since 2016. He holds a Ph.D. in Political Science from Northern Illinois University and specializes in electoral politics, political parties, and democratization in Indonesia.',
      email: 'philips.vermonte@csis.or.id',
      linkedin: 'https://linkedin.com/in/philipsvermonte',
      twitter: 'https://twitter.com/pvermonte'
    },
    {
      name: 'Dr. Lina Alexandra',
      title: 'Deputy Director for Research',
      image: '/directors/director-2.jpg',
      bio: 'Dr. Lina Alexandra oversees research across all CSIS departments. She specializes in international relations, ASEAN studies, and security cooperation. She holds a Ph.D. from the Australian National University.',
      email: 'lina.alexandra@csis.or.id',
      linkedin: 'https://linkedin.com/in/linaalexandra',
      twitter: 'https://twitter.com/lina_alexandra'
    },
    {
      name: 'Dr. Yose Rizal Damuri',
      title: 'Head of Economics Department',
      image: '/directors/director-3.jpg',
      bio: 'Dr. Yose Rizal Damuri leads economic research at CSIS, focusing on international trade, regional integration, and economic development. He holds a Ph.D. in International Economics from the Graduate Institute, Geneva.',
      email: 'yose.damuri@csis.or.id',
      linkedin: 'https://linkedin.com/in/yoserizaldamuri',
      twitter: 'https://twitter.com/yosedamuri'
    }
  ];

  const boardMembers = [
    {
      name: 'Prof. Jusuf Wanandi',
      title: 'Co-Founder & Senior Fellow',
      image: '/directors/board-1.jpg',
      bio: 'Prof. Jusuf Wanandi is a co-founder of CSIS and has been instrumental in shaping Indonesia&apos;s foreign policy debates since the 1970s. He continues to provide strategic guidance to the organization.',
    },
    {
      name: 'Dr. Clara Joewono',
      title: 'Vice-Chair, Board of Trustees',
      image: '/directors/board-2.jpg',
      bio: 'Dr. Clara Joewono has been associated with CSIS for over three decades and oversees governance and strategic planning. She specializes in foreign policy and international security.',
    },
    {
      name: 'Dr. Hadi Soesastro',
      title: 'Board Member',
      image: '/directors/board-3.jpg',
      bio: 'Dr. Hadi Soesastro is a distinguished economist who has advised multiple Indonesian administrations. He specializes in economic integration and development policy.',
    },
    {
      name: 'Dr. Rizal Sukma',
      title: 'Board Member',
      image: '/directors/board-4.jpg',
      bio: 'Dr. Rizal Sukma is a security and foreign policy expert who previously served as the Indonesian Ambassador to the United Kingdom. He provides strategic guidance on international relations.',
    },
    {
      name: 'Dr. Djisman Simandjuntak',
      title: 'Board Member',
      image: '/directors/board-5.jpg',
      bio: 'Dr. Djisman Simandjuntak is an economist and business leader who contributes expertise in economic governance and business-government relations.',
    },
    {
      name: 'Dr. Mari Pangestu',
      title: 'Board Member',
      image: '/directors/board-6.jpg',
      bio: 'Dr. Mari Pangestu is a former Trade Minister of Indonesia who brings extensive experience in international trade and economic policy to the CSIS board.',
    }
  ];

  return (
    <>
      <NavBar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block bg-accent px-4 py-2 mb-4">
                <span className="text-lg font-medium text-white">Leadership</span>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
                Board of Executive Directors
              </h1>
              <p className="text-xl text-white/80 mb-8">
                The experts guiding CSIS Indonesia&apos;s vision and strategic direction
              </p>
            </div>
          </div>
        </section>

        {/* About Navigation */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto py-4 gap-8">
              <Link href="/about" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                Overview
              </Link>
              <Link href="/about/history" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                History
              </Link>
              <Link href="/about/board-of-directors" className="text-accent font-medium whitespace-nowrap border-b-2 border-accent px-1 py-2">
                Board of Directors
              </Link>
              <Link href="/about/foundation" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                CSIS Foundation
              </Link>
              <Link href="/about/logo" className="text-gray-600 hover:text-accent whitespace-nowrap px-1 py-2">
                Behind The Logo
              </Link>
            </nav>
          </div>
        </section>

        {/* Executive Directors Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Executive Leadership</h2>
              <p className="text-lg text-gray-700">
                Meet the team driving CSIS&apos;s day-to-day operations and research excellence
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {executiveDirectors.map((director, index) => (
                <motion.div 
                  key={director.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="aspect-w-3 aspect-h-4 relative h-80">
                    <Image 
                      src={director.image} 
                      alt={director.name} 
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-1">{director.name}</h3>
                    <p className="text-accent font-medium mb-4">{director.title}</p>
                    <p className="text-gray-600 mb-6">{director.bio}</p>
                    <div className="flex items-center space-x-4">
                      <a href={`mailto:${director.email}`} className="text-gray-500 hover:text-primary">
                        <FiMail className="w-5 h-5" />
                      </a>
                      <a href={director.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0077b5]">
                        <FiLinkedin className="w-5 h-5" />
                      </a>
                      <a href={director.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2]">
                        <FiTwitter className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Governance Structure */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Our Governance Structure</h2>
              <p className="text-lg text-gray-700">
                CSIS maintains a robust governance framework to ensure accountability and transparency
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-lg bg-primary/5">
                  <h3 className="text-xl font-bold text-primary mb-3">Board of Trustees</h3>
                  <p className="text-gray-700">
                    Provides strategic oversight and governance to ensure CSIS fulfills its mission and maintains financial sustainability.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg bg-primary/5">
                  <h3 className="text-xl font-bold text-primary mb-3">Executive Board</h3>
                  <p className="text-gray-700">
                    Manages day-to-day operations, implements strategic plans, and oversees research programs and public engagement activities.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-lg bg-primary/5">
                  <h3 className="text-xl font-bold text-primary mb-3">Advisory Council</h3>
                  <p className="text-gray-700">
                    Distinguished experts who provide guidance on research priorities and help maintain the highest standards of academic rigor.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6">Organizational Values</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Independence</h4>
                      <p className="text-gray-600">CSIS maintains intellectual independence from any political, economic, or ideological interests.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Excellence</h4>
                      <p className="text-gray-600">We are committed to the highest standards of research quality and analytical rigor.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Integrity</h4>
                      <p className="text-gray-600">Our work is guided by ethical principles and a commitment to objectivity and truth.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6">Ethical Framework</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Funding Transparency</h4>
                      <p className="text-gray-600">CSIS discloses all major sources of funding and ensures that financial relationships do not influence research outcomes.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Conflict of Interest</h4>
                      <p className="text-gray-600">We maintain a rigorous conflict of interest policy for all researchers and board members.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Research Integrity</h4>
                      <p className="text-gray-600">All publications undergo a rigorous internal review process to ensure accuracy and objectivity.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Board Members Section */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Board Members</h2>
              <p className="text-lg text-gray-700">
                Distinguished experts providing strategic guidance to CSIS
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boardMembers.map((member, index) => (
                <motion.div 
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-w-3 aspect-h-3 relative h-60">
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                    <p className="text-accent font-medium mb-4">{member.title}</p>
                    <p className="text-gray-700">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 