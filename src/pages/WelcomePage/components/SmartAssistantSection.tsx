import React from 'react';
import './SmartAssistantSection.css';

interface SmartAssistantSectionProps {
  id: string;
  title: string;
  description: string;
  currentLanguage?: 'zh_CN' | 'en';
  models?: Array<{
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    features: string[];
  }>;
  comingSoon?: {
    title: string;
    features: string[];
  };
}

const SmartAssistantSection: React.FC<SmartAssistantSectionProps> = ({
  id,
  title,
  description,
  currentLanguage = 'zh_CN',
  models = [],
  comingSoon,
}) => {
  return (
    <section id={id} className="section smart-assistant-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="smart-assistant-header">
          <h2 className="section-title">{title}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{description}</p>
        </div>

        {/* AI Models Grid */}
        {models.length > 0 && (
          <div className="ai-models-grid">
            {models.map((model, index) => (
              <div 
                key={index} 
                className="ai-model-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="model-icon-wrapper">
                  <span className="model-icon">{model.icon}</span>
                </div>
                <h3 className="model-title">{model.title}</h3>
                <div className="model-subtitle">{model.subtitle}</div>
                <p className="model-description">{model.description}</p>
                <ul className="model-features">
                  {model.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-bullet">●</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Features */}
        {comingSoon && (
          <div className="coming-soon-section">
            <h3 className="coming-soon-title">{comingSoon.title}</h3>
            <div className="coming-soon-grid">
              {comingSoon.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="coming-soon-card"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="smart-assistant-cta">
          <p className="cta-text">
            {currentLanguage === 'zh_CN' 
              ? '💡 有更好的想法？发邮件告诉我们' 
              : '💡 Have better ideas? Email us'}
          </p>
          <a href="mailto:support@icu.584743.xyz" className="cta-email">
            support@icu.584743.xyz
          </a>
        </div>

        {/* Funding Notice */}
        <div className="funding-notice">
          <div className="notice-content">
            <p className="notice-text">
              {currentLanguage === 'zh_CN' 
                ? '然而，我们的资金和人员都非常有限...' 
                : 'However, our funding and team are very limited...'}
            </p>
            <p className="notice-highlight">
              {currentLanguage === 'zh_CN' 
                ? '欢迎资助我们或加入我们，一起让 ICU 变得更好！' 
                : 'Welcome to support or join us to make ICU better together!'}
            </p>
            <a href="/welcome/about-us" className="notice-link">
              {currentLanguage === 'zh_CN' 
                ? '了解如何帮助我们 →' 
                : 'Learn how to help us →'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartAssistantSection;
