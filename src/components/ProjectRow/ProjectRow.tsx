import ProjectThumb, { ProjectLink } from '../ProjectThumb/ProjectThumb';
import type { Project } from '../../data/projects';
import { generateProjectJsonLd } from '../../utils/jsonLd';
import './ProjectRow.css';

type Props = {
  project: Project;
  index: number;
  priority?: boolean;
};

const ProjectRow = ({ project, index, priority = false }: Props) => {
  const jsonLd = generateProjectJsonLd(
    project,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://nathanchampagne.dev'
  );

  return (
    <article className="project-row">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
      <ProjectThumb
        slug={project.slug}
        previewExt={project.previewExt}
        alt={project.title}
        priority={priority}
        animated={project.animatedThumbnail}
      />
      <div className="project-main">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-links">
          {project.links.map((link) => (
            <ProjectLink key={link.href} {...link} />
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
