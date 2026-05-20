export type LinkIcon = 'github' | 'link' | 'doc';

export type ProjectLinkItem = {
  href: string;
  icon: LinkIcon;
  label: string;
};

export type Project = {
  slug: string;
  previewExt: string;
  animatedThumbnail?: boolean;
  title: string;
  description: string;
  tags: string[];
  links: ProjectLinkItem[];
};

export const projects: Project[] = [
  {
    slug: 'hrevolution',
    previewExt: 'mp4',
    animatedThumbnail: true,
    title: 'HRévolution',
    description:
      '2nd place at the HrFlow.ai GenAI & HR Hackathon. Platform for continuous analysis of job applications, leveraging GenAI for explainable scoring and tagging.',
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
    animatedThumbnail: true,
    title: 'RLkart',
    description:
      'Kart racing simulation powered by Reinforcement Learning. Custom web-based track editor and AI agent trained with PPO and PyBullet physics.',
    tags: ['Python', 'RL', 'PPO'],
    links: [
      { href: 'https://rlviewer.nathanchampagne.ddns.net/', icon: 'link', label: 'Live demo' },
      { href: 'https://github.com/Nchpg/RLkart', icon: 'github', label: 'GitHub' },
    ],
  },
  {
    slug: 'mnist',
    previewExt: 'mp4',
    animatedThumbnail: true,
    title: 'MNIST CNN from Scratch',
    description:
      'Implementation of a Convolutional Neural Network from scratch in C++ to classify the MNIST handwritten digit dataset.',
    tags: ['C++', 'Deep Learning'],
    links: [{ href: 'https://github.com/Nchpg/mnist-cnn-cpp', icon: 'github', label: 'GitHub' }],
  },
  {
    slug: 'ocr-sudoku',
    previewExt: 'mp4',
    animatedThumbnail: true,
    title: 'OCR Sudoku Solver',
    description:
      'Uses Optical Character Recognition to load a Sudoku image, extract the digits, and applies AI algorithms to solve the puzzle.',
    tags: ['C', 'GTK', 'OCR'],
    links: [{ href: '/projects/ocr-sudoku/report.pdf', icon: 'doc', label: 'Read report' }],
  },
  {
    slug: 'ms402',
    previewExt: 'mp4',
    animatedThumbnail: true,
    title: 'MS402',
    description:
      'Multiplayer video game developed in Unity. Full gameplay loop, networking and level design.',
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
    description: 'A minimal airline theme for VIM inspired by lightline.',
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
    animatedThumbnail: true,
    title: 'Advent of Code',
    description:
      'My Advent of Code solutions - an annual programming challenge with daily puzzles throughout December.',
    tags: ['Python'],
    links: [{ href: 'https://github.com/Nchpg/Advent-of-Code', icon: 'github', label: 'GitHub' }],
  },
  {
    slug: 'previous-portfolio',
    previewExt: 'webp',
    title: 'Previous Portfolio',
    description: 'My first portfolio built in vanilla HTML/CSS/JS with a touch of Three.js.',
    tags: ['HTML', 'JS', 'Three.js'],
    links: [{ href: 'https://github.com/Nchpg/portfolio-epita', icon: 'github', label: 'GitHub' }],
  },
];
