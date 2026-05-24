import { CONTACT_EMAIL } from '../utils/env';

export type Contact = {
  name: string;
  id: string;
  href: string;
  copyValue: string;
};

export const contacts: Contact[] = [
  {
    name: 'LinkedIn',
    id: '/in/nathan-champagne',
    href: 'https://www.linkedin.com/in/nathan-champagne',
    copyValue: '/in/nathan-champagne',
  },
  {
    name: 'GitHub',
    id: '@Nchpg',
    href: 'https://github.com/Nchpg',
    copyValue: 'Nchpg',
  },
  {
    name: 'Email',
    id: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    copyValue: CONTACT_EMAIL,
  },
];
