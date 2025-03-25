import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-secondary pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">CSIS Indonesia</h3>
            <p className="text-lg mb-4">
              Centre for Strategic and International Studies
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-foreground hover:text-primary text-2xl">
                <FiFacebook />
              </a>
              <a href="https://twitter.com" className="text-foreground hover:text-primary text-2xl">
                <FiTwitter />
              </a>
              <a href="https://instagram.com" className="text-foreground hover:text-primary text-2xl">
                <FiInstagram />
              </a>
              <a href="https://youtube.com" className="text-foreground hover:text-primary text-2xl">
                <FiYoutube />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Main Menu</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-lg hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/experts" className="text-lg hover:text-primary">
                  Experts
                </Link>
              </li>
              <li>
                <Link href="/publications" className="text-lg hover:text-primary">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-lg hover:text-primary">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-lg hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/news" className="text-lg hover:text-primary">
                  News
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="text-lg hover:text-primary">
                  Podcasts
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-lg hover:text-primary">
                  Data Dashboard
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-lg hover:text-primary">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-lg hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/publications/categories" className="text-lg hover:text-primary">
                  Publication Categories
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-lg">
                <FiMapPin className="mr-2" />
                <span>Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center text-lg">
                <FiPhone className="mr-2" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-center text-lg">
                <FiMail className="mr-2" />
                <span>info@csis.or.id</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/subscribe"
                className="inline-block border border-primary bg-primary/10 px-5 py-2 hover:bg-primary hover:text-white transition-colors duration-300"
              >
                Subscribe to Newsletter
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-300 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-lg mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} CSIS Indonesia. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy-policy" className="text-sm hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-sm hover:text-primary">
                Terms of Use
              </Link>
              <Link href="/sitemap" className="text-sm hover:text-primary">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 