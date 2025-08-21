import { useMemo } from 'react';

export interface DonationTier {
  tier: number;
  name: string;
  minAmount: number;
  maxAmount: number;
  description: string;
  items: string[];
  color: string;
  lightIntensity: number;
  ambientColor: string;
}

const DONATION_TIERS: DonationTier[] = [
  {
    tier: 0,
    name: 'Base State',
    minAmount: 0,
    maxAmount: 10,
    description: 'Worn classroom needing support',
    items: [],
    color: '#6b7280',
    lightIntensity: 0.3,
    ambientColor: '#4a5568'
  },
  {
    tier: 1,
    name: 'Basic Supplies',
    minAmount: 10,
    maxAmount: 25,
    description: 'Essential writing materials',
    items: ['Pencils', 'Erasers', 'Basic notebooks', 'Chalk'],
    color: '#3b82f6',
    lightIntensity: 0.5,
    ambientColor: '#60a5fa'
  },
  {
    tier: 2,
    name: 'Learning Materials',
    minAmount: 25,
    maxAmount: 50,
    description: 'Books and educational resources',
    items: ['Picture books', 'Educational posters', 'Art supplies'],
    color: '#10b981',
    lightIntensity: 0.7,
    ambientColor: '#34d399'
  },
  {
    tier: 3,
    name: 'Comfort Improvements',
    minAmount: 50,
    maxAmount: 100,
    description: 'Better learning environment',
    items: ['Ceiling fan', 'New curtains', 'Wall repairs', 'Better lighting'],
    color: '#8b5cf6',
    lightIntensity: 1.0,
    ambientColor: '#a78bfa'
  },
  {
    tier: 4,
    name: 'Enhanced Learning',
    minAmount: 100,
    maxAmount: 250,
    description: 'Modern educational tools',
    items: ['Whiteboard', 'Learning devices', 'Reading corner', 'Plants'],
    color: '#ec4899',
    lightIntensity: 1.3,
    ambientColor: '#f472b6'
  },
  {
    tier: 5,
    name: 'Complete Transformation',
    minAmount: 250,
    maxAmount: Infinity,
    description: 'Fully renovated classroom',
    items: ['Full renovation', 'Student artwork', 'Modern furniture', 'Clean windows'],
    color: '#f59e0b',
    lightIntensity: 1.5,
    ambientColor: '#fbbf24'
  }
];

export function useDonationTiers(donationAmount: number) {
  const currentTier = useMemo(() => {
    const tier = DONATION_TIERS.findIndex(
      t => donationAmount >= t.minAmount && donationAmount < t.maxAmount
    );
    return tier === -1 ? DONATION_TIERS.length - 1 : tier;
  }, [donationAmount]);

  const getTierConfig = (tier: number) => {
    return DONATION_TIERS[Math.min(tier, DONATION_TIERS.length - 1)];
  };

  const getTransformationProgress = () => {
    const current = DONATION_TIERS[currentTier];
    if (currentTier === DONATION_TIERS.length - 1) return 1;
    
    const progress = 
      (donationAmount - current.minAmount) / 
      (current.maxAmount - current.minAmount);
    
    return Math.min(Math.max(progress, 0), 1);
  };

  const getNextTierAmount = () => {
    if (currentTier === DONATION_TIERS.length - 1) return null;
    return DONATION_TIERS[currentTier].maxAmount;
  };

  const getItemsUnlocked = () => {
    return DONATION_TIERS
      .filter(t => t.tier <= currentTier)
      .flatMap(t => t.items);
  };

  return {
    currentTier,
    currentTierConfig: DONATION_TIERS[currentTier],
    getTierConfig,
    getTransformationProgress,
    getNextTierAmount,
    getItemsUnlocked,
    allTiers: DONATION_TIERS
  };
}