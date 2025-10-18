import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  sidebar,
  sidebarOpen = false,
  onToggleSidebar
}) => {
  return (
    <div className={`layout ${sidebarOpen ? 'layout--sidebar-open' : ''}`}>
      {/* 侧边栏容器 - 只有当sidebar存在时才渲染 */}
      {sidebar && (
        <div className="layout__sidebar">
          {sidebar}
        </div>
      )}
      
      {/* 主内容区 */}
      <main className="layout__main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
