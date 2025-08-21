import HeroSection from '@/components/landing/HeroSection';
import ImpactCounters from '@/components/landing/ImpactCounters';
import FeaturedChild from '@/components/landing/FeaturedChild';
import DonationCTA from '@/components/landing/DonationCTA';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ImpactCounters />
      <FeaturedChild />
      <DonationCTA />
    </main>
  );
}