'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiCheckCircle, FiArrowLeft, FiDownload, FiSend, FiAward } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

// This would typically come from an API or database
const researchPositions = [
  {
    id: 1,
    title: 'Research Fellow - International Relations',
    level: 'Mid-Senior',
    department: 'International Relations',
    focus: 'Southeast Asia regional dynamics, ASEAN',
    deadline: 'August 30, 2023',
    description: 'Join our team as a Research Fellow specializing in International Relations. In this role, you will conduct in-depth analysis of Southeast Asian regional dynamics, with a focus on ASEAN cooperation mechanisms and regional security architecture.',
    longDescription: 'The International Relations Research Fellow will be part of our dynamic team studying regional security architecture, diplomatic relations, and international cooperation in Southeast Asia. This position offers an opportunity to contribute to research on ASEAN integration, regional power dynamics, maritime security, and the evolving Indo-Pacific strategic environment.',
    requirements: 'Ph.D. in International Relations or related field; 3-5 years of research experience; strong publication record; experience in policy engagement.',
    responsibilities: [
      'Conduct independent research on Southeast Asian regional dynamics and ASEAN cooperation mechanisms',
      'Analyze regional security architecture and diplomatic relations in the Indo-Pacific',
      'Author policy papers, reports, and scholarly articles on international relations topics',
      'Present research findings at academic conferences, policy forums, and public events',
      'Engage with policymakers, diplomats, and regional stakeholders on international relations issues',
      'Mentor junior researchers and contribute to the development of research agendas'
    ],
    qualifications: [
      'Ph.D. in International Relations, Political Science, or related field',
      '3-5 years of research experience focusing on Southeast Asian regional dynamics',
      'Strong publication record in peer-reviewed journals and policy outlets',
      'Experience engaging with policymakers and translating research into policy recommendations',
      'Excellent analytical, writing, and presentation skills',
      'Proficiency in English; knowledge of one or more Southeast Asian languages is an advantage'
    ],
    benefits: [
      'Competitive salary package',
      'Research funding for fieldwork and conference attendance',
      'Publication opportunities in CSIS journals and other outlets',
      'Access to extensive networks of policymakers and researchers',
      'Professional development opportunities',
      'Healthcare benefits and other allowances'
    ],
    slug: 'research-fellow-international-relations'
  },
  {
    id: 2,
    title: 'Senior Research Fellow - Economics',
    level: 'Senior',
    department: 'Economics',
    focus: 'Trade policy, economic development',
    deadline: 'September 15, 2023',
    description: 'Lead research initiatives on economic development and policy in Indonesia and broader Southeast Asia. This position involves developing research agendas, securing funding, managing projects, and engaging with policymakers.',
    longDescription: 'The Senior Research Fellow in Economics will spearhead CSIS Indonesia\'s research on economic development, trade policy, and economic governance in Indonesia and Southeast Asia. This senior position involves leadership in research planning, project management, fundraising, and engaging with high-level policymakers and international organizations on economic issues affecting the region.',
    requirements: 'Ph.D. in Economics; 7+ years of research experience; strong publication record; experience in policy advisory roles; project management skills.',
    responsibilities: [
      'Lead and develop research agendas on economic development and trade policy in Southeast Asia',
      'Secure research funding through grants and partnerships with international organizations',
      'Manage major research projects and supervise research teams',
      'Produce high-quality publications on economic issues for academic and policy audiences',
      'Engage with senior policymakers and international organizations on economic policy',
      'Represent CSIS at high-level conferences, policy dialogues, and media engagements',
      'Mentor junior researchers and contribute to capacity building'
    ],
    qualifications: [
      'Ph.D. in Economics or closely related field',
      '7+ years of research experience in economic development, trade policy, or related areas',
      'Excellent publication record in academic journals and policy outlets',
      'Demonstrated experience in securing research grants and managing projects',
      'Experience in policy advisory roles with government or international organizations',
      'Strong networks in academic, policy, and international development communities',
      'Excellent leadership, communication, and management skills'
    ],
    benefits: [
      'Highly competitive salary package',
      'Leadership role in shaping research agendas',
      'Substantial research and travel budget',
      'Opportunities to influence economic policy at the highest levels',
      'Representation allowance for engaging with stakeholders',
      'Comprehensive healthcare and retirement benefits',
      'Flexible work arrangements'
    ],
    slug: 'senior-research-fellow-economics'
  },
  {
    id: 3,
    title: 'Junior Research Fellow - Security Studies',
    level: 'Junior',
    department: 'Security Studies',
    focus: 'Maritime security, defense policy',
    deadline: 'October 1, 2023',
    description: 'Support research projects related to maritime security and defense policy in the Indo-Pacific region. This position involves data collection, analysis, and contributing to publications under the guidance of senior researchers.',
    longDescription: 'The Junior Research Fellow in Security Studies will support our team working on maritime security, defense policy, and non-traditional security challenges in Indonesia and the broader Indo-Pacific region. This entry-level position offers an opportunity to develop expertise in security studies while contributing to policy-relevant research under the mentorship of senior researchers.',
    requirements: 'Master\'s degree in International Security, Strategic Studies, or related field; 1-2 years of research experience; strong analytical skills; familiarity with regional security issues.',
    responsibilities: [
      'Conduct research on maritime security issues and defense policy in the Indo-Pacific',
      'Collect and analyze data on regional security developments',
      'Draft sections of research reports, policy briefs, and other publications',
      'Monitor security-related news and policy developments in the region',
      'Assist senior researchers with literature reviews and background research',
      'Support the organization of seminars, workshops, and other events',
      'Present research findings in internal meetings and selected public forums'
    ],
    qualifications: [
      'Master\'s degree in International Security, Strategic Studies, or related field',
      '1-2 years of research experience in security studies or defense policy',
      'Strong analytical skills and attention to detail',
      'Familiarity with regional security issues in Southeast Asia',
      'Good writing and communication skills',
      'Ability to work both independently and as part of a research team'
    ],
    benefits: [
      'Competitive entry-level salary',
      'Mentorship from experienced security researchers',
      'Professional development opportunities',
      'Exposure to policy networks and dialogues',
      'Healthcare benefits',
      'Support for further education and training'
    ],
    slug: 'junior-research-fellow-security-studies'
  },
  {
    id: 4,
    title: 'Research Fellow - Climate and Energy',
    level: 'Mid-Level',
    department: 'Climate and Energy',
    focus: 'Climate policy, energy transition',
    deadline: 'November 30, 2023',
    description: 'Conduct research on climate policy and energy transition in Indonesia and Southeast Asia. This position involves analyzing policy frameworks, assessing economic impacts, and developing recommendations for sustainable development.',
    longDescription: 'The Climate and Energy Research Fellow will focus on researching climate policy frameworks, energy transition strategies, and sustainable development pathways for Indonesia and Southeast Asia. This position offers an opportunity to contribute to policy-relevant research on one of the most pressing challenges facing the region, working at the intersection of environmental policy, economic development, and international cooperation.',
    requirements: 'Master\'s degree or Ph.D. in Environmental Policy, Energy Studies, or related field; 3+ years of research experience; knowledge of climate finance; ability to engage with stakeholders.',
    responsibilities: [
      'Conduct research on climate policy frameworks and energy transition in Southeast Asia',
      'Analyze the economic and social impacts of climate change and mitigation strategies',
      'Develop policy recommendations for sustainable development and low-carbon transitions',
      'Author reports, policy briefs, and articles on climate and energy issues',
      'Engage with government agencies, private sector, and civil society on climate policy',
      'Present research findings at conferences, workshops, and public events',
      'Contribute to fundraising for climate and energy research projects'
    ],
    qualifications: [
      'Master\'s degree or Ph.D. in Environmental Policy, Energy Studies, Climate Science, or related field',
      '3+ years of research experience in climate policy, energy transition, or related areas',
      'Knowledge of climate finance mechanisms and energy markets',
      'Familiarity with international climate frameworks and national policy instruments',
      'Strong analytical and quantitative skills',
      'Ability to engage effectively with diverse stakeholders',
      'Excellent writing and communication skills'
    ],
    benefits: [
      'Competitive salary package',
      'Research funding for fieldwork and conference attendance',
      'Opportunities to influence climate and energy policy',
      'Publication support in high-impact journals and policy outlets',
      'Networking opportunities with climate experts and policymakers',
      'Healthcare benefits and other allowances',
      'Professional development support'
    ],
    slug: 'research-fellow-climate-energy'
  }
];

