'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Menu,
  X,
  ChevronDown,
  Users,
  School,
  BookOpen,
  TrendingUp,
  Phone,
  User,
  LogOut,
  HandHeart,
  Settings,
  LayoutDashboard,
  Plus
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  {
    label: 'Stories',
    href: '/stories',
    icon: Heart
  },
  {
    label: 'About Us',
    href: '/about',
    icon: Users
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: Phone
  }
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isAuthenticated, user, signOut } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
        }`}
    >
      <div className="w-full px-4 lg:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-20">
          {/* Logo - Fixed Width for Balance */}
          <div className="flex-shrink-0 w-40 lg:w-48">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  REACH
                </h1>
                <p className="text-xs text-gray-600">Every Child Matters</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-6 lg:gap-10">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors font-medium ${pathname === item.href ? 'text-orange-600' : ''
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Donate Section - Fixed Width for Balance */}
          <div className="hidden md:flex items-center justify-end gap-3 lg:gap-4 flex-shrink-0 w-40 lg:w-48">
            <Link href="/checkout_iv">
              <Button
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-4 lg:px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                size="sm"
              >
                <Heart className="w-4 h-4 mr-1 lg:mr-2 animate-pulse" />
                <span>Donate Now</span>
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg transition-shadow"
                >
                  {getUserInitials(user.name || 'U')}
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {getUserInitials(user.name || 'U')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">My Profile</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">Admin Dashboard</span>
                          </Link>
                        )}


                        {/*Show "Post Management" only if the user is an admin*/}
                        {user.role === 'admin' && (
                          <Link
                            href="/post-management"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">Post Management</span>
                          </Link>
                        )}
        
                        {user.role === 'admin' && (
                          <Link
                            href="/children-management"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                          >
                            <HandHeart className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">Children Management</span>
                          </Link>
                        )}


                        <Link
                          href="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Settings</span>
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 w-full hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-gray-100">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 py-6">
              {/* Mobile Navigation Items */}
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors ${pathname === item.href ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Auth/Donate Section */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                          {getUserInitials(user.name || 'U')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Button>
                    </Link>

                    {user.role === 'admin' && (
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-full justify-start">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}


                    {user.role === 'admin' && (
                      <Link href="/post-management" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-full justify-start">
                          <Plus className="w-4 h-4 mr-2" />
                          Post Management
                        </Button>
                      </Link>
                    )}
        
                    {user.role === 'admin' && (
                      <Link
                        href="/children-management"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors"
                      >
                        <HandHeart className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Children Management</span>
                      </Link>
                    )}
                    

                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full rounded-full hover:border-red-300 hover:text-red-600 justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}

                <Link href="/checkout_iv" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full shadow-lg">
                    <Heart className="w-4 h-4 mr-2 animate-pulse" />
                    Donate Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}