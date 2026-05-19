import CustomCursor from './components/CustomCursor/CustomCursor';
import FooterSpacerScene from './components/FooterSpacerScene/FooterSpacerScene';
import Hero from './components/Hero/Hero';
import Section from './components/Section/Section';
import { ProjectThumbProvider } from './components/ProjectThumb/ProjectThumb';
import ProjectRow from './components/ProjectRow/ProjectRow';
import ContactLink from './components/ContactLink/ContactLink';
import Footer from './components/Footer/Footer';
import { projects } from './data/projects';
import { contacts } from './data/contacts';
import './App.css';

function App() {
  return (
    <ProjectThumbProvider>
      <div className="app">
        <CustomCursor />
        <main className="content">
          <Hero />

          <Section id="projects" title="Projects">
            <div className="projects-list">
              {projects.map((project, i) => (
                <ProjectRow key={project.slug} project={project} index={i} />
              ))}
            </div>
          </Section>

          <Section id="contact" title="Contact">
            <div className="contact-split">
              <div className="contact-left">
                <h3 className="contact-name">
                  <span className="title-line">Nathan</span>
                  <br />
                  <span className="title-line outline">Champagne</span>
                </h3>
              </div>
              <div className="contact-right">
                <div className="contact-list">
                  {contacts.map((contact) => (
                    <ContactLink key={contact.name} {...contact} />
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </main>

        <FooterSpacerScene />
        <Footer />
      </div>
    </ProjectThumbProvider>
  );
}

export default App;
