import React, { useState } from 'react';
import './AboutUsSection.css';

interface AboutUsSectionProps {
  id: string;
  title: string;
  description: string;
  currentLanguage?: 'zh_CN' | 'en';
  funding?: {
    title: string;
    description: string;
    cta: string;
  };
  joinUs?: {
    title: string;
    description: string;
    roles: string[];
    cta: string;
  };
  stats?: {
    users: string;
    questions: string;
    satisfaction: string;
  };
}

const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  id,
  title,
  description,
  currentLanguage = 'zh_CN',
  funding,
  joinUs,
  stats,
}) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'HKD' | 'RMB'>('HKD');

  const handleSupportClick = () => {
    setShowSupportModal(true);
  };

  const closeSupportModal = () => {
    setShowSupportModal(false);
  };

  const handleJoinClick = () => {
    // 打开 Google Form 链接
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSf83mAvuzyAAnuCmdWVdruNWQGnCWfkTbev7xMWq3RlJX_Fyg/viewform?usp=header', '_blank');
  };

  return (
    <section id={id} className="section about-us-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="about-us-header">
          <h2 className="section-title">{title}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{description}</p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">{stats.users}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-number">{stats.questions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">{stats.satisfaction}</div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="about-us-grid">
          {/* Funding Card */}
          {funding && (
            <div className="about-us-card funding-card">
              <div className="card-icon">💰</div>
              <h3 className="card-title">{funding.title}</h3>
              <p className="card-description">{funding.description}</p>
              <button className="card-cta support-button" onClick={handleSupportClick}>
                {funding.cta}
              </button>
              <div className="card-details">
                <p>{currentLanguage === 'zh_CN' ? '支持方式：' : 'Support via:'}</p>
                <ul>
                  <li>💳 {currentLanguage === 'zh_CN' ? '一次性捐赠' : 'One-time Donation'}</li>
                  <li>🔄 {currentLanguage === 'zh_CN' ? '月度支持' : 'Monthly Support'}</li>
                  <li>🎁 {currentLanguage === 'zh_CN' ? '赞助合作' : 'Sponsorship'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Join Us Card */}
          {joinUs && (
            <div className="about-us-card join-card">
              <div className="card-icon">🤝</div>
              <h3 className="card-title">{joinUs.title}</h3>
              <p className="card-description">{joinUs.description}</p>
              
              <div className="roles-grid">
                {joinUs.roles.map((role, index) => (
                  <div key={index} className="role-tag">
                    {role}
                  </div>
                ))}
              </div>
              
              <button className="card-cta join-button" onClick={handleJoinClick}>
                {joinUs.cta}
              </button>
            </div>
          )}
        </div>

        {/* Vision Statement */}
        <div className="vision-statement">
          <div className="vision-icon">🚀</div>
          <h3 className="vision-title">
            {currentLanguage === 'zh_CN' ? '我们的愿景' : 'Our Vision'}
          </h3>
          <p className="vision-text">
            {currentLanguage === 'zh_CN' 
              ? '让每一位 CUHK 学生都能享受到个性化、智能化的学习体验。我们相信，通过技术的力量，可以让学习变得更简单、更高效、更有趣。'
              : 'To provide every CUHK student with personalized and intelligent learning experience. We believe that through the power of technology, learning can become simpler, more efficient, and more enjoyable.'}
          </p>
        </div>

        {/* Contact Information */}
        <div className="contact-section">
          <h4 className="contact-title">
            {currentLanguage === 'zh_CN' ? '联系我们' : 'Contact Us'}
          </h4>
          <div className="contact-methods">
            <a href="mailto:support@icu.584743.xyz" className="contact-link">
              📧 support@icu.584743.xyz
            </a>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="modal-overlay" onClick={closeSupportModal}>
          <div className="modal-content support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentLanguage === 'zh_CN' ? '支持我们' : 'Support Us'}</h3>
              <button className="modal-close" onClick={closeSupportModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="currency-selector">
                <button 
                  className={`currency-btn ${selectedCurrency === 'HKD' ? 'active' : ''}`} 
                  onClick={() => setSelectedCurrency('HKD')}
                >
                  HKD (港币)
                </button>
                <button 
                  className={`currency-btn ${selectedCurrency === 'RMB' ? 'active' : ''}`} 
                  onClick={() => setSelectedCurrency('RMB')}
                >
                  RMB (人民币)
                </button>
              </div>
              <div className="qr-codes">
                <div className="qr-code-item">
                  <h4>{selectedCurrency === 'HKD' ? '支付宝HK' : '支付宝'}</h4>
                  <img 
                    src={`/images/${selectedCurrency === 'HKD' ? 'AlipayHK.JPG' : 'Alipay.JPG'}`} 
                    alt={`${selectedCurrency === 'HKD' ? 'AlipayHK' : 'Alipay'} ${selectedCurrency} QR Code`} 
                  />
                </div>
              </div>
              <p className="modal-note">
                {currentLanguage === 'zh_CN' 
                  ? `扫描二维码进行 ${selectedCurrency} 捐赠，您的支持将用于服务器维护和功能开发。` 
                  : `Scan the QR code to donate in ${selectedCurrency}. Your support will be used for server maintenance and feature development.`}
              </p>
              <p className="modal-other-methods">
                {currentLanguage === 'zh_CN' 
                  ? '其他方法支持我们，联系我们 📧 support@icu.584743.xyz' 
                  : 'For other support methods, contact us 📧 support@icu.584743.xyz'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AboutUsSection;
