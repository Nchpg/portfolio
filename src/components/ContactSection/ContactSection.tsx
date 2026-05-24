'use client';

import TitleLine from '../TitleLine/TitleLine';
import ContactLink from '../ContactLink/ContactLink';
import { contacts } from '../../data/contacts';
import { useInView } from '../../hooks/useInView';
import './ContactSection.css';

const ContactSection = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`contact-split${inView ? ' contact-split--visible' : ''}`}
    >
      <div>
        <h3 className="contact-name" aria-hidden="true">
          <TitleLine text="Nathan" />
          <br />
          <TitleLine text="Champagne" outline />
        </h3>
      </div>
      <div>
        <div className="contact-list">
          {contacts.map((contact) => (
            <ContactLink key={contact.name} {...contact} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
