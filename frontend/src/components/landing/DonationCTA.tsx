'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const donationTiers = [
  { amount: 50, impact: '5 nutritious meals', popular: false },
  { amount: 100, impact: '10 books for learning', popular: true },
  { amount: 250, impact: '1 school uniform set', popular: false },
  { amount: 500, impact: 'Complete monthly support', popular: false }
];

export default function DonationCTA() {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Make a Difference Today</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Donation Creates Lasting Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every dollar counts. Choose an amount that works for you and see exactly how it helps.
            </p>
          </div>

          {/* Donation Amounts */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {donationTiers.map((tier) => (
                <motion.button
                  key={tier.amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedAmount(tier.amount);
                    setCustomAmount('');
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedAmount === tier.amount
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-2xl font-bold text-gray-900">
                    ${tier.amount}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {tier.impact}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter a custom amount
              </label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Impact Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Your Impact Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-700">
                      Your ${customAmount || selectedAmount} donation will provide immediate support
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-700">
                      100% goes directly to children&apos;s needs
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-700">
                      Join 500+ active donors in your community
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Donation Type */}
            <div className="flex gap-4 mb-6">
              <button className="flex-1 p-4 rounded-lg border-2 border-orange-500 bg-orange-50">
                <div className="font-semibold text-orange-600">One-time</div>
                <div className="text-sm text-gray-600">Make a single donation</div>
              </button>
              <button className="flex-1 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300">
                <div className="font-semibold text-gray-900">Monthly</div>
                <div className="text-sm text-gray-600">Become a regular supporter</div>
              </button>
            </div>

            {/* Action Button */}
            <Link href="/donate">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 text-lg font-semibold">
                Donate ${customAmount || selectedAmount} Now
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                🔒 Secure Payment
              </span>
              <span className="flex items-center gap-1">
                📋 Tax Deductible
              </span>
              <span className="flex items-center gap-1">
                ✅ Instant Receipt
              </span>
            </div>
          </div>

          {/* Recent Donations Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/50 backdrop-blur rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Recent donations</span>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                ))}
                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+12</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Anonymous</span> just donated $100 • 
              <span className="font-semibold"> Sarah L.</span> donated $50 • 
              <span className="font-semibold"> Mike T.</span> donated $250
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}