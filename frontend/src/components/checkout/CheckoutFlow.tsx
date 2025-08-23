'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { donationService, DonationResponse } from '@/services/donation.service';
import { DonationModeSelector, DonationMode } from './DonationModeSelector';
import { AlertCircle, CheckCircle, Loader2, ArrowRight, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutFlowProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  childId?: string | null;
  regionId?: string | null;
  mode?: DonationMode;
}

export function CheckoutFlow({ 
  amount, 
  onAmountChange, 
  childId,
  regionId,
  mode: initialMode = 'guest'
}: CheckoutFlowProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [donationMode, setDonationMode] = useState<DonationMode>(initialMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [donationResult, setDonationResult] = useState<DonationResponse | null>(null);
  
  // Payment details (would integrate with Stripe in production)
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  // Quick amount presets
  const quickAmounts = [50, 100, 200, 500, 1000];

  // Determine if this is a quick donation flow (no child selected)
  const isQuickFlow = !childId;

  useEffect(() => {
    // Set mode based on flow type and auth status
    if (isQuickFlow) {
      setDonationMode('quick');
    } else if (initialMode === 'standard' && !isAuthenticated) {
      setDonationMode('guest');
    }
  }, [isQuickFlow, initialMode, isAuthenticated]);

  const handleDonation = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let response: DonationResponse;
      
      // Mock transaction ID for demo (would come from payment processor)
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (donationMode === 'quick' || isQuickFlow) {
        // Quick donation - no child or user needed
        response = await donationService.createQuickDonation({
          amount,
          currency: 'HKD',
          payment_method: paymentMethod,
          transaction_id: transactionId
        });
        toast.success('Quick donation successful! Thank you for supporting all children.');
        
      } else if (donationMode === 'guest') {
        // Guest donation - requires child ID
        if (!childId) {
          throw new Error('Please select a child to support');
        }
        response = await donationService.createGuestDonation({
          child_id: childId,
          amount,
          currency: 'HKD',
          payment_method: paymentMethod,
          transaction_id: transactionId
        });
        toast.success('Guest donation successful! Your anonymous support makes a difference.');
        
      } else if (donationMode === 'standard') {
        // Standard donation - requires auth and child ID
        if (!isAuthenticated || !user) {
          throw new Error('Please sign in to make a standard donation');
        }
        if (!childId) {
          throw new Error('Please select a child to support');
        }
        response = await donationService.createStandardDonation({
          user_id: user.id,
          child_id: childId,
          amount,
          currency: 'HKD',
          payment_method: paymentMethod,
          transaction_id: transactionId
        });
        toast.success('Donation successful! Thank you for your continued support.');
      } else {
        throw new Error('Invalid donation mode');
      }

      setDonationResult(response);
      setSuccess(true);
      
      // Redirect to success page after delay
      setTimeout(() => {
        router.push(`/donation-success?id=${response.id}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Failed to process donation');
      toast.error(err.message || 'Failed to process donation');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success && donationResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-4">
          Your donation of HK${amount} has been processed successfully.
        </p>
        <p className="text-sm text-gray-500">
          Transaction ID: {donationResult.transaction_id}
        </p>
        <div className="mt-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader2 className="h-5 w-5 text-gray-400" />
          </motion.div>
          <p className="text-sm text-gray-500 mt-2">Redirecting to success page...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Donation Mode Selector */}
      {!isQuickFlow && (
        <DonationModeSelector
          mode={donationMode}
          onModeChange={setDonationMode}
          isAuthenticated={isAuthenticated}
          childId={childId}
        />
      )}

      {/* Amount Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Donation Amount (HKD)
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {quickAmounts.map((preset) => (
            <motion.button
              key={preset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAmountChange(preset)}
              className={`
                py-2 px-3 rounded-lg text-sm font-medium transition-all
                ${amount === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              ${preset}
            </motion.button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            HK$
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter custom amount"
            min="1"
          />
        </div>
      </div>

      {/* Guest Info (for guest donations) */}
      {donationMode === 'guest' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Name (Optional)
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name (will remain anonymous)"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email (Optional)
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="For receipt only (will remain private)"
            />
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['card', 'alipay', 'wechat'].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`
                py-2 px-3 rounded-lg border-2 transition-all capitalize
                ${paymentMethod === method
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {method === 'card' ? 'Credit Card' : method}
            </button>
          ))}
        </div>
      </div>

      {/* Mock Payment Details (for demo) */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 italic">
            Demo Mode: Enter any values for testing
          </p>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDonation}
        disabled={isProcessing || amount <= 0}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all
          flex items-center justify-center gap-2
          ${isProcessing || amount <= 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
          }
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Heart className="h-5 w-5" />
            Complete Donation of HK${amount}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>

      {/* Security Badge */}
      <div className="text-center text-xs text-gray-500">
        <p>🔒 Secure payment powered by Stripe</p>
        <p className="mt-1">Your donation is tax-deductible</p>
      </div>
    </div>
  );
}