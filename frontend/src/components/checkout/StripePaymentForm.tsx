'use client';

import { useState } from 'react';
import { CreditCard, Lock, Shield, Zap } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  selectedRegion: string;
  selectedStudent: string;
  onSuccess: () => void;
}

export function StripePaymentForm({
  amount,
  onAmountChange,
  selectedRegion,
  selectedStudent,
  onSuccess,
}: StripePaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const predefinedAmounts = [50, 100, 200, 500, 1000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Choose Your Impact
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {predefinedAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onAmountChange(preset)}
                className={`relative py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  amount === preset
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70 border border-gray-200'
                }`}
              >
                ${preset}
                {preset === 100 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              HK$
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(Number(e.target.value))}
              className="w-full pl-14 pr-4 py-4 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="Enter custom amount"
              min="1"
              required
            />
            <Zap className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
          </div>
        </div>

        {/* Donor Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            Your Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="Full Name"
                required
              />
            </div>
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="Email Address"
                required
              />
            </div>
          </div>
        </div>

        {/* Card Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            Payment Details
            <Shield className="h-4 w-4 text-green-500 ml-auto" />
            <span className="text-xs text-gray-500 font-normal">Secure & Encrypted</span>
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="expiry"
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div className="relative">
                <input
                  id="cvv"
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-4 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="CVV"
                  maxLength={4}
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedRegion && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              Ready to Make an Impact
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Donation Amount</span>
                <span className="font-bold text-lg text-blue-600">HK${amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Supporting Region</span>
                <span className="font-medium px-2 py-1 bg-white rounded-lg text-xs">
                  {selectedRegion || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Beneficiary</span>
                <span className="font-medium text-xs">
                  {selectedStudent === 'let-us-choose' ? '✨ Let us choose' : selectedStudent}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !selectedRegion}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform flex items-center justify-center gap-3 ${
            isProcessing || !selectedRegion
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Processing Payment...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Complete Donation • HK${amount}
            </>
          )}
        </button>

        {!selectedRegion && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-amber-800">
              Please select a region on the right to continue →
            </p>
          </div>
        )}
      </form>
    </div>
  );
}