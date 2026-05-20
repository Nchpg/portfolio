import ContactLink from '../ContactLink/ContactLink';
import { contacts } from '../../data/contacts';
import './ContactSection.css';

const ContactSection = () => (
  <div className="contact-split">
    <div>
      <h3 className="contact-name">
        <span className="title-line">Nathan</span>
        <br />
        <span className="title-line outline">Champagne</span>
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
