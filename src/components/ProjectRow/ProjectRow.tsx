import ProjectThumb, { ProjectLink } from '../ProjectThumb/ProjectThumb';
import type { Project } from '../../data/projects';
import './ProjectRow.css';

type Props = {
  project: Project;
  index: number;
};

const ProjectRow = ({ project, index }: Props) => (
  <article className="project-row">
    <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
    <ProjectThumb slug={project.slug} previewExt={project.previewExt} alt={project.title} />
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

export default ProjectRow;
