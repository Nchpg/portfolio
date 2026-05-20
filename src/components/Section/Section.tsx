import type { ReactNode } from 'react';
import WaveText from '../WaveText/WaveText';
import './Section.css';

type Props = {
  title: string;
  children: ReactNode;
  id?: string;
  index?: number;
};

const Section = ({ title, children, id, index }: Props) => {
  const headingId = id ? `${id}-title` : undefined;
  const dataIndex = index !== undefined ? String(index).padStart(2, '0') : undefined;
  return (
    <section className="section container" id={id} aria-labelledby={headingId}>
      <div className="section-header">
        <h2 id={headingId} className="sr-only">
          {title}
        </h2>
        <WaveText text={title} className="section-title-tag" aria-hidden="true" data-index={dataIndex} />
        <div className="section-line" aria-hidden="true"></div>
      </div>
      <div className="section-content">{children}</div>
    </section>
  );
};

export default Section;
