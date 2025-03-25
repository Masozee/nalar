'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-primary/10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-700">
              Get in touch with CSIS Indonesia. We welcome your inquiries and feedback.
            </p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                        <FiMapPin className="text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Address</h3>
                      <p className="mt-1 text-gray-600">
                        Centre for Strategic and International Studies<br />
                        Pakarti Centre Building<br />
                        Jl. Tanah Abang 3 No. 23-27<br />
                        Jakarta 10160, Indonesia
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                        <FiPhone className="text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                      <p className="mt-1 text-gray-600">+62 21 386 5532</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                        <FiMail className="text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      <p className="mt-1 text-gray-600">csis@csis.or.id</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Office Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Monday - Friday: 8:30 AM - 5:00 PM</p>
                    <p>Saturday - Sunday: Closed</p>
                    <p className="text-sm text-gray-500 mt-3">Public holidays: Closed</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
                
                {submitted ? (
                  <div className="bg-green-50 p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <FiSend className="text-green-600 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      Thank you for reaching out to us. We will get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-primary text-white py-2 px-4 hover:bg-primary/90"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="pl-10 block w-full border border-gray-300 py-3 focus:ring-primary focus:border-primary"
                            placeholder="Your name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="pl-10 block w-full border border-gray-300 py-3 focus:ring-primary focus:border-primary"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="block w-full border border-gray-300 py-3 pl-3 pr-10 focus:ring-primary focus:border-primary"
                      >
                        <option value="" disabled>Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Research Collaboration">Research Collaboration</option>
                        <option value="Event Information">Event Information</option>
                        <option value="Speaking Engagement">Speaking Engagement</option>
                        <option value="Media Request">Media Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                          <FiMessageSquare className="text-gray-400" />
                        </div>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="pl-10 block w-full border border-gray-300 py-3 focus:ring-primary focus:border-primary"
                          placeholder="Your message..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center py-3 bg-primary text-white hover:bg-primary/90 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? 'Sending...' : (
                          <>
                            <FiSend className="mr-2" />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Location</h2>
          <div className="h-96 w-full">
            <div className="relative h-full w-full bg-gray-200 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/10"></div>
              <div className="z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary flex items-center justify-center mb-4">
                  <FiMapPin className="text-white w-8 h-8" />
                </div>
                <div className="bg-white p-6 text-center max-w-md">
                  <h3 className="font-bold text-lg mb-2">CSIS Indonesia</h3>
                  <p className="text-gray-600">
                    Pakarti Centre Building<br />
                    Jl. Tanah Abang 3 No. 23-27<br />
                    Jakarta 10160, Indonesia
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a 
                      href="https://maps.google.com/?q=Pakarti+Centre+Building,+Jl.+Tanah+Abang+3+No.+23-27,+Jakarta+10160,+Indonesia" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80"
                    >
                      <span>Get Directions</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 