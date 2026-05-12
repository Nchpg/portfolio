import React from 'react';
import './Section.css';
import './Contact.css';

const Section = ({ title, children, id }) => {
    const handleMouseEnter = (e) => {
        const wrapper = e.currentTarget;
        if (!wrapper.classList.contains('is-animating')) {
            wrapper.classList.add('is-animating');
            const onAnimationEnd = () => {
                wrapper.classList.remove('is-animating');
                wrapper.removeEventListener('animationend', onAnimationEnd);
            };
            wrapper.addEventListener('animationend', onAnimationEnd);
        }
    };

    return (
        <section className="section container" id={id}>
            <div className="section-header">
                <span className="section-title-tag identity-wrapper" onMouseEnter={handleMouseEnter}>
                    {title.split('').map((char, i) => (
                        <span key={i} className="wave-char" style={{ '--i': i }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </span>
                <div className="section-line"></div>
            </div>
            <div className="section-content">
                {children}
            </div>
        </section>
    );
};

export default Section;
