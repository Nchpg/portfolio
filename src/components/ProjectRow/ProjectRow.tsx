'use client';

import { useInView } from '../../hooks/useInView';
import ProjectThumb from '../ProjectThumb/ProjectThumb';
import HoverLink from '../HoverLink/HoverLink';
import {
  GithubIcon,
  ExternalLinkIcon,
  DocumentIcon,
} from '../icons';
import type { Project, ProjectLinkItem, LinkIcon } from '../../data/projects';
import { SITE_URL } from '../../utils/env';
import { generateProjectJsonLd } from '../../utils/jsonLd';
import './ProjectRow.css';

const LINK_ICONS: Record<LinkIcon, React.ComponentType<{ size?: number }>> = {
  github: GithubIcon,
  link: ExternalLinkIcon,
  doc: DocumentIcon,
};

const ProjectLink = ({ href, icon, label, projectTitle }: ProjectLinkItem & { projectTitle: string }) => {
  const Icon = LINK_ICONS[icon];
  const isPdf = href.toLowerCase().endsWith('.pdf');
  const suffix = isPdf ? ' (PDF, opens in new tab)' : ' (opens in new tab)';
  return (
    <HoverLink
      className="project-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} — ${projectTitle}${suffix}`}
    >
      {Icon ? <Icon /> : null}
      <span>{label}{isPdf ? ' (PDF)' : null}</span>
    </HoverLink>
  );
};

type Props = {
  project: Project;
  index: number;
  priority?: boolean;
};

const ProjectRow = ({ project, index, priority = false }: Props) => {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.08 });

  const jsonLd = generateProjectJsonLd(
    project,
    SITE_URL
  );

  return (
    <article
      ref={ref}
      className={`project-row${inView ? ' project-row--visible' : ''}`}
      style={{ '--row-i': index } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
      <ProjectThumb
        slug={project.slug}
        previewExt={project.previewExt}
        animatedThumb={project.animatedThumb}
        alt={project.title}
        priority={priority}
      />
      <div className="project-main">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-links">
          {project.links.map((link) => (
            <ProjectLink key={link.href} {...link} projectTitle={project.title} />
          ))}
        </div>
      </div>
      <div className="project-meta">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
};

export default ProjectRow;
