'use client';

import React from 'react';
import { CopyIcon } from '../icons';
import './ContactLink.css';

type Props = {
  name: string;
  id: string;
  href: string;
  copyValue: string;
};

const ContactLink = ({ name, id, href, copyValue }: Props) => {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    navigator.clipboard.writeText(copyValue).then(() => {
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const isExternal = !href.startsWith('mailto:');

  return (
    <div className="contact-link">
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
        className="link-name"
      >
        {name}
      </a>
      <button className="link-id" onClick={handleCopy} aria-label={copied ? `${id} copied` : `Copy ${id}`} aria-live="polite">
        {copied ? (
          <span className="copied-text">Copied!</span>
        ) : (
          <>
            {id}
            <CopyIcon className="copy-icon" />
          </>
        )}
      </button>
    </div>
  );
};

export default ContactLink;
