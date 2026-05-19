import React from 'react';
import { CopyIcon } from '../icons';
import './ContactLink.css';

const ContactLink = ({ name, id, href, copyValue }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExternal = !href.startsWith('mailto:');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      className="contact-link"
    >
      <span className="link-name">{name}</span>
      <span className="link-id" onClick={handleCopy}>
        {copied ? (
          <span className="copied-text">Copied!</span>
        ) : (
          <>
            {id}
            <CopyIcon className="copy-icon" />
          </>
        )}
      </span>
    </a>
  );
};

export default ContactLink;
