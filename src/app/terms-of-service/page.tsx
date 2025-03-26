'use client';

import { memo } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import dynamic from 'next/dynamic';

const PageLayout = dynamic(() => import('@/components/PageLayout'), { 
  ssr: true,
  loading: () => <div className="min-h-screen pt-20">Loading...</div>
});

function TermsOfService() {
  return (
    <PageLayout
      title="Terms of Service"
      description="Please read these terms carefully before using our website and services."
      heroImage="/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <FadeIn>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-8 text-gray-700">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing and using the CSIS Indonesia website, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Intellectual Property</h2>
              <p className="text-gray-700">
                The content on this website, including but not limited to text, graphics, logos, images, and research publications, is the property of CSIS Indonesia and is protected by copyright laws.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Use License</h2>
              <p className="text-gray-700">Permission is granted to temporarily download one copy of the materials (information or software) on CSIS Indonesia&apos;s website for personal, non-commercial transitory viewing only.</p>
              <p className="mt-2 text-gray-700">This license shall automatically terminate if you violate any of these restrictions and may be terminated by CSIS Indonesia at any time.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. User Responsibilities</h2>
              <p className="text-gray-700">As a user of our website, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Provide accurate information when registering or submitting forms</li>
                <li>Maintain the security of your account</li>
                <li>Not use the website for any illegal purposes</li>
                <li>Not attempt to gain unauthorized access to any part of the website</li>
                <li>Not interfere with the proper working of the website</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Disclaimer</h2>
              <p className="text-gray-700">
                The materials on CSIS Indonesia&apos;s website are provided on an &apos;as is&apos; basis. CSIS Indonesia makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Limitations</h2>
              <p className="text-gray-700">
                In no event shall CSIS Indonesia or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CSIS Indonesia&apos;s website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Revisions and Errata</h2>
              <p className="text-gray-700">
                The materials appearing on CSIS Indonesia&apos;s website could include technical, typographical, or photographic errors. CSIS Indonesia does not warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Links</h2>
              <p className="text-gray-700">
                CSIS Indonesia has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by CSIS Indonesia of the site.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Modifications</h2>
              <p className="text-gray-700">
                CSIS Indonesia may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Governing Law</h2>
              <p className="text-gray-700">
                These terms and conditions are governed by and construed in accordance with the laws of Indonesia and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">Email:</span> legal@csis.or.id
                </p>
                <p>
                  <span className="font-medium">Address:</span> The Jakarta Post Building, Jl. Palmerah Barat 142-143, Jakarta 10270, Indonesia
                </p>
              </div>
            </section>
          </div>
        </FadeIn>
      </div>
    </PageLayout>
  );
}

export default memo(TermsOfService); 