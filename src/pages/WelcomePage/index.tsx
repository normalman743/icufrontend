import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import WhyICUSection from './components/WhyICUSection';
import ContentSection from './components/ContentSection';
import WorkflowSection from './components/WorkflowSection';
import SmartAssistantSection from './components/SmartAssistantSection';
import AboutUsSection from './components/AboutUsSection';
import Footer from './components/Footer';
import { AI_MODELS, COMPARISON_EXAMPLES } from './data';
import { useTranslation, LanguageKey } from './i18n';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageKey>(
    (user?.preferred_language as LanguageKey) || 'zh_CN'
  );

  // 获取翻译文本
  const t = useTranslation(currentLanguage);

  // 根据 URL 参数设置活动区域
  useEffect(() => {
    if (section) {
      setActiveSection(section);
    }
  }, [section]);

  // 跳转到登录页
  const handleStartClick = () => {
    navigate('/login');
  };

  // 跳转到 why-icu 部分
  const handleSecondaryClick = () => {
    switchToSection('why-icu');
  };

  // Navigation items (no refs needed for tab switching)
  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'why-icu', label: t.nav.whyIcu },
    { id: 'knowledge-sources', label: t.nav.knowledgeSources },
    { id: 'workflow', label: t.nav.workflow },
    { id: 'smart-assistant', label: t.nav.smartAssistant },
    { id: 'about-us', label: t.nav.aboutUs },
  ];

  // Switch to section (tab switching)
  const switchToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // 更新 URL，但不刷新页面
    navigate(`/welcome/${sectionId}`, { replace: true });
  };

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang as LanguageKey);
  };

  // Render the active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <HeroSection
            title={t.hero.title}
            subtitle={t.hero.subtitle}
            description={t.hero.description}
            ctaPrimary={t.hero.cta}
            ctaSecondary={t.hero.ctaSecondary}
            user={user}
            welcomeText={t.hero.welcome}
            userWelcomeText={t.hero.userWelcome}
            onPrimaryClick={handleStartClick}
            onSecondaryClick={handleSecondaryClick}
          />
        );
      
      case 'why-icu':
        return (
          <WhyICUSection
            id="why-icu"
            title={t.whyIcu.title}
            subtitle={t.whyIcu.subtitle}
            description={t.whyIcu.description}
            selectAILabel={t.whyIcu.selectAI}
            moreModelsLabel={t.whyIcu.moreModels}
            aiOptions={AI_MODELS}
            comparisonData={COMPARISON_EXAMPLES}
            currentLanguage={currentLanguage}
            statsLabel={t.whyIcu.statsLabel}
            stats={t.whyIcu.stats}
            moreModelsModal={t.whyIcu.moreModelsModal}
          />
        );
      
      case 'knowledge-sources':
        return (
          <FeaturesSection
            id="knowledge-sources"
            title={t.threeSources.title}
            description={t.threeSources.description}
            cards={t.threeSources.sources}
            currentLanguage={currentLanguage}
          />
        );
      
      case 'workflow':
        return (
          <WorkflowSection
            id="workflow"
            title={t.how.title}
            description={t.how.description}
            currentLanguage={currentLanguage}
          />
        );


      case 'smart-assistant':
        return (
          <SmartAssistantSection
            id="smart-assistant"
            title={t.smartAssistant.title}
            description={t.smartAssistant.description}
            currentLanguage={currentLanguage}
            models={t.smartAssistant.models}
            comingSoon={t.smartAssistant.comingSoon}
          />
        );
      
      case 'about-us':
        return (
          <AboutUsSection
            id="about-us"
            title={t.join.title}
            description={t.join.description}
            currentLanguage={currentLanguage}
            funding={t.join.funding}
            joinUs={t.join.joinUs}
            stats={t.join.stats}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="welcome-page">
      {/* Fixed Navigation Bar */}
      <Navbar
        navItems={navItems}
        activeSection={activeSection}
        isFixed={true}
        ctaText={t.hero.cta}
        onNavClick={switchToSection}
        onCtaClick={handleStartClick}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />

      {/* Content Area - switches based on active section */}
      <div className="welcome-content fade-in" key={activeSection}>
        {renderActiveSection()}
      </div>

      {/* Footer */}
      {activeSection !== 'workflow' && <Footer text={t.footer.text} currentLanguage={currentLanguage} />}
    </div>
  );
};

export default WelcomePage;
