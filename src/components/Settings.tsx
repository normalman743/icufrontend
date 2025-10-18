import React, { useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { authAPI } from '../utils/api';
import './Settings.css';
import UserManual from './UserManual';

// 完整的国际化文本 - 修改键名以匹配类型定义
const i18nTexts = {
  'zh_CN': {
    // 标签页
    profile: '个人资料',
    preferences: '偏好设置',
    privacy: '隐私安全',
    about: '关于',
    
    // 主题设置
    theme: '主题',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    language: '语言设置',
    displayLanguage: '显示语言',
    simplifiedChinese: '简体中文',
    english: 'English',
    
    // 个人资料页面
    profileTitle: '个人资料',
    avatar: '头像',
    name: '姓名',
    email: '邮箱',
    edit: '修改',
    save: '保存',
    cancel: '取消',
    // 🆕 新增提示文本
    nameReadOnly: '用户名不可修改',
    emailReadOnly: '邮箱地址由系统管理',
    
    // 偏好设置页面
    preferencesTitle: '偏好设置',
    appearanceSettings: '外观设置',
    languageSettings: '语言设置',
    
    // 隐私安全页面
    privacyTitle: '隐私安全',
    passwordSecurity: '密码安全',
    changePassword: '修改密码',
    dataManagement: '数据管理',
    logout: '登出',
    // 🆕 新增提示文本
    passwordChangeDisabled: '密码修改功能暂时不可用',
    passwordManagedBySystem: '密码由系统管理员统一管理',
    
    // 关于页面
    aboutTitle: '关于 iCU',
    appName: 'iCU 智能学习助手',
    version: '版本 1.0.0',
    appDescription: 'iCU 是一个智能学习助手，旨在为学生提供个性化的学习体验和智能问答服务。',
    systemInfo: '系统信息',
    buildTime: '构建时间：',
    techStack: '技术栈：',
    registrationTime: '注册时间：',
    helpAndSupport: '帮助与支持',
    userManual: '用户手册',
    contactSupport: '联系支持',
    reportIssue: '报告问题',
    
    // 系统信息值
    buildTimeValue: '2025-6-18',
    techStackValue: 'React + TypeScript'
  },
  'en': {
    // 标签页
    profile: 'Profile',
    preferences: 'Preferences',
    privacy: 'Privacy & Security',
    about: 'About',
    
    // 主题设置
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    displayLanguage: 'Display Language',
    simplifiedChinese: '简体中文',
    english: 'English',
    
    // 个人资料页面
    profileTitle: 'Profile',
    avatar: 'Avatar',
    name: 'Name',
    email: 'Email',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    // 🆕 新增提示文本
    nameReadOnly: 'Username cannot be modified',
    emailReadOnly: 'Email address is managed by system',
    
    // 偏好设置页面
    preferencesTitle: 'Preferences',
    appearanceSettings: 'Appearance Settings',
    languageSettings: 'Language Settings',
    
    // 隐私安全页面
    privacyTitle: 'Privacy & Security',
    passwordSecurity: 'Password Security',
    changePassword: 'Change Password',
    dataManagement: 'Data Management',
    logout: 'Logout',
    // 🆕 新增提示文本
    passwordChangeDisabled: 'Password change feature is temporarily unavailable',
    passwordManagedBySystem: 'Passwords are managed by system administrators',
    
    // 关于页面
    aboutTitle: 'About iCU',
    appName: 'iCU Intelligent Learning Assistant',
    version: 'Version 1.0.0',
    appDescription: 'iCU is an intelligent learning assistant designed to provide students with personalized learning experiences and intelligent Q&A services.',
    systemInfo: 'System Information',
    buildTime: 'Build Time:',
    techStack: 'Tech Stack:',
    registrationTime: 'Registration Time:',
    helpAndSupport: 'Help & Support',
    userManual: 'User Manual',
    contactSupport: 'Contact Support',
    reportIssue: 'Report Issue',
    
    // 系统信息值
    buildTimeValue: 'June 18, 2025',
    techStackValue: 'React + TypeScript'
  }
};

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

  // 获取当前语言的文本
  const t = i18nTexts[preferences.language as keyof typeof i18nTexts] || i18nTexts['zh_CN'];

  const tabs = [
    { id: 'profile', label: t.profile, icon: '👤' },
    { id: 'preferences', label: t.preferences, icon: '⚙️' },
    { id: 'privacy', label: t.privacy, icon: '🔒' },
    { id: 'about', label: t.about, icon: 'ℹ️' }
  ];

  // 立即应用主题到 document
  useEffect(() => {
    console.log('应用主题:', preferences.theme);
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  // 立即应用语言变化
  useEffect(() => {
    console.log('语言变化:', preferences.language);
  }, [preferences.language]);

  // 🚫 移除：用户名编辑相关函数
  // const handleNameSave = () => { ... }
  // const handleNameCancel = () => { ... }

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    console.log(`设置变更: ${key} = ${value}`);
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onUpdatePreferences(newPreferences);
  };

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      console.log('开始登出...');
      
      // 调用 API 登出
      await authAPI.logout();
      
      console.log('API 登出成功，调用父组件的 onLogout');
      
      // 调用父组件的登出回调
      onLogout();
      
    } catch (error) {
      console.error('登出失败:', error);
      
      // 即使 API 调用失败，也执行本地登出
      console.log('API 登出失败，执行本地登出');
      onLogout();
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 🔄 修改：个人资料标签页 - 禁用用户名编辑
  const renderProfileTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t.profileTitle}</h3>
      <div className="settings__form">
        <div className="settings__form-group">
          <label className="settings__label">{t.avatar}</label>
          <div className="settings__avatar-section">
            <img
              src={user.avatar || "/Head_Portrait.png"}
              alt={t.avatar}
              className="settings__avatar"
            />
          </div>
        </div>

        {/* 🔄 修改：用户名显示 - 改为只读模式 */}
        <div className="settings__form-group">
          <label htmlFor="name" className="settings__label">{t.name}</label>
          <div className="settings__name-display settings__name-display--readonly">
            {formData.name}
          </div>
          <div className="settings__field-hint">
            <span className="settings__field-hint-icon">ℹ️</span>
            <span className="settings__field-hint-text">{t.nameReadOnly}</span>
          </div>
        </div>

        {/* 🔄 修改：邮箱显示 - 添加提示 */}
        <div className="settings__form-group">
          <label htmlFor="email" className="settings__label">{t.email}</label>
          <div className="settings__email-display">{formData.email}</div>
          <div className="settings__field-hint">
            <span className="settings__field-hint-icon">ℹ️</span>
            <span className="settings__field-hint-text">{t.emailReadOnly}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t.preferencesTitle}</h3>
      
      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t.languageSettings}</h4>
        <div className="settings__preference-item">
          <label className="settings__label">{t.displayLanguage}</label>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="settings__select"
          >
            <option value="zh_CN">{t.simplifiedChinese}</option>
            <option value="en">{t.english}</option>
          </select>
        </div>
      </div>
    </div>
  );

  // 🔄 修改：隐私安全标签页 - 禁用密码修改
  const renderPrivacyTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t.privacyTitle}</h3>
      
      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t.passwordSecurity}</h4>
        <div className="settings__password-section">
          <button 
            className="settings__button settings__button--secondary settings__button--disabled"
            disabled
            title={t.passwordChangeDisabled}
          >
            <span className="settings__button-icon">🔒</span>
            {t.changePassword}
          </button>
          <div className="settings__field-hint">
            <span className="settings__field-hint-icon">⚠️</span>
            <span className="settings__field-hint-text">{t.passwordManagedBySystem}</span>
          </div>
        </div>
      </div>

      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t.dataManagement}</h4>
        <button 
          className={`settings__button settings__button--danger ${isLoggingOut ? 'settings__button--loading' : ''}`}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (preferences.language === 'zh_CN' ? '正在登出...' : 'Logging out...') : t.logout}
        </button>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="settings__tab-content">
      <h3 className="settings__tab-title">{t.aboutTitle}</h3>
      
      <div className="settings__about-section">
        <div className="settings__about-logo">
          <img src="/iCU_Icon.png" alt="iCU Logo" className="settings__about-logo-image" />
        </div>
        <h4 className="settings__about-name">{t.appName}</h4>
        <p className="settings__about-version">{t.version}</p>
        <p className="settings__about-description">
          {t.appDescription}
        </p>
      </div>

      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t.systemInfo}</h4>
        <div className="settings__info-list">
          <div className="settings__info-item">
            <span className="settings__info-label">{t.buildTime}</span>
            <span className="settings__info-value">{t.buildTimeValue}</span>
          </div>
          <div className="settings__info-item">
            <span className="settings__info-label">{t.techStack}</span>
            <span className="settings__info-value">{t.techStackValue}</span>
          </div>
          {user.created_at && (
            <div className="settings__info-item">
              <span className="settings__info-label">{t.registrationTime}</span>
              <span className="settings__info-value">
                {preferences.language === 'zh_CN' 
                  ? new Date(user.created_at).toLocaleDateString('zh-CN')
                  : new Date(user.created_at).toLocaleDateString('en-US')
                }
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="settings__preference-group">
        <h4 className="settings__preference-title">{t.helpAndSupport}</h4>
        <div className="settings__link-list">
          <button 
            className="settings__link" 
            onClick={() => {
              setManualSection('quick-start');
              setShowUserManual(true);
            }}
          >
            <span>📖</span>
            <span>{t.userManual}</span>
          </button>
          <button 
            className="settings__link" 
            onClick={() => {
              setManualSection('contact');
              setShowUserManual(true);
            }}
          >
            <span>📧</span>
            <span>{t.contactSupport}</span>
          </button>
          <button 
            className="settings__link" 
            onClick={() => {
              setManualSection('report');
              setShowUserManual(true);
            }}
          >
            <span>🐛</span>
            <span>{t.reportIssue}</span>
          </button>
        </div>
      </div>

      <UserManual 
        isOpen={showUserManual} 
        onClose={() => setShowUserManual(false)}
        initialSection={manualSection}
        language={preferences.language} // 传递语言参数
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
