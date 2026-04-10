import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CodeComparison } from '@/components/landing/CodeComparison';
import { StylePackDemo } from '@/components/landing/StylePackDemo';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'AIUI - AI Design Control Layer',
  description:
    'Control how AI builds your UI. Choose styles, components, and tokens from a visual console. Claude Code uses them automatically via MCP.',
};

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <Hero />
      <StatsBar />
      <FeatureGrid />
      <StylePackDemo />
      <HowItWorks />
      <CodeComparison />
      <CTA />
      <Footer />
    </>
  );
}
