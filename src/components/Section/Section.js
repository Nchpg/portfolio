import React from 'react';
import './Section.css';

const Section = ({ title, children, id }) => {
    return (
        <section className="section container" id={id}>
            <div className="section-header">
                <span className="section-title-tag">{title}</span>
                <div className="section-line"></div>
            </div>
            <div className="section-content">
                {children}
            </div>
        </section>
    );
};

export default Section;
