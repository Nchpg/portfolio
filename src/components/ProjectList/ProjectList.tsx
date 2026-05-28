import { cacheLife, cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { projects } from "../../data/projects";
import ProjectRow from "../ProjectRow/ProjectRow";

async function ProjectList({ locale }: { locale: string }) {
  "use cache";
  cacheLife("max");
  cacheTag("projects-" + locale);

  const t = await getTranslations({ locale, namespace: "projects" });

  return (
    <div className="projects-list">
      {projects.map((project, i) => (
        <ProjectRow
          key={project.slug}
          project={project}
          description={t(project.slug)}
          index={i}
          priority={i < 2}
        />
      ))}
    </div>
  );
}

export default ProjectList;
