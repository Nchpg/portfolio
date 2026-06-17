export type LinkIcon = "github" | "link" | "doc";

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
  year: number | string;
  tags: string[];
  links: ProjectLinkItem[];
};

export const projects: Project[] = [
  {
    slug: "hrevolution",
    previewExt: "mp4",
    animatedThumb: true,
    title: "HRévolution",
    year: 2026,
    tags: ["React", "Python", "GenAI"],
    links: [
      {
        href: "https://github.com/Nchpg/HRFlow/tree/master/HEpiR-HREvolution",
        icon: "github",
        label: "GitHub",
      },
    ],
  },
  {
    slug: "rlkart",
    previewExt: "mp4",
    animatedThumb: true,
    title: "RLkart",
    year: 2026,
    tags: ["Python", "RL", "PPO"],
    links: [
      {
        href: "https://rlkart.nathanchampagne.com/",
        icon: "link",
        label: "Try it",
      },
      {
        href: "https://github.com/Nchpg/RLkart",
        icon: "github",
        label: "GitHub",
      },
    ],
  },
  {
    slug: "mnist",
    previewExt: "mp4",
    animatedThumb: true,
    title: "MNIST CNN from Scratch",
    year: 2026,
    tags: ["C++", "Deep Learning"],
    links: [
      {
        href: "https://mnist.nathanchampagne.com/",
        icon: "link",
        label: "Try it",
      },
      {
        href: "https://github.com/Nchpg/mnist-cnn-cpp",
        icon: "github",
        label: "GitHub",
      },
    ],
  },
  {
    slug: "portfolio",
    previewExt: "webp",
    title: "Portfolio",
    year: 2026,
    tags: ["Next.js", "TypeScript", "Three.js"],
    links: [
      {
        href: "https://github.com/Nchpg/portfolio",
        icon: "github",
        label: "GitHub",
      },
    ],
  },
  {
    slug: "nixos-config",
    previewExt: "webp",
    title: "NixOS Config & Infra",
    year: "2024-2026",
    tags: ["NixOS", "Linux", "Docker", "Nginx", "Cloudflare"],
    links: [
      {
        href: "https://github.com/Nchpg/.dotfiles",
        icon: "github",
        label: "GitHub",
      },
    ],
  },
  {
    slug: "advent-of-code",
    previewExt: "mp4",
    animatedThumb: true,
    title: "Advent of Code",
    year: "2023-2025",
    tags: ["Python"],
    links: [
      {
        href: "https://github.com/Nchpg/Advent-of-Code",
        icon: "github",
        label: "GitHub",
      },
    ],
  },
  {
    slug: "ocr-sudoku",
    previewExt: "mp4",
    animatedThumb: true,
    title: "OCR Sudoku Solver",
    year: 2023,
    tags: ["C", "GTK", "OCR"],
    links: [
      {
        href: "/projects/ocr-sudoku/report.pdf",
        icon: "doc",
        label: "Read report",
      },
    ],
  },
  {
    slug: "ms402",
    previewExt: "mp4",
    animatedThumb: true,
    title: "MS402",
    year: 2023,
    tags: ["C#", "Unity"],
    links: [
      {
        href: "https://a2nt.gitlab.io/ms-402-website/",
        icon: "link",
        label: "Visit website",
      },
      { href: "/projects/ms402/report.pdf", icon: "doc", label: "Read report" },
    ],
  },
  // {
  //   slug: "vim-airline",
  //   previewExt: "webp",
  //   title: "Vim Airline Theme",
  //   year: 2022,
  //   tags: ["Vimscript"],
  //   links: [
  //     {
  //       href: "https://github.com/Nchpg/Vim-Airline-Powerline-Theme",
  //       icon: "github",
  //       label: "GitHub",
  //     },
  //   ],
  // },
];
