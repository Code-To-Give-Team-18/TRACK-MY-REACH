export interface Child {
  id: string;
  firstName: string;
  age: number;
  school: School;
  currentNeeds: Need[];
  updates: Update[];
  supporters: number;
  fundingProgress: number;
  profileImage?: string;
  story?: string;
}

export interface School {
  id: string;
  name: string;
  district: string;
  location: {
    lat: number;
    lng: number;
  };
  studentsCount: number;
  fundingGap: number;
  currentFunding: number;
  targetFunding: number;
  urgentNeeds?: string[];
}

export interface Need {
  id: string;
  type: 'meals' | 'books' | 'uniforms' | 'supplies' | 'technology';
  description: string;
  cost: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  quantity: number;
}

export interface Update {
  id: string;
  childId: string;
  type: 'milestone' | 'photo' | 'testimony' | 'artwork' | 'video';
  title: string;
  content: string;
  mediaUrl?: string;
  reactions: number;
  comments: Comment[];
  timestamp: Date;
  school?: string;
}

export interface Comment {
  id: string;
  donorId: string;
  donorName: string;
  content: string;
  timestamp: Date;
}

export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  joinedDate: Date;
  totalDonated: number;
  childrenSupported: Child[];
  badges: Badge[];
  donationStreak: number;
  lastDonationDate: Date;
  impactMetrics: {
    mealsProvided: number;
    booksDelivered: number;
    uniformsPurchased: number;
    childrenHelped: number;
  };
  district?: string;
  schoolSponsored?: School;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  type: 'donation' | 'engagement' | 'milestone' | 'special';
}

export interface Donation {
  id: string;
  amount: number;
  donorId: string;
  childId?: string;
  schoolId?: string;
  timestamp: Date;
  type: 'one-time' | 'monthly' | 'annual';
  allocation: {
    meals?: number;
    books?: number;
    uniforms?: number;
    supplies?: number;
  };
}

export interface ImpactStatistics {
  totalDonors: number;
  totalDonations: number;
  childrenSupported: number;
  mealsProvided: number;
  booksDelivered: number;
  uniformsPurchased: number;
  schoolsPartnered: number;
  monthlyGrowth: number;
}

export interface LeaderboardEntry {
  rank: number;
  donorName: string;
  district: string;
  totalDonated: number;
  childrenSupported: number;
  badges: Badge[];
  avatar?: string;
}