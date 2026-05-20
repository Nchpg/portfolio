import TitleLine from '../TitleLine/TitleLine';
import ContactLink from '../ContactLink/ContactLink';
import { contacts } from '../../data/contacts';
import './ContactSection.css';

const ContactSection = () => (
  <div className="contact-split">
    <div>
      <h3 className="contact-name">
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

export default ContactSection;
