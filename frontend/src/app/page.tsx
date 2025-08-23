import HeroSection from '@/components/landing/HeroSection';
import ImpactCounters from '@/components/landing/ImpactCounters';
import FeaturedChild from '@/components/landing/FeaturedChild';
import DonationCTA from '@/components/landing/DonationCTA';
import { CompactImpactVisualizer } from '@/components/home/CompactImpactVisualizer';
import UserStoriesSection from '@/components/landing/UserStories';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <UserStoriesSection />
      <FeaturedChild />
      <CompactImpactVisualizer />
      <ImpactCounters />
      <DonationCTA />
    </main>
  );
}