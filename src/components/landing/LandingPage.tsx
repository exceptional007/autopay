import React from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { TheLeak } from './TheLeak';
import { HowItWorks } from './HowItWorks';
import { PwaShowcase } from './PwaShowcase';
import { ProductFeatures } from './ProductFeatures';
import { PdfExportShowcase } from './PdfExportShowcase';
import { TrustNote } from './TrustNote';
import { LiveStats } from './LiveStats';
import { FaqSection } from './FaqSection';
import { FinalCta } from './FinalCta';
import { Footer } from './Footer';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateSignup?: () => void;
  onNavigateApp: () => void;
  onSignOut?: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateSignup,
  onNavigateApp,
  onSignOut,
  isAuthenticated,
  userEmail,
  isDarkMode,
  onToggleTheme,
}) => {
  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      onNavigateApp();
    } else if (onNavigateSignup) {
      onNavigateSignup();
    } else {
      onNavigateLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19] text-[#111827] dark:text-white selection:bg-[#10B981]/20 selection:text-[#10B981] flex flex-col font-sans transition-colors duration-300">
      {/* Sticky Navigation matching existing theme */}
      <Navbar
        onNavigateLogin={onNavigateLogin}
        onNavigateSignup={onNavigateSignup}
        onNavigateApp={onNavigateApp}
        onSignOut={onSignOut}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* Authenticated quick banner if user lands on "/" while logged in */}
        {isAuthenticated && (
          <div className="bg-[#10B981] text-white py-2 px-4 text-center font-mono text-xs flex items-center justify-center gap-2 shadow-sm">
            <span>Welcome back ({userEmail || 'Active Commuter'}).</span>
            <button
              type="button"
              onClick={onNavigateApp}
              className="underline font-bold hover:text-white/80 cursor-pointer"
            >
              Open Your Ledger →
            </button>
          </div>
        )}

        {/* 1. Hero with Printing Thermal Receipt */}
        <Hero
          onStartTracking={handlePrimaryAction}
          isAuthenticated={isAuthenticated}
        />

        {/* 2. The Problem / The Leak */}
        <TheLeak />

        {/* 3. Operational Simplicity: How It Works */}
        <HowItWorks />

        {/* 4. The Centerpiece: The PWA Showcase */}
        <PwaShowcase onOpenApp={onNavigateApp} />

        {/* 5. What You Actually Get (Real Product Features) */}
        <ProductFeatures />

        {/* 6. Highlighted PDF Export Feature & Side-by-Side Glimpse */}
        <PdfExportShowcase />

        {/* 7. Factual Privacy & Trust Note */}
        <TrustNote />

        {/* 8. Live Product Statistics ("AutoPay in numbers") */}
        <LiveStats />

        {/* 9. Frequently Asked Questions */}
        <FaqSection />

        {/* 8. Final Actionable CTA */}
        <FinalCta
          onStartTracking={handlePrimaryAction}
          isAuthenticated={isAuthenticated}
        />
      </main>

      {/* 9. Minimalist Footer */}
      <Footer
        onNavigateLogin={onNavigateLogin}
        onNavigateApp={onNavigateApp}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};
