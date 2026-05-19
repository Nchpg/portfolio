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
    href: 'https://linkedin.com/in/nathan-champagne',
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
    id: 'nathan.champagne@epita.fr',
    href: 'mailto:nathan.champagne@epita.fr',
    copyValue: 'nathan.champagne@epita.fr',
  },
];
