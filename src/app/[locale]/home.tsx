import { Suspense } from "react";
import Section from "../../components/Section/Section";
import { ProjectThumbProvider } from "../../components/ProjectThumb/ProjectThumbContext";
import ContactSection from "../../components/ContactSection/ContactSection";
import Footer from "../../components/Footer/Footer";
import ErrorBoundary from "../../components/ErrorBoundary";
import Hero from "../../components/Hero/Hero";
import { FooterSpacerScene } from "../../components/ClientWidgets";
import ProjectListSkeleton from "../../components/ProjectList/ProjectListSkeleton";

type Props = {
  children: React.ReactNode;
  projectsTitle: string;
  contactTitle: string;
};

export default function Home({ children, projectsTitle, contactTitle }: Props) {
  return (
    <ProjectThumbProvider>
      <div className="app">
        <main className="content">
          <ErrorBoundary>
            <Hero />
          </ErrorBoundary>

          <Section id="projects" title={projectsTitle} index={1}>
            <Suspense fallback={<ProjectListSkeleton />}>{children}</Suspense>
          </Section>

          <Section id="contact" title={contactTitle} index={2}>
            <ContactSection />
          </Section>
        </main>

        <ErrorBoundary>
          <Suspense fallback={null}>
            <FooterSpacerScene />
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </ProjectThumbProvider>
  );
}
