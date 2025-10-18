import React from 'react';
import Settings from '../components/Settings';
import { User, UserPreferences } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SettingsPageProps {
  isSidebarCollapsed?: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isSidebarCollapsed }) => {
  const { user, updateUser } = useAuth();

  const handleUpdatePreferences = async (preferences: UserPreferences) => {
    try {
      console.log('=== 更新偏好设置调试 ===');
      console.log('收到的偏好设置:', preferences);
      
      // 🔥 修复：使用正确的字段名匹配后端API
      const updateData = {
        preferred_language: preferences.language,
        preferred_theme: preferences.theme,
      };
      
      console.log('发送给API的数据:', updateData);
      
      await updateUser(updateData);
      console.log('✅ 偏好设置更新成功');
    } catch (error) {
      console.error('❌ 更新偏好设置失败:', error);
    }
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    try {
      console.log('=== 更新用户资料调试 ===');
      console.log('更新用户资料数据:', data);
      
      await updateUser(data);
      console.log('✅ 用户资料更新成功');
    } catch (error) {
      console.error('❌ 更新用户信息失败:', error);
    }
  };

  const handleLogout = async () => {
    // 登出逻辑在AuthContext中处理
    window.location.href = '/login';
  };

  if (!user) {
    return <div>加载中...</div>;
  }

  // 🔥 修复：更安全的数据转换，确保兼容性
  const userForSettings: User = {
    ...user,
    name: user.username || user.name || 'Unknown User',
    avatar: user.avatar || undefined,
    preferences: {
      theme: user.preferred_theme || user.preferences?.theme || 'light',
      language: user.preferred_language || user.preferences?.language || 'zh_CN',
      notifications: user.preferences?.notifications ?? true,
    },
  };

  console.log('=== Settings 页面用户数据 ===');
  console.log('原始用户数据:', user);
  console.log('转换后的用户数据:', userForSettings);

  return (
    <Settings
      user={userForSettings}
      onUpdatePreferences={handleUpdatePreferences}
      onUpdateProfile={handleUpdateProfile}
      onLogout={handleLogout}
      isSidebarCollapsed={isSidebarCollapsed}
    />
  );
};

export default SettingsPage;
