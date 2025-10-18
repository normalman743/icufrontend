import React from 'react';
import './ContentSection.css';

interface ContentSectionProps {
  id: string;
  title: string;
  description: string;
  placeholderIcon: string;
  placeholderText: string;
  background?: 'white' | 'light' | 'gradient';
  children?: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  id,
  title,
  description,
  placeholderIcon,
  placeholderText,
  background = 'white',
  children,
}) => {
  const backgroundClass = 
    background === 'gradient' ? 'section-gradient' :
    background === 'light' ? 'section-light' : 'section-white';

  return (
    <section id={id} className={`section content-section ${backgroundClass}`}>
      <div className="section-container">
        <h2 className="section-title">{title}</h2>
        <div className="section-divider"></div>
        <p className="section-description">{description}</p>
        
        {children ? (
          <div className="section-content">{children}</div>
        ) : (
          <div className="content-placeholder">
            <div className="placeholder-box">
              <span className="placeholder-icon">{placeholderIcon}</span>
              <p>{placeholderText}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentSection;