interface ResearchPosition {
  id: number;
  title: string;
  level: string;
  department: string;
  focus: string;
  deadline: string;
  description: string;
  longDescription: string;
  requirements: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  slug: string;
}

export default function ResearchFellowDetailPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const [position, setPosition] = useState<ResearchPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundPosition = researchPositions.find(
      (pos) => pos.slug === slug
    );
    
    if (foundPosition) {
      setPosition(foundPosition as ResearchPosition);
    } else {
      // Handle not found
      router.push('/careers/research-fellow');
    }
  }, [slug, router]);
  
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };
  
  if (!position) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col max-w-3xl mx-auto">
            <Link 
              href="/careers/research-fellow" 
              className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
            >
              <FiArrowLeft className="mr-2" />
              Back to All Research Positions
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {position.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <FiAward className="mr-2" />
                <span>{position.level} Position</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                <span>Department: {position.department}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2" />
                <span>Applications Open Year-Round</span>
              </div>
            </div>
            
            <div className="bg-primary text-white px-4 py-2 inline-block mb-4">
              Now Accepting Applications
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Position Overview</h2>
                <p className="text-gray-600 mb-8">{position.longDescription}</p>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                <ul className="space-y-3 mb-8">
                  {position.responsibilities.map((responsibility: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{responsibility}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Qualifications</h3>
                <ul className="space-y-3 mb-8">
                  {position.qualifications.map((qualification: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{qualification}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
                <ul className="space-y-3">
                  {position.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About Our Research Fellowships</h2>
                <p className="text-gray-600 mb-4">
                  Research Fellows at CSIS Indonesia form the intellectual core of our think tank. Fellows conduct rigorous analysis, engage with policymakers, and contribute to public discourse through publications, media appearances, and events.
                </p>
                <p className="text-gray-600 mb-4">
                  Our research teams operate in a collaborative environment, with opportunities for interdisciplinary work and engagement with international networks of scholars and practitioners.
                </p>
                <div className="bg-primary/5 p-6 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Year-Round Applications</h3>
                  <p className="text-gray-600">
                    While we list specific application deadlines for positions, we accept applications on a rolling basis throughout the year. If you miss a deadline, your application will be considered for future openings in your area of expertise.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column: Application */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 sticky top-28">
                {submitted ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <FiSend className="text-green-600 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for your interest in the {position.title} position. We will review your application and contact you soon.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="w-full py-3 bg-primary text-white flex justify-center hover:bg-primary/90"
                    >
                      Apply for Another Position
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply Now</h2>
                    <form onSubmit={handleApply} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                          Current/Most Recent Position
                        </label>
                        <input
                          type="text"
                          id="current"
                          name="current"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                          Institution/University
                        </label>
                        <input
                          type="text"
                          id="institution"
                          name="institution"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                          Availability
                        </label>
                        <select
                          id="availability"
                          name="availability"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select your availability</option>
                          <option value="immediate">Immediate</option>
                          <option value="1-3_months">1-3 months</option>
                          <option value="3-6_months">3-6 months</option>
                          <option value="6+_months">6+ months</option>
                        </select>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Documents Required:
                        </p>
                        <div className="space-y-3">
                          <button
                            type="button"
                            className="w-full flex items-center justify-center py-3 border border-primary bg-white text-primary hover:bg-primary/5"
                          >
                            <FiDownload className="mr-2" />
                            Upload CV/Resume
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center justify-center py-3 border border-primary bg-white text-primary hover:bg-primary/5"
                          >
                            <FiDownload className="mr-2" />
                            Upload Cover Letter
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center justify-center py-3 border border-primary bg-white text-primary hover:bg-primary/5"
                          >
                            <FiDownload className="mr-2" />
                            Upload Research Statement
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center justify-center py-3 border border-primary bg-white text-primary hover:bg-primary/5"
                          >
                            <FiDownload className="mr-2" />
                            Upload Writing Sample
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-3 bg-primary text-white flex justify-center hover:bg-primary/90 ${
                            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Have Questions?</h3>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about the application process or the position, please contact our recruitment team.
                  </p>
                  <a
                    href="mailto:research-recruitment@csis.or.id"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    research-recruitment@csis.or.id
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Positions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Other Research Opportunities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchPositions
              .filter(pos => pos.id !== position.id)
              .slice(0, 3)
              .map(pos => (
                <div key={pos.id} className="bg-white p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pos.title}</h3>
                  <p className="text-primary font-medium mb-3">{pos.level} Position</p>
                  <p className="text-gray-600 mb-4">{pos.description}</p>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FiMapPin className="mr-2" />
                    <span>Department: {pos.department}</span>
                  </div>
                  <Link
                    href={`/careers/research-fellow/${pos.slug}`}
                    className="inline-flex items-center text-primary font-medium hover:text-primary/80"
                  >
                    View Details
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 