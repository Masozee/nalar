'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiCheckCircle, FiArrowLeft, FiDownload, FiSend, FiClock } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

// This would typically come from an API or database
const internshipPrograms = [
  {
    id: 1,
    title: 'Summer Internship Program',
    department: 'Various',
    duration: '8-12 weeks (June-August)',
    deadline: 'March 31, 2023',
    description: 'Our summer internship program offers undergraduate and graduate students opportunities to work with CSIS researchers on current policy issues affecting Indonesia and the region.',
    slug: 'summer-internship-program',
    longDescription: 'The CSIS Summer Internship Program is designed to provide hands-on experience in policy research and analysis. Interns will be assigned to specific research projects based on their background, skills, and interests. They will work closely with CSIS researchers and contribute to ongoing research initiatives, publications, and events.',
    qualifications: [
      'Currently enrolled in an undergraduate or graduate program',
      'Strong academic record',
      'Interest in policy research and Southeast Asian affairs',
      'Excellent writing and analytical skills',
      'Ability to work in a team environment'
    ],
    responsibilities: [
      'Assist with research projects under the guidance of CSIS researchers',
      'Collect and analyze data related to policy issues',
      'Contribute to the drafting of research reports and policy briefs',
      'Attend and assist with CSIS events and workshops',
      'Present research findings to CSIS staff at the end of the program'
    ],
    benefits: [
      'Monthly stipend',
      'Professional development workshops',
      'Networking opportunities with policy experts',
      'Exposure to policy research methods and practices',
      'Mentorship from experienced researchers'
    ]
  },
  {
    id: 2,
    title: 'Research Internship - Maritime Affairs',
    department: 'Maritime Affairs',
    duration: '3-6 months',
    deadline: 'November 15, 2023',
    description: 'Work with our Maritime Affairs department on research related to regional maritime security issues, freedom of navigation, and maritime boundary disputes.',
    slug: 'research-internship-maritime-affairs',
    longDescription: 'The Maritime Affairs Research Internship offers an opportunity to engage with critical maritime security issues affecting Indonesia and the broader region. Interns will support ongoing research on maritime boundaries, naval developments, fishing regulations, and other maritime governance issues in Southeast Asia.',
    qualifications: [
      'Background in international relations, security studies, or maritime law',
      'Knowledge of maritime security issues in Southeast Asia',
      'Strong research and analytical skills',
      'Ability to work with diverse sources of information',
      'Interest in naval affairs and maritime policy'
    ],
    responsibilities: [
      'Assist in monitoring maritime developments in the South China Sea and surrounding waters',
      'Contribute to research on maritime governance frameworks',
      'Collect and analyze data on naval capabilities and maritime incidents',
      'Support the drafting of policy briefs and reports on maritime security issues',
      'Attend relevant conferences and events related to maritime affairs'
    ],
    benefits: [
      'Monthly stipend',
      'Exposure to specialized maritime policy networks',
      'Participation in maritime security dialogues',
      'Skills development in geospatial analysis and maritime domain awareness',
      'Publication opportunities'
    ]
  },
  {
    id: 3,
    title: 'Economics Internship',
    department: 'Economics',
    duration: '3-6 months',
    deadline: 'January 15, 2024',
    description: 'Support CSIS economists in analyzing economic trends, trade policies, and development issues in Indonesia and Southeast Asia.',
    slug: 'economics-internship',
    longDescription: 'The Economics Internship at CSIS provides valuable experience in economic policy analysis and research. Interns will work with senior economists to examine macro and microeconomic trends, trade relations, development challenges, and other economic issues affecting Indonesia and Southeast Asia.',
    qualifications: [
      'Background in economics, international trade, or related fields',
      'Strong quantitative and analytical skills',
      'Familiarity with economic data sources and analysis tools',
      'Interest in economic development and policy in Southeast Asia',
      'Ability to communicate complex economic concepts clearly'
    ],
    responsibilities: [
      'Collect and analyze economic data',
      'Assist in economic modeling and forecasting',
      'Contribute to research on trade agreements and economic integration',
      'Support the preparation of economic policy briefs and reports',
      'Monitor economic developments and policy changes in the region'
    ],
    benefits: [
      'Monthly stipend',
      'Training in economic analysis tools and methods',
      'Participation in economic policy discussions',
      'Exposure to development economics practice',
      'Mentorship from experienced economists'
    ]
  },
  {
    id: 4,
    title: 'Political Analysis Internship',
    department: 'Politics and Social Change',
    duration: '3-6 months',
    deadline: 'February 28, 2024',
    description: 'Assist researchers in analyzing political developments, electoral politics, and social movements in Indonesia.',
    slug: 'political-analysis-internship',
    longDescription: 'The Political Analysis Internship focuses on understanding political dynamics, institutional developments, and social change in Indonesia. Interns will support research on electoral politics, democratic institutions, political parties, and social movements, contributing to CSIS\'s work on Indonesian politics and governance.',
    qualifications: [
      'Background in political science, Southeast Asian studies, or related fields',
      'Understanding of Indonesian political systems and history',
      'Strong analytical and writing skills',
      'Interest in electoral politics and democratic governance',
      'Ability to process diverse sources of political information'
    ],
    responsibilities: [
      'Monitor political developments in Indonesia',
      'Analyze electoral data and political trends',
      'Research political institutions and governance challenges',
      'Support the drafting of political analysis reports',
      'Assist with survey design and data collection for political research'
    ],
    benefits: [
      'Monthly stipend',
      'Exposure to political analysis methodology',
      'Networking with political researchers and practitioners',
      'Participation in political dialogues and forums',
      'Skills development in political risk assessment'
    ]
  }
];

