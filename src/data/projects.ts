export type LinkIcon = 'github' | 'link' | 'doc';

export type ProjectLinkItem = {
  href: string;
  icon: LinkIcon;
  label: string;
};

export type Project = {
  slug: string;
  previewExt: string;
  animatedThumb?: boolean;
  title: string;
  year: number;
  tags: string[];
  links: ProjectLinkItem[];
};

export const projects: Project[] = [
  {
    slug: 'hrevolution',
    previewExt: 'mp4',
    animatedThumb: true,
    title: 'HRévolution',
    year: 2024,
    tags: ['React', 'Python', 'GenAI'],
    links: [
      {
        href: 'https://github.com/Nchpg/HRFlow/tree/master/HEpiR-HREvolution',
        icon: 'github',
        label: 'GitHub',
      },
    ],
  },
  {
    slug: 'rlkart',
    previewExt: 'mp4',
    animatedThumb: true,
    title: 'RLkart',
    year: 2024,
    tags: ['Python', 'RL', 'PPO'],
    links: [
      { href: 'https://rlviewer.nathanchampagne.ddns.net/', icon: 'link', label: 'Live demo' },
      { href: 'https://github.com/Nchpg/RLkart', icon: 'github', label: 'GitHub' },
    ],
  },
  {
    slug: 'mnist',
    previewExt: 'mp4',
    animatedThumb: true,
    title: 'MNIST CNN from Scratch',
    year: 2023,
    tags: ['C++', 'Deep Learning'],
    links: [{ href: 'https://github.com/Nchpg/mnist-cnn-cpp', icon: 'github', label: 'GitHub' }],
  },
  {
    slug: 'ocr-sudoku',
    previewExt: 'mp4',
    animatedThumb: true,
    title: 'OCR Sudoku Solver',
    year: 2023,
    tags: ['C', 'GTK', 'OCR'],
    links: [{ href: '/projects/ocr-sudoku/report.pdf', icon: 'doc', label: 'Read report' }],
  },
  {
    slug: 'ms402',
    previewExt: 'mp4',
    animatedThumb: true,
    title: 'MS402',
    year: 2023,
    tags: ['C#', 'Unity'],
    links: [
      { href: 'https://a2nt.gitlab.io/ms-402-website/', icon: 'link', label: 'Visit website' },
      { href: '/projects/ms402/report.pdf', icon: 'doc', label: 'Read report' },
    ],
  },
  {
    slug: 'vim-airline',
    previewExt: 'webp',
    title: 'Vim Airline Theme',
    year: 2022,
    tags: ['Vimscript'],
    links: [
      {
        href: 'https://github.com/Nchpg/Vim-Airline-Powerline-Theme',
        icon: 'github',
        label: 'GitHub',
      },
    ],
  },
  {
    slug: 'advent-of-code',
    previewExt: 'mp4',
    animatedThumb: true,
    title: 'Advent of Code',
    year: 2024,
    tags: ['Python'],
    links: [{ href: 'https://github.com/Nchpg/Advent-of-Code', icon: 'github', label: 'GitHub' }],
  },
  {
    slug: 'previous-portfolio',
    previewExt: 'webp',
    title: 'Previous Portfolio',
    year: 2022,
    tags: ['HTML', 'JS', 'Three.js'],
    links: [{ href: 'https://github.com/Nchpg/portfolio-epita', icon: 'github', label: 'GitHub' }],
  },
];
