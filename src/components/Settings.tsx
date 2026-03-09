import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { User, UserPreferences } from '../types';
import { authAPI } from '../utils/api';
import './Settings.css';
import UserManual from './UserManual';

interface SettingsProps {
  user: User;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  onUpdateProfile: (data: Partial<User>) => void;
  onLogout: () => void;
  isSidebarCollapsed?: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  user,
  onUpdatePreferences,
  onUpdateProfile,
  onLogout,
  isSidebarCollapsed
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user.name || user.username,
    email: user.email,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: user.preferences?.theme || user.preferred_theme || 'light',
    language: user.preferences?.language || user.preferred_language || 'zh_CN',
    notifications: user.preferences?.notifications ?? true,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [showUserManual, setShowUserManual] = useState(false);
  const [manualSection, setManualSection] = useState('quick-start');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { t } = useTranslation();

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: '👤' },
    { id: 'preferences', label: t('settings.preferences'), icon: '⚙️' },
    { id: 'privacy', label: t('settings.privacy'), icon: '🔒' },
    { id: 'about', label: t('settings.about'), icon: 'ℹ️' }
  ];

  // 立即应用主题到 document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  // 🚫 移除：用户名编辑相关函数
  // const handleNameSave = () => { ... }
  // const handleNameCancel = () => { ... }

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onUpdatePreferences(newPreferences);
    if (key === 'language') {
      i18n.changeLanguage(value as string);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      // 调用 API 登出
      await authAPI.logout();
      
      // 调用父组件的登出回调
      onLogout();
      
    } catch (error) {
      // 即使 API 调用失败，也执行本地登出
      onLogout();
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 🔄 修改：个人资料标签页 - 禁用用户名编辑
  const renderProfileTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t('settings.profileTitle')}</h3>
      <div className="settings__form">
        <div className="settings__form-group">
          <label className="settings__label">{t('settings.avatar')}</label>
          <div className="settings__avatar-section">
            <img
              src={user.avatar || "/Head_Portrait.png"}
              alt={t('settings.avatar')}
              className="settings__avatar"
            />
          </div>
        </div>

        {/* 🔄 修改：用户名显示 - 改为只读模式 */}
        <div className="settings__form-group">
          <label htmlFor="name" className="settings__label">{t('settings.name')}</label>
          <div className="settings__name-display settings__name-display--readonly">
            {formData.name}
          </div>
          <div className="settings__field-hint">
            <span className="settings__field-hint-icon">ℹ️</span>
            <span className="settings__field-hint-text">{t('settings.nameReadOnly')}</span>
          </div>
        </div>

        {/* 🔄 修改：邮箱显示 - 添加提示 */}
        <div className="settings__form-group">
          <label htmlFor="email" className="settings__label">{t('settings.email')}</label>
          <div className="settings__email-display">{formData.email}</div>
          <div className="settings__field-hint">
            <span className="settings__field-hint-icon">ℹ️</span>
            <span className="settings__field-hint-text">{t('settings.emailReadOnly')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t('settings.preferencesTitle')}</h3>
      
      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t('settings.languageSettings')}</h4>
        <div className="settings__preference-item">
          <label className="settings__label">{t('settings.displayLanguage')}</label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="settings__select"
          >
            <option value="zh_CN">{t('settings.simplifiedChinese')}</option>
            <option value="en">{t('settings.english')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  // 🔄 修改：隐私安全标签页 - 禁用密码修改
  const renderPrivacyTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t('settings.privacyTitle')}</h3>
      
      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t('settings.passwordSecurity')}</h4>
        <div className="settings__password-section">
          <button 
            className="settings__button settings__button--secondary settings__button--disabled"
            disabled
            title={t('settings.passwordChangeDisabled')}
          >
            <span className="settings__button-icon">🔒</span>
            {t('settings.changePassword')}
          </button>
          <div className="settings__field-hint">
            <span className="settings__field-hint-icon">⚠️</span>
            <span className="settings__field-hint-text">{t('settings.passwordManagedBySystem')}</span>
          </div>
        </div>
      </div>

      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t('settings.dataManagement')}</h4>
        <button 
          className={`settings__button settings__button--danger ${isLoggingOut ? 'settings__button--loading' : ''}`}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? t('settings.loggingOut') : t('settings.logout')}
        </button>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t('settings.aboutTitle')}</h3>
      
      <div className="settings__about-section">
        <div className="settings__about-logo">
          <img src="/iCU_Icon.png" alt="iCU Logo" className="settings__about-logo-image" />
        </div>
        <h4 className="settings__about-name">{t('settings.appName')}</h4>
        <p className="settings__about-version">{t('settings.version', { version: process.env.REACT_APP_VERSION || '1.0.0' })}</p>
        <p className="settings__about-description">
          {t('settings.appDescription')}
        </p>
      </div>

      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t('settings.systemInfo')}</h4>
        <div className="settings__info-list">
          <div className="settings__info-item">
            <span className="settings__info-label">{t('settings.buildTime')}</span>
            <span className="settings__info-value">{t('settings.buildTimeValue')}</span>
          </div>
          <div className="settings__info-item">
            <span className="settings__info-label">{t('settings.techStack')}</span>
            <span className="settings__info-value">{t('settings.techStackValue')}</span>
          </div>
          {user.created_at && (
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.registrationTime')}</span>
              <span className="settings__info-value">
                {i18n.language === 'zh_CN' 
                  ? new Date(user.created_at).toLocaleDateString('zh-CN')
                  : new Date(user.created_at).toLocaleDateString('en-US')
                }
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t('settings.helpAndSupport')}</h4>
        <div className="settings__link-list">
          <button 
            className="settings__link" 
            onClick={() => {
              setManualSection('quick-start');
              setShowUserManual(true);
            }}
          >
            <span>📖</span>
            <span>{t('settings.userManual')}</span>
          </button>
          <button 
            className="settings__link" 
            onClick={() => {
              setManualSection('contact');
              setShowUserManual(true);
            }}
          >
            <span>📧</span>
            <span>{t('settings.contactSupport')}</span>
          </button>
          <button 
            className="settings__link" 
            onClick={() => {
              setManualSection('report');
              setShowUserManual(true);
            }}
          >
            <span>🐛</span>
            <span>{t('settings.reportIssue')}</span>
          </button>
        </div>
      </div>

      <UserManual 
        isOpen={showUserManual} 
        onClose={() => setShowUserManual(false)}
        initialSection={manualSection}
        language={i18n.language} // 传递语言参数
      />
    </div>
  );

  return (
    <div className={`settings ${isSidebarCollapsed ? 'settings--sidebar-collapsed' : ''}`}>
      <div className="settings__container">
        {/* 左侧标签栏 */}
        <div className="settings__sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings__tab ${activeTab === tab.id ? 'settings__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings__tab-icon">{tab.icon}</span>
              <span className="settings__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 右侧内容区 */}
        <div className="settings__content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'about' && renderAboutTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
