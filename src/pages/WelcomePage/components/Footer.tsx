import React, { useState } from 'react';
import { useTranslation, LanguageKey } from '../i18n';
import './Footer.css';

interface FooterProps {
  text: string;
  currentLanguage: string;
}

const Footer: React.FC<FooterProps> = ({ text, currentLanguage }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const t = useTranslation(currentLanguage as LanguageKey).footer;

  return (
    <>
      <footer className="welcome-footer">
        <div className="footer-decoration"></div>
        <p className="footer-text">{text}</p>

        <div className="footer-bottom">
          <div className="footer-links">
            <button onClick={() => setShowPrivacy(true)} className="footer-link-btn">{t.privacyPolicy}</button>
            <span className="footer-divider">|</span>
            <button onClick={() => setShowTerms(true)} className="footer-link-btn">{t.termsOfService}</button>
            <span className="footer-divider">|</span>
            <a href="/about" className="footer-link">{t.aboutUs}</a>
          </div>

          <p className="footer-copyright">© {new Date().getFullYear()} {t.copyright}</p>
        </div>
      </footer>

      {showPrivacy && (
        <div className="footer-modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="footer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="footer-modal-header">
              <h2>{t.privacy.title}</h2>
              <button className="footer-modal-close" onClick={() => setShowPrivacy(false)}>{t.close}</button>
            </div>
            <div className="footer-modal-content">
              <h3>{t.privacy.section1.title}</h3><p>{t.privacy.section1.content}</p>
              <h3>{t.privacy.section2.title}</h3><p>{t.privacy.section2.content}</p>
              <h3>{t.privacy.section3.title}</h3><p>{t.privacy.section3.content}</p>
              <h3>{t.privacy.section4.title}</h3><p>{t.privacy.section4.content}</p>
              <h3>{t.privacy.section5.title}</h3><p>{t.privacy.section5.content}</p>
              <h3>{t.privacy.section6.title}</h3><p>{t.privacy.section6.content}</p>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="footer-modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="footer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="footer-modal-header">
              <h2>{t.terms.title}</h2>
              <button className="footer-modal-close" onClick={() => setShowTerms(false)}>{t.close}</button>
            </div>
            <div className="footer-modal-content">
              <h3>{t.terms.section1.title}</h3><p>{t.terms.section1.content}</p>
              <h3>{t.terms.section2.title}</h3><p>{t.terms.section2.content}</p>
              <h3>{t.terms.section3.title}</h3><p>{t.terms.section3.content}</p>
              <h3>{t.terms.section4.title}</h3><p>{t.terms.section4.content}</p>
              <h3>{t.terms.section5.title}</h3><p>{t.terms.section5.content}</p>
              <h3>{t.terms.section6.title}</h3><p>{t.terms.section6.content}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;