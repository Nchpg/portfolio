import { Suspense } from 'react';
import Section from '../components/Section/Section';
import { ProjectThumbProvider } from '../components/ProjectThumb/ProjectThumbContext';
import ContactSection from '../components/ContactSection/ContactSection';
import Footer from '../components/Footer/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import Hero from '../components/Hero/Hero';
import { CustomCursor, FooterSpacerScene } from '../components/ClientWidgets';
import ProjectListSkeleton from '../components/ProjectList/ProjectListSkeleton';

export default function Home({ children }: { children: React.ReactNode }) {
  return (
    <ProjectThumbProvider>
      <div className="app">
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
        <main className="content">
          <ErrorBoundary>
            <Hero />
          </ErrorBoundary>

          <Section id="projects" title="Projects" index={1}>
            <Suspense fallback={<ProjectListSkeleton />}>{children}</Suspense>
          </Section>

          <Section id="contact" title="Contact" index={2}>
            <ContactSection />
          </Section>
        </main>

        <ErrorBoundary>
          <Suspense fallback={<div style={{ height: '300px', background: 'var(--bg-color)' }} />}>
            <FooterSpacerScene />
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </ProjectThumbProvider>
  );
}
