import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { ChatSession } from '../types';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  chatSessions: ChatSession[];
  onNewChat: () => void;
  onSessionSelect: (sessionId: string) => void;
  currentSessionId: string | null;
  selectedSemester: string;
  onSemesterChange: (semester: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  chatSessions,
  onNewChat,
  onSessionSelect,
  currentSessionId,
  selectedSemester,
  onSemesterChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapseChange = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed);
  };

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // 桌面端不需要打开状态
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="main-layout">
      {/* 移动端顶部菜单按钮 */}
      <div className="main-layout__mobile-header">
        <button 
          className="main-layout__menu-toggle"
          onClick={handleSidebarToggle}
          aria-label="打开菜单"
        >
          <span className="main-layout__menu-line"></span>
          <span className="main-layout__menu-line"></span>
          <span className="main-layout__menu-line"></span>
        </button>
        <div className="main-layout__mobile-brand">
          <img src="/iCU_Icon.png" alt="iCU" className="main-layout__mobile-brand-icon" />
          <span className="main-layout__mobile-brand-text">iCU</span>
        </div>
      </div>

      {/* 侧边栏 */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        chatSessions={chatSessions}
        onNewChat={onNewChat}
        onSessionSelect={onSessionSelect}
        currentSessionId={currentSessionId}
        selectedSemester={selectedSemester}
        onSemesterChange={onSemesterChange}
        onCollapseChange={handleSidebarCollapseChange}
      />

      {/* 主内容区域 */}
      <main 
        className={`main-layout__content ${
          sidebarCollapsed ? 'main-layout__content--sidebar-collapsed' : ''
        }`}
      >
        <div className="main-layout__content-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;