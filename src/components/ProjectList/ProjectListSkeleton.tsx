import './ProjectListSkeleton.css';

const SkeletonRow = ({ delay }: { delay: string }) => (
  <div className="skeleton-row" style={{ animationDelay: delay }}>
    <div className="skeleton-block skeleton-index" />
    <div className="skeleton-block skeleton-thumb" />
    <div className="skeleton-main">
      <div className="skeleton-block skeleton-title" />
      <div className="skeleton-block skeleton-desc" />
      <div className="skeleton-block skeleton-desc-short" />
    </div>
    <div className="skeleton-meta">
      <div className="skeleton-block skeleton-tag" />
      <div className="skeleton-block skeleton-tag" />
    </div>
  </div>
);

const ProjectListSkeleton = () => (
  <div className="projects-list" aria-busy="true" aria-label="Loading projects">
    <SkeletonRow delay="0ms" />
    <SkeletonRow delay="80ms" />
    <SkeletonRow delay="160ms" />
  </div>
);

export default ProjectListSkeleton;
