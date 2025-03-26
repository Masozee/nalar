'use client';

import Image from 'next/image';
import FadeIn from './animations/FadeIn';
import Footer from './Footer';
import { memo } from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  heroImage?: string;
  children: React.ReactNode;
}

function PageLayout({ title, description, heroImage, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with better positioning */}
      <div className="relative w-full mt-20" style={{ height: '300px' }}>
        <Image
          src={heroImage || '/bg/muska-create-5MvNlQENWDM-unsplash.png'}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <div className="text-center text-white px-4">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              {description && (
                <p className="text-lg md:text-xl max-w-2xl mx-auto">{description}</p>
              )}
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default memo(PageLayout); 