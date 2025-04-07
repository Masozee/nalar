'use client';

import { memo } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import dynamic from 'next/dynamic';

const PageLayout = dynamic(() => import('@/components/PageLayout'), { 
  ssr: true,
  loading: () => <div className="min-h-screen pt-20">Loading...</div>
});

function PrivacyPolicy() {
  return (
    <PageLayout
      title="Privacy Policy"
      description="Learn how we collect, use, and protect your personal information at CSIS Indonesia."
      heroImage="/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <FadeIn>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-8 text-gray-700">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Introduction</h2>
              <p className="text-gray-700">
                At CSIS Indonesia, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-3 text-gray-800">2.1 Personal Information</h3>
              <p className="text-gray-700">We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Subscribe to our newsletter</li>
                <li>Register for events</li>
                <li>Contact us through our website</li>
                <li>Apply for positions or fellowships</li>
              </ul>
              <p className="text-gray-700">This information may include:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Professional information</li>
                <li>Resume/CV (for job applications)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. How We Use Your Information</h2>
              <p className="text-gray-700">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Provide and maintain our services</li>
                <li>Send you newsletters and updates</li>
                <li>Process your event registrations</li>
                <li>Respond to your inquiries</li>
                <li>Evaluate job applications</li>
                <li>Improve our website and services</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Information Sharing</h2>
              <p className="text-gray-700">We do not sell or rent your personal information to third parties. We may share your information with:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Service providers who assist in our operations</li>
                <li>Event partners (with your consent)</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Your Rights</h2>
              <p className="text-gray-700">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">Email:</span> privacy@csis.or.id
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

export default memo(PrivacyPolicy); 