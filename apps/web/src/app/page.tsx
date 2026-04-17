import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CodeComparison } from '@/components/landing/CodeComparison';
import { Manifesto } from '@/components/landing/Manifesto';
import { StylePackDemo } from '@/components/landing/StylePackDemo';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'AIUI — design that doesn\u2019t drift',
  description:
    'A persistent design memory for your AI coding tools. Your tokens, your components, your rules — followed on every screen.',
};

export default function HomePage() {
  return (
    <main className="editorial">
      <LandingNav />
      <Hero />
      <StatsBar />
      <FeatureGrid />
      <StylePackDemo />
      <HowItWorks />
      <CodeComparison />
      <Manifesto />
      <CTA />
      <Footer />
    </main>
  );
}
