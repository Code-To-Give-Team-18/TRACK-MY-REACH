'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import { HongKongMapOverhead } from '@/components/three/HongKongMapOverhead';
import { RegionSelector } from '@/components/checkout/RegionSelector';
import { StudentSelector } from '@/components/checkout/StudentSelector';
import { Heart, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { DonationMode } from '@/components/checkout/DonationModeSelector';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const regions = [
  { id: 'central', name: 'Central & Western', coordinates: [114.1544, 22.2824] as [number, number] },
  { id: 'eastern', name: 'Eastern', coordinates: [114.2229, 22.2824] as [number, number] },
  { id: 'southern', name: 'Southern', coordinates: [114.1600, 22.2400] as [number, number] },
  { id: 'wan-chai', name: 'Wan Chai', coordinates: [114.1751, 22.2775] as [number, number] },
  { id: 'kowloon-city', name: 'Kowloon City', coordinates: [114.1933, 22.3282] as [number, number] },
  { id: 'kwun-tong', name: 'Kwun Tong', coordinates: [114.2233, 22.3105] as [number, number] },
  { id: 'sham-shui-po', name: 'Sham Shui Po', coordinates: [114.1601, 22.3302] as [number, number] },
  { id: 'wong-tai-sin', name: 'Wong Tai Sin', coordinates: [114.1933, 22.3420] as [number, number] },
  { id: 'yau-tsim-mong', name: 'Yau Tsim Mong', coordinates: [114.1710, 22.3074] as [number, number] },
  { id: 'islands', name: 'Islands', coordinates: [113.9463, 22.2869] as [number, number] },
  { id: 'kwai-tsing', name: 'Kwai Tsing', coordinates: [114.0844, 22.3549] as [number, number] },
  { id: 'north', name: 'North', coordinates: [114.1392, 22.4956] as [number, number] },
  { id: 'sai-kung', name: 'Sai Kung', coordinates: [114.2708, 22.3832] as [number, number] },
  { id: 'sha-tin', name: 'Sha Tin', coordinates: [114.1952, 22.3793] as [number, number] },
  { id: 'tai-po', name: 'Tai Po', coordinates: [114.1646, 22.4507] as [number, number] },
  { id: 'tsuen-wan', name: 'Tsuen Wan', coordinates: [114.1143, 22.3717] as [number, number] },
  { id: 'tuen-mun', name: 'Tuen Mun', coordinates: [113.9722, 22.3908] as [number, number] },
  { id: 'yuen-long', name: 'Yuen Long', coordinates: [114.0324, 22.4456] as [number, number] },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const childId = searchParams.get('childId');
  const region = searchParams.get('region');
  const amount = searchParams.get('amount');
  const mode = searchParams.get('mode') as DonationMode | null;
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [childData, setChildData] = useState<any>(null);
  const [loadingChild, setLoadingChild] = useState(false);
  
  // Fetch child data if childId is provided
  useEffect(() => {
    const fetchChildData = async () => {
      if (childId && childId !== 'let-us-choose') {
        setLoadingChild(true);
        try {
          const response = await axios.get(`${API_URL}/api/v1/children/${childId}`);
          if (response.data) {
            setChildData(response.data);
            setSelectedStudent(childId);
            // Set the region from child data
            if (response.data.region_id) {
              setSelectedRegion(response.data.region_id);
            }
          }
        } catch (error) {
          console.error('Failed to fetch child data:', error);
          // If child not found, still set the student ID but no region
          setSelectedStudent(childId);
        } finally {
          setLoadingChild(false);
        }
      } else if (childId === 'let-us-choose') {
        setSelectedStudent('let-us-choose');
      } else if (mode === 'quick') {
        // For quick donations, no child is selected
        setSelectedStudent(null);
      }
    };
    
    fetchChildData();
  }, [childId, mode]);

  // Set initial values from URL parameters
  useEffect(() => {
    if (region && !childId) {
      setSelectedRegion(region);
    }
    if (amount) {
      const parsedAmount = parseInt(amount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        setDonationAmount(parsedAmount);
      }
    }
  }, [region, amount, childId]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Donation Header */}
        {mode === 'quick' && (
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Make a Quick Impact
            </h1>
            <p className="text-lg text-gray-600">
              Your donation will be distributed to children who need it most across all regions
            </p>
          </div>
        )}
        
        {/* Child-specific Header */}
        {childData && mode !== 'quick' && (
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Support {childData.name}
            </h1>
            <p className="text-lg text-gray-600">
              {childData.description || `Help ${childData.name} from ${childData.region_name || 'Hong Kong'} continue their education`}
            </p>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Payment Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'quick' ? 'Quick Donation' : 'Secure Payment'}
              </h2>
            </div>
            <CheckoutFlow
              amount={donationAmount}
              onAmountChange={setDonationAmount}
              childId={selectedStudent}
              regionId={selectedRegion}
              mode={mode || 'guest'}
            />
          </div>

          {/* Impact Section */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5" />
                <h2 className="text-xl font-bold">Your Impact</h2>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                  <div className="text-3xl font-bold">HK${donationAmount}</div>
                  <p className="text-xs mt-2 text-white/90">Your Donation</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                  <div className="text-3xl font-bold">
                    {Math.floor(donationAmount / 30)}
                  </div>
                  <p className="text-xs mt-2 text-white/90">Meals Provided</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                  <div className="text-3xl font-bold">
                    {Math.floor(donationAmount / 200)}
                  </div>
                  <p className="text-xs mt-2 text-white/90">School Kits</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
                <p className="text-sm text-center">
                  Every dollar counts! Your donation directly supports education and nutrition for children in need.
                </p>
              </div>
            </div>
          </div>

          {/* Map and Region Selection - Hide for quick donations */}
          {mode !== 'quick' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">
                  Choose Your Impact Area
                </h2>
              </div>
              <div className="h-[400px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden mb-4 shadow-inner relative">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500">Loading 3D Map...</div>
                  </div>
                }>
                  <HongKongMapOverhead
                    selectedRegion={selectedRegion}
                    onRegionSelect={setSelectedRegion}
                    regions={regions}
                  />
                </Suspense>
              </div>
              <RegionSelector
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionSelect={setSelectedRegion}
              />
            </div>
          )}

          {/* Student Selection - Hide for quick donations */}
          {mode !== 'quick' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">
                  Direct Your Support
                </h2>
              </div>
              <StudentSelector
                selectedRegion={selectedRegion}
                selectedStudent={selectedStudent || 'let-us-choose'}
                onStudentSelect={setSelectedStudent}
                initialChildId={childId || undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading checkout...</span>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}