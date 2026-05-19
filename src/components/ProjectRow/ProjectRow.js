import React from 'react';
import ProjectThumb, { ProjectLink } from '../ProjectThumb/ProjectThumb';

const ProjectRow = ({ project, index }) => (
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
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
    </article>
);

export default ProjectRow;
