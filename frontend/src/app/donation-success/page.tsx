'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Share2, Download, Home, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const donationId = searchParams.get('id');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleShare = (platform: string) => {
    const shareText = "I just made a donation to support K3 students in Hong Kong! Join me in making a difference.";
    const shareUrl = window.location.origin;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        break;
    }
  };

  const handleDownloadReceipt = () => {
    // In production, this would generate a PDF receipt
    console.log('Downloading receipt for donation:', donationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.2 
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-full mb-4"
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              Thank You for Your Generosity!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/90"
            >
              Your donation is making a real difference in children's lives
            </motion.p>
          </div>

          {/* Donation Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Impact Message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Your Impact</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Your donation will provide essential learning materials, nutritious meals, 
                  and educational support for K3 students in Hong Kong.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">School supplies delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Nutritious meals provided</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Learning opportunities created</span>
                  </div>
                </div>
              </motion.div>

              {/* Transaction Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-900">{donationId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownloadReceipt}
                  className="mt-4 w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </button>
              </motion.div>
            </div>

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Inspire Others to Make a Difference
                </h3>
                <p className="text-gray-600 mb-4">
                  Share your donation and encourage friends to support education
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Copy link"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/"
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                Back to Home
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                View Your Impact
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Want to do more? Consider{' '}
            <Link href="/donate" className="text-blue-600 hover:text-blue-700 font-medium">
              setting up monthly donations
            </Link>
            {' '}to provide ongoing support.
          </p>
        </motion.div>
      </div>
    </div>
  );
}