'use client';

import Link from 'next/link';
import { FiArrowRight, FiCheck, FiBookOpen, FiGlobe, FiBarChart, FiAward, FiUsers } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function ResearchFellowPage() {
  const researchOpportunities = [
    {
      id: 1,
      title: 'Research Fellow - International Relations',
      level: 'Mid-Senior',
      department: 'International Relations',
      focus: 'Southeast Asia regional dynamics, ASEAN',
      deadline: 'August 30, 2023',
      description: 'Join our team as a Research Fellow specializing in International Relations. In this role, you will conduct in-depth analysis of Southeast Asian regional dynamics, with a focus on ASEAN cooperation mechanisms and regional security architecture.',
      requirements: 'Ph.D. in International Relations or related field; 3-5 years of research experience; strong publication record; experience in policy engagement.',
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
      requirements: 'Ph.D. in Economics; 7+ years of research experience; strong publication record; experience in policy advisory roles; project management skills.',
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
      requirements: 'Master&apos;s degree in International Security, Strategic Studies, or related field; 1-2 years of research experience; strong analytical skills; familiarity with regional security issues.',
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
      requirements: "Master&apos;s degree or Ph.D. in Environmental Policy, Energy Studies, or related field; 3+ years of research experience; knowledge of climate finance; ability to engage with stakeholders.",
      slug: 'research-fellow-climate-energy'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Research Fellowship Opportunities
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our research team and contribute to policy development and analysis in Indonesia and Southeast Asia.
            </p>
            <div className="bg-white p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Year-Round Applications</h2>
              <p className="text-gray-600">
                CSIS Indonesia accepts research fellowship applications throughout the year. While positions have deadlines, we evaluate applications on a rolling basis and maintain a database of qualified candidates for future openings.
              </p>
            </div>
            <div className="flex justify-center">
              <a 
                href="#positions" 
                className="bg-primary text-white py-3 px-6 hover:bg-primary/90"
              >
                View Open Positions
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Research Fellowships */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Research Fellowships</h2>
            <p className="text-lg text-gray-600 mb-6">
              Research Fellows at CSIS Indonesia form the core of our analytical capability. As a Fellow, you&apos;ll join a diverse team of experts working on pressing policy issues related to politics, economics, security, international relations, and sustainability.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Our Research Fellows conduct rigorous analysis, publish their findings, engage with policymakers, and contribute to public discourse through media appearances and events. We offer competitive packages, intellectual freedom, and the opportunity to influence policy at the highest levels.
            </p>
            
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Research Fellowship Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 h-full">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Junior Research Fellow</h4>
                  <p className="text-gray-600 mb-4">
                    Entry-level positions for early-career researchers with 1-2 years of experience. Junior Fellows work under the guidance of senior researchers while developing expertise in their field.
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Typical Requirements:</span> Master&apos;s degree in a relevant field.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 h-full">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Research Fellow</h4>
                  <p className="text-gray-600 mb-4">
                    Mid-level positions for experienced researchers who can lead projects and contribute significantly to research output. Fellows often specialize in particular policy areas.
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Typical Requirements:</span> Master&apos;s or Ph.D. with 3-5 years of experience.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 h-full">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Senior Research Fellow</h4>
                  <p className="text-gray-600 mb-4">
                    Advanced positions for established researchers who lead major programs, secure funding, and represent CSIS in high-level forums. Senior Fellows shape research agendas and mentor junior staff.
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Typical Requirements:</span> Ph.D. with 7+ years of experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Research Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Research Focus Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CSIS Indonesia maintains research programs in several key areas that are critical to Indonesia&apos;s development and its role in the region.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 h-full">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <FiGlobe className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">International Relations</h3>
              <p className="text-gray-600 mb-4">
                Research on diplomatic relations, regional cooperation, and global governance, with particular focus on ASEAN and Indo-Pacific dynamics.
              </p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>ASEAN Integration</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Indonesia&apos;s Foreign Policy</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Regional Security Architecture</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 h-full">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <FiBarChart className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Economics</h3>
              <p className="text-gray-600 mb-4">
                Analysis of economic trends, policies, and development strategies for Indonesia and the broader region.
              </p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Trade and Investment</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Economic Reform</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Development Economics</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 h-full">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <FiBookOpen className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Governance</h3>
              <p className="text-gray-600 mb-4">
                Research on democratic institutions, public policy, and governance reform in Indonesia.
              </p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Democratic Consolidation</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Public Policy Analysis</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Anti-Corruption Initiatives</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 h-full">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <FiAward className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Security Studies</h3>
              <p className="text-gray-600 mb-4">
                Analysis of traditional and non-traditional security challenges facing Indonesia and Southeast Asia.
              </p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Maritime Security</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Defense Policy</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Transnational Threats</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current Research Opportunities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Current Research Opportunities</h2>
          
          <div className="mb-10 bg-gray-50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What We Look For</h3>
            <p className="text-gray-600 mb-6">
              Our ideal research candidates demonstrate the following qualities:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiUsers className="text-primary" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Academic Excellence</h4>
                  <p className="text-gray-600">Strong academic background in relevant disciplines</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiUsers className="text-primary" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Research Expertise</h4>
                  <p className="text-gray-600">Demonstrated research experience with publication record</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiUsers className="text-primary" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Policy Engagement</h4>
                  <p className="text-gray-600">Ability to translate research into policy recommendations</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiUsers className="text-primary" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Communication Skills</h4>
                  <p className="text-gray-600">Excellent writing and presentation abilities</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {researchOpportunities.map(opportunity => (
              <div key={opportunity.id} className="bg-gray-50 p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                    <p className="text-primary font-medium mt-1">{opportunity.level} Position</p>
                  </div>
                  <Link
                    href={`/careers/research-fellow/${opportunity.slug}`}
                    className="mt-4 md:mt-0 inline-flex items-center bg-primary py-2 px-4 text-white hover:bg-primary/90"
                  >
                    Apply Now
                  </Link>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600">{opportunity.description}</p>
                </div>
                
                <div className="bg-white p-4 mb-4">
                  <h4 className="font-bold text-gray-800 mb-2">Key Requirements</h4>
                  <p className="text-gray-600">{opportunity.requirements}</p>
                </div>
                
                <div className="flex flex-wrap gap-y-2">
                  <div className="w-full sm:w-1/2 lg:w-1/3 flex items-center text-gray-600">
                    <span className="font-medium mr-2">Department:</span> {opportunity.department}
                  </div>
                  <div className="w-full sm:w-1/2 lg:w-1/3 flex items-center text-gray-600">
                    <span className="font-medium mr-2">Research Focus:</span> {opportunity.focus}
                  </div>
                  <div className="w-full lg:w-1/3 flex items-center text-gray-600">
                    <span className="font-medium mr-2">Application Deadline:</span> {opportunity.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits of Being a CSIS Research Fellow</h2>
            <p className="text-xl text-gray-600">
              CSIS Indonesia offers a supportive environment where researchers can thrive professionally and make meaningful contributions to policy discourse.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Development</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Research funding and support</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Conference participation</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Publication opportunities</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Advanced training programs</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Policy Influence</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Access to policymakers</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Media engagement opportunities</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Participation in high-level dialogues</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Contribution to policy processes</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compensation Package</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Competitive salary</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Healthcare benefits</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Research and travel allowances</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span>Flexible work arrangements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Application Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Application Process</h2>
            
            <ol className="space-y-6 mb-8">
              <li className="bg-gray-50 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white font-bold flex items-center justify-center mr-4">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submission</h3>
                    <p className="text-gray-600">
                      Submit your application package online, including CV/resume, research statement, writing samples, and references.
                    </p>
                  </div>
                </div>
              </li>
              
              <li className="bg-gray-50 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white font-bold flex items-center justify-center mr-4">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Initial Screening</h3>
                    <p className="text-gray-600">
                      Applications are reviewed by the recruitment committee to identify candidates who match our requirements.
                    </p>
                  </div>
                </div>
              </li>
              
              <li className="bg-gray-50 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white font-bold flex items-center justify-center mr-4">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Research Presentation</h3>
                    <p className="text-gray-600">
                      Shortlisted candidates are invited to present their research and ideas to CSIS researchers.
                    </p>
                  </div>
                </div>
              </li>
              
              <li className="bg-gray-50 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white font-bold flex items-center justify-center mr-4">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Interviews</h3>
                    <p className="text-gray-600">
                      Candidates participate in interviews with senior researchers, department heads, and leadership team members.
                    </p>
                  </div>
                </div>
              </li>
              
              <li className="bg-gray-50 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white font-bold flex items-center justify-center mr-4">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Selection and Offer</h3>
                    <p className="text-gray-600">
                      Final candidates receive an offer outlining position details, compensation, and start date.
                    </p>
                  </div>
                </div>
              </li>
            </ol>
            
            <div className="bg-primary/10 p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Apply?</h3>
              <p className="text-gray-600 mb-6">
                Browse our current research opportunities and submit your application today. If you don&apos;t see a suitable position, you can also submit a general application for future consideration.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="#current-openings"
                  className="inline-flex items-center justify-center bg-primary py-3 px-6 text-white hover:bg-primary/90"
                >
                  View Current Openings
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link 
                  href="/careers/general-application"
                  className="inline-flex items-center justify-center bg-white border border-primary py-3 px-6 text-primary hover:bg-gray-50"
                >
                  Submit General Application
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 