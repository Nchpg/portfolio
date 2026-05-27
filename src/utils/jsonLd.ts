import { Project } from '../data/projects';

const CODE_LANGUAGES = new Set(['C++', 'C', 'C#', 'Python', 'Vimscript', 'HTML', 'JS']);

export function generateProjectJsonLd(project: Project, siteUrl: string) {
  const languages = project.tags.filter((t) => CODE_LANGUAGES.has(t));

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': `${siteUrl}/#project-${project.slug}`,
    name: project.title,
    keywords: project.tags.join(', '),
    ...(languages.length > 0 && { programmingLanguage: languages }),
    url: project.links[0]?.href ?? siteUrl,
    author: {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Nathan Champagne',
    },
  };
}
