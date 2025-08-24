'use client';

import Link from 'next/link';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Youtube,
  Send,
  Shield,
  Award,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-b from-green-50 to-white pt-16 pb-8">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Stay Connected with Our Mission</h3>
            <p className="text-white/90 mb-8 text-lg">
              Get inspiring stories, impact updates, and ways to help delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
              />
              <Button
                type="submit"
                className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Project REACH</h4>
                <p className="text-sm text-gray-600">Every Child Deserves to Dream</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Dedicated to providing education, meals, and hope to underprivileged K3 students across Hong Kong. 
              Together, we're building brighter futures, one child at a time.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5 text-blue-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-100 hover:bg-pink-200 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-pink-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-sky-100 hover:bg-sky-200 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5 text-sky-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5 text-red-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-gray-800 mb-4">Get Involved</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/stories" className="text-gray-600 hover:text-green-600 transition-colors">
                  View Stories
                </Link>
              </li>
              <li>
                <Link href="/schools" className="text-gray-600 hover:text-green-600 transition-colors">
                  Partner Schools
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="text-gray-600 hover:text-green-600 transition-colors">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link href="/fundraise" className="text-gray-600 hover:text-green-600 transition-colors">
                  Fundraise
                </Link>
              </li>
              <li>
                <Link href="/monthly-giving" className="text-gray-600 hover:text-green-600 transition-colors">
                  Monthly Giving
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h5 className="font-bold text-gray-800 mb-4">About Us</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/about/mission" className="text-gray-600 hover:text-green-600 transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/about/team" className="text-gray-600 hover:text-green-600 transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/about/impact" className="text-gray-600 hover:text-green-600 transition-colors">
                  Impact Report
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-gray-600 hover:text-green-600 transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="text-gray-600 hover:text-green-600 transition-colors">
                  Transparency
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-gray-800 mb-4">Contact Us</h5>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm">
                  123 Charity Lane<br />
                  Central, Hong Kong
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                <a href="tel:+852-1234-5678" className="text-gray-600 hover:text-green-600 transition-colors">
                  +852 1234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                <a href="mailto:hello@reach.org.hk" className="text-gray-600 hover:text-green-600 transition-colors">
                  hello@reach.org.hk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Registered Charity</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Tax Deductible</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">100% Transparent</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Child-First Approach</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © 2024 REACH Foundation. All rights reserved. Made with ❤️ for Hong Kong's children
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Donation Encouragement */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-3 rounded-full">
            <Heart className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Your donation can change a life today
            </span>
            <Link href="/donate">
              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full px-4 py-1 text-xs">
                Donate Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}