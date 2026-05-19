import React from 'react';
import WaveText from '../WaveText/WaveText';
import './Section.css';

const Section = ({ title, children, id }) => (
    <section className="section container" id={id}>
        <div className="section-header">
            <WaveText text={title} className="section-title-tag" />
            <div className="section-line"></div>
        </div>
        <div className="section-content">
            {children}
        </div>
    </section>
);

export default Section;
