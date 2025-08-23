'use client';

import { motion } from 'framer-motion';
import { User, UserX, Zap } from 'lucide-react';

export type DonationMode = 'quick' | 'guest' | 'standard';

interface DonationModeSelectorProps {
  mode: DonationMode;
  onModeChange: (mode: DonationMode) => void;
  isAuthenticated: boolean;
  childId?: string | null;
}

export function DonationModeSelector({ 
  mode, 
  onModeChange, 
  isAuthenticated,
  childId
}: DonationModeSelectorProps) {
  // If coming from quick donate (no childId), only show quick mode
  const isQuickDonateFlow = !childId;
  
  if (isQuickDonateFlow) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quick Donation</h3>
            <p className="text-sm text-gray-600">
              Support our general fund to help all children in need
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For child-specific donations, show mode options
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Choose Donation Method</h3>
      
      <div className="grid gap-3">
        {/* Standard Mode (only if authenticated) */}
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onModeChange('standard')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${mode === 'standard' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                mode === 'standard' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <User className={`h-5 w-5 ${
                  mode === 'standard' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Donate as Yourself</h4>
                <p className="text-sm text-gray-600">
                  Track your impact and get tax receipts
                </p>
              </div>
              {mode === 'standard' && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          </motion.button>
        )}

        {/* Guest Mode */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onModeChange('guest')}
          className={`
            p-4 rounded-lg border-2 transition-all text-left
            ${mode === 'guest' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              mode === 'guest' ? 'bg-purple-500' : 'bg-gray-100'
            }`}>
              <UserX className={`h-5 w-5 ${
                mode === 'guest' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Continue as Guest</h4>
              <p className="text-sm text-gray-600">
                Donate anonymously without creating an account
              </p>
            </div>
            {mode === 'guest' && (
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </div>
        </motion.button>
      </div>

      {!isAuthenticated && mode === 'standard' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Please sign in to donate with your account
          </p>
        </div>
      )}
    </div>
  );
}