interface InternshipProgram {
  id: number;
  title: string;
  department: string;
  duration: string;
  deadline: string;
  description: string;
  longDescription: string;
  qualifications: string[];
  responsibilities: string[];
  benefits: string[];
  slug: string;
}

export default function InternshipDetailPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const [program, setProgram] = useState<InternshipProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundProgram = internshipPrograms.find(
      (program) => program.slug === slug
    );
    
    if (foundProgram) {
      setProgram(foundProgram as InternshipProgram);
    } else {
      // Handle not found
      router.push('/careers/internship');
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
  
  if (!program) {
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
              href="/careers/internship" 
              className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
            >
              <FiArrowLeft className="mr-2" />
              Back to All Internships
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {program.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                <span>Department: {program.department}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiClock className="mr-2" />
                <span>Duration: {program.duration}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2" />
                <span>Application Open Year-Round</span>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                <p className="text-gray-600 mb-6">{program.longDescription}</p>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                <ul className="space-y-3 mb-8">
                  {program.responsibilities.map((responsibility: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{responsibility}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Qualifications</h3>
                <ul className="space-y-3 mb-8">
                  {program.qualifications.map((qualification: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{qualification}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
                <ul className="space-y-3">
                  {program.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Internship Program</h2>
                <p className="text-gray-600 mb-4">
                  The CSIS Indonesia Internship Program provides valuable hands-on experience for students and recent graduates interested in policy research and analysis. Our program is structured to provide meaningful work experience, professional development, and networking opportunities.
                </p>
                <p className="text-gray-600 mb-4">
                  Interns are matched with research projects and mentors based on their interests, skills, and career goals. Throughout the internship, participants receive regular feedback and guidance from experienced researchers.
                </p>
                <div className="bg-primary/5 p-6 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Year-Round Applications</h3>
                  <p className="text-gray-600">
                    While we list specific application deadlines for each cohort, we accept applications on a rolling basis throughout the year. If you miss a deadline, your application will be considered for the next available cycle.
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
                      Thank you for your interest in the {program.title} position. We will review your application and contact you soon.
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
                        <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                          University/Institution
                        </label>
                        <input
                          type="text"
                          id="university"
                          name="university"
                          required
                          className="w-full border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          id="field"
                          name="field"
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
                            Upload Resume/CV
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
                    If you have any questions about the application process or the internship program, please contact our recruitment team.
                  </p>
                  <a
                    href="mailto:internships@csis.or.id"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    internships@csis.or.id
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Internships */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Other Internship Opportunities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {internshipPrograms
              .filter(program => program.id !== program.id)
              .slice(0, 3)
              .map(program => (
                <div key={program.id} className="bg-white p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FiMapPin className="mr-2" />
                    <span>Department: {program.department}</span>
                  </div>
                  <Link
                    href={`/careers/internship/${program.slug}`}
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