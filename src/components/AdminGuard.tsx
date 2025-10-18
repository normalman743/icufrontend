import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#6b7280'
      }}>
        加载中...
      </div>
    );
  }

  // 检查用户是否为管理员
  if (!user || user.username !== 'admin1') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🚫
        </div>
        <h2 style={{
          color: '#ef4444',
          marginBottom: '8px',
          fontSize: '24px'
        }}>
          403 - 访问被拒绝
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '16px'
        }}>
          此页面仅限管理员访问
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          当前用户: {user?.username || '未登录'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;