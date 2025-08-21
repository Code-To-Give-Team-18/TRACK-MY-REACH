'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, Sparkles, Gift } from 'lucide-react';

interface DonationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function DonationSlider({ value, onChange }: DonationSliderProps) {
  const [isMonthly, setIsMonthly] = useState(false);
  
  const quickAmounts = [10, 25, 50, 100, 250];
  
  const getTierName = (amount: number) => {
    if (amount === 0) return 'Base State';
    if (amount < 10) return 'Getting Started';
    if (amount < 25) return 'Basic Supplies';
    if (amount < 50) return 'Learning Materials';
    if (amount < 100) return 'Comfort Improvements';
    if (amount < 250) return 'Enhanced Learning';
    return 'Complete Transformation';
  };
  
  const getTierColor = (amount: number) => {
    if (amount === 0) return 'from-gray-500 to-gray-600';
    if (amount < 25) return 'from-blue-500 to-blue-600';
    if (amount < 50) return 'from-green-500 to-green-600';
    if (amount < 100) return 'from-purple-500 to-purple-600';
    if (amount < 250) return 'from-pink-500 to-pink-600';
    return 'from-yellow-400 to-orange-500';
  };
  
  const getImpactItems = (amount: number) => {
    const items = [];
    if (amount >= 10) items.push('✏️ Pencils & Erasers');
    if (amount >= 15) items.push('📓 Notebooks');
    if (amount >= 25) items.push('📚 15 Picture Books');
    if (amount >= 50) items.push('🌀 Working Ceiling Fan');
    if (amount >= 100) items.push('🖊️ Modern Whiteboard');
    if (amount >= 250) items.push('🌟 Complete Renovation');
    return items;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
  };

  const handleQuickAmount = (amount: number) => {
    onChange(amount);
  };

  const effectiveAmount = isMonthly ? value * 1.2 : value;

  return (
    <>
      <style jsx>{`
        .donation-slider {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
          cursor: pointer;
        }

        .donation-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .donation-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
        }

        .donation-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .donation-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
        }
      `}</style>
      
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 w-80" data-ui-overlay="donation-slider">
        {/* Main Panel */}
        <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-1">
            Transform Ming&apos;s Classroom
          </h3>
          <p className="text-white/70 text-sm">
            Watch the magic happen in real-time
          </p>
        </div>

        {/* Current Amount Display */}
        <div className="mb-6 text-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${getTierColor(value)}`}
          >
            <span className="text-white text-3xl font-bold">
              ${effectiveAmount.toFixed(0)}
            </span>
            {isMonthly && (
              <span className="text-white/80 text-sm ml-2">/month</span>
            )}
          </motion.div>
          <p className="text-white/60 text-xs mt-2">{getTierName(value)}</p>
        </div>

        {/* Slider */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="500"
              value={value}
              onChange={handleSliderChange}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer donation-slider"
              style={{
                background: `linear-gradient(to right, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) ${(value / 500) * 100}%, rgba(255, 255, 255, 0.2) ${(value / 500) * 100}%, rgba(255, 255, 255, 0.2) 100%)`
              }}
            />
            
            {/* Tier markers */}
            <div className="absolute -top-1 left-0 right-0 flex justify-between pointer-events-none">
              {[0, 100, 200, 300, 400, 500].map((mark) => (
                <div
                  key={mark}
                  className="w-0.5 h-4 bg-white/30"
                  style={{ marginLeft: mark === 0 ? '0' : '-1px' }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <span className="text-white/50 text-xs">$0</span>
            <span className="text-white/50 text-xs">$500</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {quickAmounts.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAmount(amount)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                value === amount
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              ${amount}
            </motion.button>
          ))}
        </div>

        {/* Monthly Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg cursor-pointer hover:bg-black/40 transition-colors">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-white/80 text-sm">Donate Monthly</span>
              <span className="text-green-400 text-xs bg-green-400/20 px-2 py-0.5 rounded">
                +20% Impact
              </span>
            </div>
            <input
              type="checkbox"
              checked={isMonthly}
              onChange={(e) => setIsMonthly(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-10 h-5 rounded-full transition-colors ${
              isMonthly ? 'bg-green-500' : 'bg-white/20'
            }`}>
              <motion.div
                animate={{ x: isMonthly ? 20 : 0 }}
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full"
              />
            </div>
          </label>
        </div>

        {/* Impact Preview - Always Visible */}
        {value > 0 && (
          <div className="mb-4">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-2">You&apos;re providing:</p>
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {getImpactItems(effectiveAmount).map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-white/80 text-sm"
                    >
                      {item}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {getImpactItems(effectiveAmount).length === 0 && (
                <p className="text-white/50 text-sm italic">
                  Adjust amount to see impact
                </p>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-xs">Transformation Progress</span>
            <span className="text-white/80 text-xs font-medium">
              {Math.min((value / 250) * 100, 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min((value / 250) * 100, 100)}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
              className={`h-full bg-gradient-to-r ${getTierColor(value)}`}
            />
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all bg-gradient-to-r ${getTierColor(value)} shadow-lg`}
          disabled={value === 0}
        >
          {value === 0 ? 'Adjust Amount to Start' : `Make This Ming\'s Reality`}
        </motion.button>

        {/* Social Proof */}
        <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-xs">
          <Sparkles className="w-3 h-3" />
          <span>12 donors viewing now</span>
        </div>
      </motion.div>

      {/* Floating Tip */}
      {value > 0 && value < 25 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-16 left-0 right-0 bg-blue-500/20 backdrop-blur-md rounded-lg p-3 border border-blue-500/30"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <p className="text-white/80 text-xs">
              Just $15 more provides notebooks for the entire class!
            </p>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
}