import React from 'react';
import './Navbar.css';

interface NavItem {
  id: string;
  label: string;
}

interface NavbarProps {
  navItems: NavItem[];
  activeSection: string;
  isFixed: boolean;
  ctaText: string;
  onNavClick: (sectionId: string) => void;
  onCtaClick?: () => void;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  navItems,
  activeSection,
  isFixed,
  ctaText,
  onNavClick,
  onCtaClick,
  currentLanguage = 'zh_CN',
  onLanguageChange,
}) => {
  return (
    <nav className={`welcome-navbar ${isFixed ? 'welcome-navbar--fixed' : ''}`}>
      <div className="navbar-container">
        <button className="navbar-logo" onClick={() => onNavClick('home')}>
          <img src="/Mascot.PNG" alt="ICU Logo" className="navbar-logo-img" />
          <span className="navbar-brand">ICU</span>
        </button>
        
        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.id} className="navbar-item">
              <button
                className={`navbar-link ${activeSection === item.id ? 'navbar-link--active' : ''}`}
                onClick={() => onNavClick(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          {/* Language Toggle */}
          {onLanguageChange && (
            <div className="language-toggle">
              <button
                className={`lang-btn ${currentLanguage === 'zh_CN' ? 'lang-btn--active' : ''}`}
                onClick={() => onLanguageChange('zh_CN')}
              >
                中文
              </button>
              <button
                className={`lang-btn ${currentLanguage === 'en' ? 'lang-btn--active' : ''}`}
                onClick={() => onLanguageChange('en')}
              >
                EN
              </button>
            </div>
          )}
          
          <button className="navbar-cta" onClick={onCtaClick}>
            {ctaText}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
