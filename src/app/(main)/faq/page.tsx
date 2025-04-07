'use client';

import { useState, useCallback, memo } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const PageLayout = dynamic(() => import('@/components/PageLayout'), { 
  ssr: true,
  loading: () => <div className="min-h-screen pt-20">Loading...</div>
});

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is CSIS Indonesia?",
    answer: "CSIS Indonesia (Centre for Strategic and International Studies) is Indonesia's premier think tank established in 1971. We conduct research and provide policy recommendations on economics, politics, international relations, and security issues."
  },
  {
    question: "How can I access CSIS research publications?",
    answer: "You can access our research publications through our website's Publications section. Some publications are freely available, while others may require subscription or purchase. You can also visit our library at The Jakarta Post Building."
  },
  {
    question: "How can I attend CSIS events?",
    answer: "Most CSIS events are open to the public. You can register for events through our website's Events section. Some events may require prior registration or have limited capacity."
  },
  {
    question: "How can I apply for a position at CSIS?",
    answer: "We regularly post job openings on our Careers page. You can submit your application through the online application form. We accept applications for research fellows, analysts, and administrative positions."
  },
  {
    question: "How can I become a research fellow?",
    answer: "Research fellow positions are typically advertised on our Careers page. We look for candidates with strong academic backgrounds, research experience, and expertise in our focus areas. The application process includes submitting a CV, research proposal, and references."
  },
  {
    question: "Does CSIS offer internships?",
    answer: "Yes, CSIS offers internship opportunities for students and recent graduates. We have programs in research, communications, and administration. Check our Careers page for current internship openings."
  },
  {
    question: "How can I contact CSIS?",
    answer: "You can contact us through our website's Contact page, by email at info@csis.or.id, or by phone at +62 21 5365 4601. Our office is located at The Jakarta Post Building, Jl. Palmerah Barat 142-143, Jakarta 10270, Indonesia."
  },
  {
    question: "Does CSIS accept research collaborations?",
    answer: "Yes, CSIS welcomes research collaborations with academic institutions, think tanks, and other organizations. Please contact our research department at research@csis.or.id to discuss potential collaborations."
  }
];

// Memoized FAQ Item component to prevent unnecessary re-renders
const FAQItem = memo(({ faq, index, isOpen, onToggle }: { 
  faq: FAQItem; 
  index: number; 
  isOpen: boolean; 
  onToggle: (index: number) => void 
}) => (
  <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
    <button
      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg"
      onClick={() => onToggle(index)}
    >
      <span className="font-medium text-lg text-gray-800">{faq.question}</span>
      {isOpen ? (
        <FiChevronUp className="w-5 h-5 text-primary" />
      ) : (
        <FiChevronDown className="w-5 h-5 text-primary" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-4">
        <p className="text-gray-700">{faq.answer}</p>
      </div>
    )}
  </div>
));

FAQItem.displayName = 'FAQItem';

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = useCallback((index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  }, []);

  return (
    <PageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about CSIS Indonesia, our research, events, and opportunities."
      heroImage="/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg"
    >
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index} 
                faq={faq} 
                index={index} 
                isOpen={openIndex === index}
                onToggle={toggleFAQ} 
              />
            ))}
          </div>

          <div className="mt-12 p-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Still Have Questions?</h2>
            <p className="text-gray-700 mb-6">
              If you couldn&apos;t find the answer you&apos;re looking for, please don&apos;t hesitate to contact us.
            </p>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="font-medium w-20">Email:</span>
                <span className="text-gray-600">info@csis.or.id</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-20">Phone:</span>
                <span className="text-gray-600">+62 21 5365 4601</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium w-20">Address:</span>
                <span className="text-gray-600">The Jakarta Post Building, Jl. Palmerah Barat 142-143, Jakarta 10270, Indonesia</span>
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageLayout>
  );
}

export default memo(FAQ); 