import { cacheLife, cacheTag } from 'next/cache';
import { projects } from '../../data/projects';
import ProjectRow from '../ProjectRow/ProjectRow';

async function ProjectList() {
  'use cache';
  cacheLife('max');
  cacheTag('projects');

  return (
    <div className="projects-list">
      {projects.map((project, i) => (
        <ProjectRow key={project.slug} project={project} index={i} priority={i < 2} />
      ))}
    </div>
  );
}

export default ProjectList;
