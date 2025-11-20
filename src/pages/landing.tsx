// src/pages/landing.tsx
import { Box, Stack } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { AIFeatureSection } from '@/components/landing/AIFeatureSection';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const getAnimationStyle = (sectionId: string, delay = 0) => {
    const isVisible = visibleSections[sectionId];
    return {
      opacity: isVisible ? 1 : 1,
      transform: isVisible ? 'translateY(0)' : 'translateY(0)',
      transition: isVisible ? `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s` : 'none',
    };
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Helmet>
        <title>VeroTime - Create, Customize & Share Timers Instantly</title>
        <meta name="description" content="Create and customize timers by uploading files or using AI-powered descriptions. Share timers in real-time with others for events, conferences, and study sessions. Free timer synchronization platform." />
        <meta name="keywords" content="timer, countdown, event timer, timer sharing, real-time sync, conference timer, study timer" />
        <meta property="og:title" content="VeroTime - Create & Share Timers in Real-Time" />
        <meta property="og:description" content="Easily create and customize timers by uploading files or using AI-powered descriptions. Share your timers instantly in real-time with others—ideal for managing events, conferences, study sessions, and more." />
        <meta property="og:image" content="/assets/image_saas.png" />
        <meta property="og:url" content="https://verotime.io" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VeroTime - Create & Share Timers in Real-Time" />
        <meta name="twitter:description" content="Create and customize timers by uploading files or using AI-powered descriptions. Share timers in real-time with others." />
        <meta name="twitter:image" content="/assets/image_saas.png" />
      </Helmet>

      {/* Animated Background Elements */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Gradient Orbs */}
        <Box
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 25s ease-in-out infinite',
            animationDelay: '5s',
          }}
        />
      </Box>

      {/* Header */}
      <Header onScrollToSection={scrollToSection} />

      <Stack gap={0} style={{ paddingTop: '70px', position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['hero'] = el;
          }}
        >
          <Hero
            onScrollToSection={scrollToSection}
            animationStyle={getAnimationStyle('hero')}
          />
        </div>

        {/* AI Feature Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['ai-feature'] = el;
          }}
        >
          <AIFeatureSection />
        </div>

        {/* Stats Section */}
        <Stats />

        {/* Features Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['features'] = el;
          }}
        >
          <Features
            animationStyle={getAnimationStyle('features')}
            onAnimationStyleChange={(delay) => getAnimationStyle('features', delay)}
          />
        </div>

        {/* Testimonials Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['testimonials'] = el;
          }}
        >
          <Testimonials
            animationStyle={getAnimationStyle('testimonials')}
            onAnimationStyleChange={(delay) => getAnimationStyle('testimonials', delay)}
          />
        </div>

        {/* Pricing Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['pricing'] = el;
          }}
        >
          <Pricing
            animationStyle={getAnimationStyle('pricing')}
            onAnimationStyleChange={(delay) => getAnimationStyle('pricing', delay)}
          />
        </div>

        {/* CTA Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['cta'] = el;
          }}
        >
          <CTA animationStyle={getAnimationStyle('cta')} />
        </div>

        {/* Footer Section */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current['footer'] = el;
          }}
        >
          <Footer onScrollToSection={scrollToSection} />
        </div>
      </Stack>

      {/* Add CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
