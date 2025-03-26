'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import FadeIn from './animations/FadeIn';
import { 
  FiTwitter, 
  FiLinkedin, 
  FiFacebook, 
  FiInstagram, 
  FiYoutube, 
  FiMapPin, 
  FiPhone, 
  FiMail 
} from 'react-icons/fi';

// Social icon animation variants
const iconVariants = {
  hover: {
    scale: 1.1,
    y: -2,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

// Footer component using memo to prevent unnecessary re-renders
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and About */}
          <FadeIn>
            <div>
              <Link href="/" aria-label="CSIS Indonesia">
                <Image
                  src="/logo-white-full-apple.png"
                  alt="CSIS Indonesia"
                  width={200}
                  height={60}
                  className="mb-4"
                />
              </Link>
              <p className="text-white/80 mb-4">
                CSIS Indonesia is a leading think tank that conducts research and provides policy recommendations on economics, politics, international relations, and security issues.
              </p>
              <div className="flex space-x-4 mt-6">
                <motion.a 
                  href="https://twitter.com/csisindonesia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="text-white hover:text-white/80"
                >
                  <FiTwitter className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="https://www.linkedin.com/company/csis-indonesia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="text-white hover:text-white/80"
                >
                  <FiLinkedin className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="https://www.facebook.com/csisindonesia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="text-white hover:text-white/80"
                >
                  <FiFacebook className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="https://www.instagram.com/csisindonesia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="text-white hover:text-white/80"
                >
                  <FiInstagram className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="https://www.youtube.com/csisindonesia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="text-white hover:text-white/80"
                >
                  <FiYoutube className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
          </FadeIn>

          {/* Column 2: Quick Links */}
          <FadeIn delay={0.1}>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-white hover:text-white">
                    About CSIS
                  </Link>
                </li>
                <li>
                  <Link href="/experts" className="text-white/80 hover:text-white">
                    Our Experts
                  </Link>
                </li>
                <li>
                  <Link href="/publications" className="text-white/80 hover:text-white">
                    Publications
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-white/80 hover:text-white">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-white/80 hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </FadeIn>

          {/* Column 3: Research Areas */}
          <FadeIn delay={0.2}>
            <div>
              <h3 className="text-lg font-semibold mb-4">Research Areas</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/research/economics" className="text-white/80 hover:text-white">
                    Economics
                  </Link>
                </li>
                <li>
                  <Link href="/research/politics" className="text-white/80 hover:text-white">
                    Politics
                  </Link>
                </li>
                <li>
                  <Link href="/research/international-relations" className="text-white/80 hover:text-white">
                    International Relations
                  </Link>
                </li>
                <li>
                  <Link href="/research/security" className="text-white/80 hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/research/social-policy" className="text-white/80 hover:text-white">
                    Social Policy
                  </Link>
                </li>
              </ul>
            </div>
          </FadeIn>

          {/* Column 4: Contact */}
          <FadeIn delay={0.3}>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <FiMapPin className="mt-1 mr-2 flex-shrink-0 text-white/80" />
                  <span className="text-white/80">The Jakarta Post Building, Jl. Palmerah Barat 142-143, Jakarta 10270, Indonesia</span>
                </li>
                <li className="flex">
                  <FiPhone className="mt-1 mr-2 flex-shrink-0 text-white/80" />
                  <span className="text-white/80">+62 21 5365 4601</span>
                </li>
                <li className="flex">
                  <FiMail className="mt-1 mr-2 flex-shrink-0 text-white/80" />
                  <span className="text-white/80">info@csis.or.id</span>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 text-sm mb-4 md:mb-0">
              © {currentYear} CSIS Indonesia. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-white/80 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-white/80 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link href="/faq" className="text-white/80 hover:text-white text-sm">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer); 