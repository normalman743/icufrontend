import React from 'react';
import './FeaturesSection.css';

interface FeatureCard {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

interface FeaturesSectionProps {
  id: string;
  title: string;
  description: string;
  cards: FeatureCard[];
  currentLanguage?: 'zh_CN' | 'en';
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  id,
  title,
  description,
  cards,
  currentLanguage = 'zh_CN',
}) => {
  return (
    <section id={id} className="section features-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="features-header">
          <h2 className="section-title features-title">{title}</h2>
          <div className="section-divider"></div>
          <p className="section-description features-description">{description}</p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header with Icon and Badge */}
              <div className="feature-card-header">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{card.icon}</span>
                </div>
                <div className="feature-badge">{card.subtitle}</div>
              </div>

              {/* Card Content */}
              <div className="feature-card-content">
                <h3 className="feature-title">{card.title}</h3>
                <p className="feature-description">{card.description}</p>

                {/* Feature List */}
                <ul className="feature-list">
                  {card.features.map((feature, idx) => (
                    <li key={idx} style={{ animationDelay: `${(index * 0.1) + (idx * 0.05)}s` }}>
                      <span className="feature-check">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Video/Animation Placeholder - 你可以在这里添加视频 */}
              <div className="feature-media">
                {/* 预留位置：可以添加视频、Lottie动画或图片 */}
                {/* <video className="feature-video" src={`/videos/feature-${index + 1}.mp4`} /> */}
                {/* 或者 */}
                {/* <img className="feature-image" src={`/images/feature-${index + 1}.png`} /> */}
              </div>
            </div>
          ))}
        </div>

        {/* How to Use Features Link */}
        <div className="features-action" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px' }}>
          <a href="/welcome/workflow" className="features-link-button">
            {currentLanguage === 'zh_CN' ? '🌟 看看 Star 如何使用这些知识' : '🌟 See How Star Uses These Features'}
          </a>
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;
