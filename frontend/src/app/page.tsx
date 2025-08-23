import HeroSection from '@/components/landing/HeroSection';
import ImpactCounters from '@/components/landing/ImpactCounters';
import FeaturedChild from '@/components/landing/FeaturedChild';
import DonationCTA from '@/components/landing/DonationCTA';
import { CompactImpactVisualizer } from '@/components/home/CompactImpactVisualizer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      {/* <FeaturedChild />; */}
      <CompactImpactVisualizer />
      <ImpactCounters />
      <DonationCTA />
    </main>
  );
}