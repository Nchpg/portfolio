import type { ReactNode } from 'react';
import WaveText from '../WaveText/WaveText';
import './Section.css';

type Props = {
  title: string;
  children: ReactNode;
  id?: string;
};

const Section = ({ title, children, id }: Props) => (
  <section className="section container" id={id}>
    <div className="section-header">
      <WaveText text={title} className="section-title-tag" />
      <div className="section-line"></div>
    </div>
    <div className="section-content">{children}</div>
  </section>
);

export default Section;
