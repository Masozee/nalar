'use client';

import Link from 'next/link';
import { FiArrowRight, FiCalendar, FiClock, FiMapPin, FiFileText, FiCheckCircle } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function InternshipPage() {
  const internshipPrograms = [
    {
      id: 1,
      title: 'Summer Internship Program',
      department: 'Various',
      duration: '8-12 weeks (June-August)',
      deadline: 'March 31, 2023',
      description: 'Our summer internship program offers undergraduate and graduate students opportunities to work with CSIS researchers on current policy issues affecting Indonesia and the region.',
      slug: 'summer-internship-program'
    },
    {
      id: 2,
      title: 'Research Internship - Maritime Affairs',
      department: 'Maritime Affairs',
      duration: '3-6 months',
      deadline: 'November 15, 2023',
      description: 'Work with our Maritime Affairs department on research related to regional maritime security issues, freedom of navigation, and maritime boundary disputes.',
      slug: 'research-internship-maritime-affairs'
    },
    {
      id: 3,
      title: 'Economics Internship',
      department: 'Economics',
      duration: '3-6 months',
      deadline: 'January 15, 2024',
      description: 'Support CSIS economists in analyzing economic trends, trade policies, and development issues in Indonesia and Southeast Asia.',
      slug: 'economics-internship'
    },
    {
      id: 4,
      title: 'Political Analysis Internship',
      department: 'Politics and Social Change',
      duration: '3-6 months',
      deadline: 'February 28, 2024',
      description: 'Assist researchers in analyzing political developments, electoral politics, and social movements in Indonesia.',
      slug: 'political-analysis-internship'
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
              Internship Opportunities
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our team and gain valuable experience in policy research, analysis, and advocacy.
            </p>
            <div className="bg-white p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Year-Round Applications</h2>
              <p className="text-gray-600">
                CSIS Indonesia accepts internship applications on a rolling basis throughout the year. Apply anytime for our internship programs and start your journey in policy research.
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
      
      {/* Internship Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Internship Program</h2>
            <p className="text-lg text-gray-600 mb-6">
              CSIS Indonesia&apos;s internship program provides students and recent graduates with hands-on experience in policy research and analysis. Interns work closely with our researchers, contributing to ongoing projects while developing professional skills in a supportive environment.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Our internships are designed to be substantive learning experiences that prepare participants for careers in research, policy analysis, international relations, and related fields.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 flex">
                <div className="mr-4 text-primary">
                  <FiClock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Duration</h3>
                  <p className="text-gray-600">Internships typically last 3-6 months, with both part-time and full-time options available.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex">
                <div className="mr-4 text-primary">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">Most internships are based at our Jakarta office, with some remote work options available.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex">
                <div className="mr-4 text-primary">
                  <FiCalendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Timing</h3>
                  <p className="text-gray-600">We offer internships year-round, with dedicated summer, fall, and spring cohorts.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex">
                <div className="mr-4 text-primary">
                  <FiFileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Compensation</h3>
                  <p className="text-gray-600">Internships include a monthly stipend to help with living expenses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* What You'll Do */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What You&apos;ll Do</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <FiCheckCircle className="text-primary w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Research Support</h3>
                  <p className="text-gray-600">Assist senior researchers with literature reviews, data collection, and analysis for ongoing research projects.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <FiCheckCircle className="text-primary w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Writing and Editing</h3>
                  <p className="text-gray-600">Contribute to research reports, policy briefs, and other publications under the guidance of CSIS staff.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <FiCheckCircle className="text-primary w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Event Support</h3>
                  <p className="text-gray-600">Help organize and participate in conferences, workshops, and other events hosted by CSIS.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <FiCheckCircle className="text-primary w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Professional Development</h3>
                  <p className="text-gray-600">Attend internal seminars, training sessions, and networking events to build skills and connections.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Intern Development Program</h3>
              <p className="text-gray-600 mb-4">
                All interns participate in our structured development program, which includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                <li>Weekly seminars with CSIS researchers and external experts</li>
                <li>Skills workshops covering research methods, policy writing, and data analysis</li>
                <li>Mentorship from experienced researchers</li>
                <li>Networking opportunities with policy professionals</li>
                <li>Final presentation of research work to CSIS staff</li>
              </ul>
              <p className="text-gray-600">
                Many of our former interns have gone on to successful careers in government, international organizations, academia, and the private sector.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current Internship Opportunities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Current Internship Opportunities</h2>
          
          <div className="space-y-6">
            {internshipPrograms.map(program => (
              <div key={program.id} className="bg-gray-50 p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                  <Link
                    href={`/careers/internship/${program.slug}`}
                    className="mt-2 md:mt-0 inline-flex items-center bg-primary py-2 px-4 text-white hover:bg-primary/90"
                  >
                    Apply Now
                  </Link>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600">{program.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-y-2">
                  <div className="w-full sm:w-1/2 lg:w-1/3 flex items-center text-gray-600">
                    <span className="font-medium mr-2">Department:</span> {program.department}
                  </div>
                  <div className="w-full sm:w-1/2 lg:w-1/3 flex items-center text-gray-600">
                    <span className="font-medium mr-2">Duration:</span> {program.duration}
                  </div>
                  <div className="w-full lg:w-1/3 flex items-center text-gray-600">
                    <span className="font-medium mr-2">Application Deadline:</span> {program.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Eligibility and Application */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Eligibility and Application Process</h2>
            
            <div className="bg-white p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Eligibility</h3>
              <p className="text-gray-600 mb-4">To qualify for a CSIS Indonesia internship, candidates typically need:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Current enrollment in or recent graduation from an undergraduate or graduate program</li>
                <li>Strong academic background in international relations, political science, economics, or related fields</li>
                <li>Excellent research, writing, and analytical skills</li>
                <li>Interest in Indonesian and Southeast Asian policy issues</li>
                <li>Proficiency in English (knowledge of Indonesian is a plus for some positions)</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Application Process</h3>
              <ol className="list-decimal list-inside space-y-4 text-gray-600">
                <li>
                  <span className="font-medium">Review Opportunities:</span> Browse current internship openings and select the position that best matches your interests and qualifications.
                </li>
                <li>
                  <span className="font-medium">Prepare Materials:</span> Gather required application materials, including:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Resume/CV</li>
                    <li>Cover letter explaining your interest in the specific internship</li>
                    <li>Academic transcript</li>
                    <li>Writing sample (1-3 pages)</li>
                    <li>Two references</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">Submit Application:</span> Complete the online application form for your chosen internship.
                </li>
                <li>
                  <span className="font-medium">Interview:</span> Shortlisted candidates will be invited for interviews with CSIS staff.
                </li>
                <li>
                  <span className="font-medium">Selection and Offer:</span> Selected candidates will receive an offer letter with details about start date, duration, and compensation.
                </li>
              </ol>
            </div>
            
            <div className="bg-primary/10 p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Apply?</h3>
              <p className="text-gray-600 mb-6">
                Browse our current internship opportunities and submit your application today. If you don&apos;t see a suitable position, you can also submit a general application for future consideration.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="#current-openings"
                  className="inline-flex items-center justify-center bg-primary py-3 px-6 text-white hover:bg-primary/90"
                >
                  View Openings
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