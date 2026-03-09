import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { ChatSession, Semester } from '../types';
import { chatAPI, semesterAPI } from '../utils/api';
// 🔥 新增：导入AuthContext来获取用户信息
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatSessions: ChatSession[];
  onNewChat: () => void;
  onSessionSelect: (sessionId: string) => void;
  currentSessionId: string | null;
  selectedSemester: string;
  onSemesterChange: (semester: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  language?: 'zh_CN' | 'en';
  // 聊天管理回调
  onChatRenamed?: (sessionId: string, newTitle: string) => void;
  onChatDeleted?: (sessionId: string) => void;
  // 新增：聊天列表加载回调
  onChatListLoaded?: (sessions: ChatSession[]) => void;
  // 🔥 新增：聊天加载状态回调
  onChatLoading?: (isLoading: boolean, chatId?: string) => void;
}

// 新增：学期选项类型定义
interface SemesterOption {
  id: string;
  name: string;
  display: string;
  isDefault: boolean;
  semester?: Semester;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  chatSessions,
  onNewChat,
  onSessionSelect,
  currentSessionId,
  selectedSemester,
  onSemesterChange,
  onCollapseChange,
  language = 'zh_CN',
  onChatRenamed,
  onChatDeleted,
  onChatListLoaded,
  onChatLoading
}) => {
  // 🔥 获取用户信息
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number, left: number } | null>(null);
  
  // 新增：学期数据状态
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [semesterLoadError, setSemesterLoadError] = useState<string | null>(null);
  
  // Tooltip 相关状态
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number, left: number } | null>(null);
  
  // 聊天菜单相关状态
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  const [chatMenuPosition, setChatMenuPosition] = useState<{ top: number, left: number } | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  
  // 新建聊天加载状态
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatSuccess, setNewChatSuccess] = useState(false);

  // 🆕 新增：加载状态管理
  const [isLoadingChatList, setIsLoadingChatList] = useState(false);
  const [isRenamingChat, setIsRenamingChat] = useState<string | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState<string | null>(null);

  // 🔥 新增：聊天加载状态
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  const semesterDropdownRef = useRef<HTMLDivElement>(null);
  const coursesButtonRef = useRef<HTMLAnchorElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // i18n
  const { t } = useTranslation();

  // 🔥 修复：用户相关函数 - 移除不存在的 avatar_url 属性
  const getUserDisplayName = () => {
    if (user?.username) {
      return user.username;
    }
    
    if (user?.email) {
      const emailParts = user.email.split('@');
      if (emailParts.length > 0 && emailParts[0]) {
        return emailParts[0];
      }
    }
    
    return t('sidebar.user');
  };

  const getUserStatusText = () => {
    if (user?.role === 'admin') {
      return t('sidebar.admin');
    }
    
    return t('sidebar.online');
  };

  // 🔥 修复：getUserAvatar 函数 - 移除对 avatar_url 的引用
  const getUserAvatar = () => {
    // 🔥 直接返回默认头像，因为 User 类型中没有 avatar_url 属性
    return "/Head_Portrait.png";
    
    // 🔥 如果将来需要支持用户头像，可以考虑以下方案：
    // 1. 在 User 类型中添加 avatar_url 或 avatar 属性
    // 2. 使用用户名生成头像（如首字母头像）
    // 3. 集成第三方头像服务（如 Gravatar）
    
    // 例如，使用用户名首字母生成头像的方案：
    // if (user?.username) {
    //   const initial = user.username.charAt(0).toUpperCase();
    //   return `https://ui-avatars.com/api/?name=${initial}&background=10b981&color=fff&size=32`;
    // }
  };

  // 🔥 可选：如果想要基于用户名生成个性化头像，可以使用这个函数
  const getUserAvatarWithInitial = () => {
    if (user?.username) {
      // 使用用户名首字母生成头像
      const initial = user.username.charAt(0).toUpperCase();
      // 可以使用在线头像生成服务，或者返回默认头像
      // return `https://ui-avatars.com/api/?name=${initial}&background=10b981&color=fff&size=32`;
    }
    
    return "/Head_Portrait.png";
  };

  // 新增：加载学期数据
  useEffect(() => {
    const loadSemesters = async () => {
      setIsLoadingSemesters(true);
      setSemesterLoadError(null);
      
      try {
        const response = await semesterAPI.getSemesters();
        
        if (response.semesters && Array.isArray(response.semesters)) {
          // 按创建时间倒序排列，最新的学期在前面
          const sortedSemesters = response.semesters.sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.id - a.id;
          });
          
          setSemesters(sortedSemesters);
        } else {
          console.warn('学期数据格式不正确:', response);
          setSemesters([]);
        }
      } catch (error) {
        console.error('加载学期数据失败:', error);
        setSemesterLoadError(t('sidebar.loadError'));
        // 设置默认学期数据作为降级方案
        setSemesters([]);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    loadSemesters();
  }, []); // 学期数据与语言无关，只需加载一次

  // 生成学期选项 - 结合API数据和默认选项，修复类型定义
  const getSemesterOptions = (): SemesterOption[] => {
    const options: SemesterOption[] = [
      { 
        id: 'all', 
        name: t('sidebar.allSemesters'), 
        display: t('sidebar.allSemesters'),
        isDefault: true
      }
    ];

    // 添加从API获取的学期数据
    if (semesters.length > 0) {
      const apiSemesters: SemesterOption[] = semesters.map(semester => ({
        id: semester.id.toString(),
        name: semester.name,
        display: semester.name,
        isDefault: false,
        semester: semester // 这里包含完整的学期对象
      }));
      options.push(...apiSemesters);
    } else {
      // 如果API数据为空，添加一些默认选项作为降级
      const defaultSemesters: SemesterOption[] = [
        { 
          id: 'other', 
          name: t('sidebar.otherSemesters'), 
          display: t('sidebar.otherSemesters'),
          isDefault: true
        },
        { 
          id: '2025-26-T2', 
          name: `2025-26, ${t('sidebar.semesterFormat.t2')}`, 
          display: `2025-26 ${t('sidebar.semesterFormat.t2')}`,
          isDefault: true
        },
        { 
          id: '2025-26-T1', 
          name: `2025-26, ${t('sidebar.semesterFormat.t1')}`, 
          display: `2025-26 ${t('sidebar.semesterFormat.t1')}`,
          isDefault: true
        }
      ];
      options.push(...defaultSemesters);
    }

    return options;
  };

  // 导航菜单 - 根据语言动态生成
  const getNavigationItems = () => [
    { icon: '📖', label: t('sidebar.courseManagement'), path: '/courses', hasSubmenu: true },
    // 🔥 修改：API测试页面也只对admin1用户显示
    ...(user?.username === 'admin1' ? [
      { icon: '🧪', label: t('sidebar.apiTest'), path: '/api-test', hasSubmenu: false },
      { icon: '⚙️', label: t('sidebar.adminPanel'), path: '/admin', hasSubmenu: false }
    ] : [])
  ];

  const isCurrentPath = (path: string) => location.pathname === path;

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 处理学期下拉菜单
      if (
        showSemesterDropdown &&
        semesterDropdownRef.current && 
        !semesterDropdownRef.current.contains(event.target as Node) &&
        coursesButtonRef.current &&
        !coursesButtonRef.current.contains(event.target as Node)
      ) {
        setShowSemesterDropdown(false);
        setDropdownPosition(null);
      }

      // 处理聊天菜单
      if (
        showChatMenu &&
        chatMenuRef.current &&
        !chatMenuRef.current.contains(event.target as Node)
      ) {
        setShowChatMenu(null);
        setChatMenuPosition(null);
      }
    };

    if (showSemesterDropdown || showChatMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSemesterDropdown, showChatMenu]);

  // 窗口大小变化时更新位置
  useEffect(() => {
    const handleResize = () => {
      if (showSemesterDropdown && coursesButtonRef.current) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSemesterDropdown]);

  const updateDropdownPosition = () => {
    if (coursesButtonRef.current) {
      const rect = coursesButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top,
        left: rect.right + 8
      });
    }
  };

  const handleCoursesClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 如果下拉菜单已经显示，关闭它并允许跳转到当前选中的学期
    if (showSemesterDropdown) {
      setShowSemesterDropdown(false);
      setDropdownPosition(null);
      // 跳转到当前选中学期的课程页面
      navigate('/courses');
      return;
    }
    
    // 阻止默认跳转，显示下拉菜单
    event.preventDefault();
    updateDropdownPosition();
    setShowSemesterDropdown(true);
  };

  // 修改学期点击处理函数
  const handleSemesterClick = (semesterId: string) => {
    
    // 更新选中的学期
    onSemesterChange(semesterId);
    
    // 关闭下拉菜单
    setShowSemesterDropdown(false);
    setDropdownPosition(null);
    
    // 跳转到课程页面
    navigate('/courses');
  };

  // 获取当前学期显示名称
  const getCurrentSemesterDisplay = () => {
    const semesterOptions = getSemesterOptions();
    const current = semesterOptions.find(s => s.id === selectedSemester);
    
    if (current) {
      return current.display;
    }
    
    // 如果没找到匹配的，尝试从API数据中查找
    const apiSemester = semesters.find(s => s.id.toString() === selectedSemester);
    if (apiSemester) {
      return apiSemester.name;
    }
    
    // 默认显示
    return selectedSemester === 'all' ? t('sidebar.allSemesters') : t('sidebar.unknownSemester');
  };

  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // 通知父组件折叠状态变化
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
    
    // 可选：同步到 localStorage，供其他组件使用
    localStorage.setItem('sidebar-collapsed', String(newCollapsedState));
    
    if (showSemesterDropdown) {
      setShowSemesterDropdown(false);
      setDropdownPosition(null);
    }
    // 折叠/展开时隐藏 tooltip
    setShowTooltip(false);
  };

  // 组件挂载时通知初始状态
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  // 处理 tooltip 显示
  const handleTooltipShow = () => {
    if (isCollapsed && collapseButtonRef.current) {
      const rect = collapseButtonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2
      });
      setShowTooltip(true);
    }
  };

  // 处理 tooltip 隐藏
  const handleTooltipHide = () => {
    setShowTooltip(false);
    setTooltipPosition(null);
  };

  // 渲染 Tooltip
  const renderTooltip = () => {
    if (!showTooltip || !tooltipPosition || !isCollapsed) return null;

    return createPortal(
      <div
        className="sidebar__tooltip"
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translateX(-50%)',
          zIndex: 100000,
        }}
      >
        <div className="sidebar__tooltip-content">
          {t('sidebar.expandSidebar')}
        </div>
        <div className="sidebar__tooltip-arrow"></div>
      </div>,
      document.body
    );
  };

  // 修改下拉菜单渲染函数
  const renderDropdownPortal = () => {
    if (!showSemesterDropdown || !dropdownPosition || isCollapsed) return null;

    const semesterOptions = getSemesterOptions();

    return createPortal(
      <div 
        ref={semesterDropdownRef}
        className="sidebar__submenu sidebar__submenu--portal"
        style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          zIndex: 99999,
          width: '280px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          padding: '12px',
        }}
      >
        <div className="sidebar__submenu-header">
          <span className="sidebar__submenu-title">{t('sidebar.selectSemester')}</span>
          <span className="sidebar__submenu-current">{getCurrentSemesterDisplay()}</span>
        </div>

        {/* 加载状态或错误状态 */}
        {isLoadingSemesters && (
          <div className="sidebar__submenu-loading" style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#6b7280' 
          }}>
            {t('sidebar.loading')}
          </div>
        )}
        
        {semesterLoadError && (
          <div className="sidebar__submenu-error" style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#ef4444' 
          }}>
            {semesterLoadError}
          </div>
        )}

        {/* 学期选项列表 */}
        {!isLoadingSemesters && !semesterLoadError && (
          <>
            {semesterOptions.map((option) => (
              <button
                key={option.id}
                className={`sidebar__submenu-item ${
                  selectedSemester === option.id ? 'sidebar__submenu-item--active' : ''
                }`}
                onClick={() => handleSemesterClick(option.id)}
                title={option.name}
              >
                <span className="sidebar__submenu-icon">
                  {option.id === 'all' ? '📚' : option.isDefault ? '📅' : '🎓'}
                </span>
                <span className="sidebar__submenu-text">{option.display}</span>
                {/* 显示学期额外信息 - 修复类型错误 */}
                {!option.isDefault && option.semester && (
                  <span className="sidebar__submenu-meta" style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginLeft: 'auto'
                  }}>
                    ID: {option.semester.id}
                  </span>
                )}
              </button>
            ))}
            
            {/* 如果有API数据，显示数据来源信息 */}
            {semesters.length > 0 && (
              <div className="sidebar__submenu-footer" style={{
                marginTop: '8px',
                padding: '8px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {t('sidebar.semesterCount', { count: semesters.length })}
              </div>
            )}
          </>
        )}
      </div>,
      document.body
    );
  };

  // 新增：渲染聊天菜单
  const renderChatMenu = () => {
    if (!showChatMenu || !chatMenuPosition) return null;

    return createPortal(
      <div
        ref={chatMenuRef}
        className="sidebar__chat-menu"
        style={{
          position: 'fixed',
          top: chatMenuPosition.top,
          left: chatMenuPosition.left,
          zIndex: 99999,
        }}
      >
        <button
          className="sidebar__chat-menu-item"
          onClick={() => handleRenameChat(showChatMenu)}
        >
          <span className="sidebar__chat-menu-item-icon">✏️</span>
          {t('sidebar.renameChat')}
        </button>
        <button
          className="sidebar__chat-menu-item sidebar__chat-menu-item--danger"
          onClick={() => handleDeleteChat(showChatMenu)}
        >
          <span className="sidebar__chat-menu-item-icon">🗑️</span>
          {t('sidebar.deleteChat')}
        </button>
      </div>,
      document.body
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const locale = i18n.language === 'zh_CN' ? 'zh-CN' : 'en-US';
    
    if (days === 0) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return t('sidebar.yesterday');
    } else if (days < 7) {
      return t('sidebar.daysAgo', { days });
    } else {
      return date.toLocaleDateString(locale, { month: '2-digit', day: '2-digit' });
    }
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const navigationItems = getNavigationItems();

  // 聊天菜单处理函数
  const handleChatMenuClick = (event: React.MouseEvent, sessionId: string) => {
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setChatMenuPosition({
      top: rect.bottom + 4,
      left: rect.left
    });
    setShowChatMenu(sessionId);
  };

  const handleRenameChat = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setRenamingChatId(sessionId);
      setRenameValue(session.title);
      setShowChatMenu(null);
      setChatMenuPosition(null);
      
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 50);
    }
  };

  // 加载聊天列表
  const loadChatSessions = async () => {
    try {
      setIsLoadingChatList(true);
      
      // 添加最小加载时间，让用户看到加载效果
      const [response] = await Promise.all([
        chatAPI.getChats(),
      ]);
      
      
      if (response.chats && Array.isArray(response.chats)) {
        const formattedSessions = response.chats.map(chat => ({
          id: chat.id.toString(),
          title: chat.title,
          lastMessage: '',
          lastActivity: new Date(chat.updated_at),
          messages: [],
          chatType: chat.chat_type,
          courseId: chat.course_id || undefined,
        }));
        
        if (onChatListLoaded) {
          onChatListLoaded(formattedSessions);
        }
      }
    } catch (error) {
      console.error('加载聊天列表失败:', error);
    } finally {
      setIsLoadingChatList(false);
    }
  };

  // 🔥 修改：简化的新建聊天处理函数
  const handleNewChatClick = async () => {
    try {
      setIsCreatingNewChat(true);
      setNewChatSuccess(false);
      
      
      // 🔥 不直接创建聊天，只是导航并清空状态
      if (location.pathname !== '/chat') {
        navigate('/chat');
        // 给导航一点时间
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // 清空当前选中的会话，准备创建新聊天
      onNewChat(); // 这会清空 currentSessionId
      onSessionSelect(''); // 确保没有选中任何会话
      
      setNewChatSuccess(true);
      
      setTimeout(() => {
        setNewChatSuccess(false);
      }, 800);
      
      
    } catch (error) {
      console.error('准备新聊天失败:', error);
      alert('准备新聊天失败，请稍后重试');
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  // 组件挂载时加载聊天列表
  useEffect(() => {
    loadChatSessions();
  }, []);

  // 重命名提交处理
  const handleRenameSubmit = async () => {
    
    if (renamingChatId && renameValue.trim()) {
      try {
        setIsRenamingChat(renamingChatId);
        
        const chatId = parseInt(renamingChatId);
        
        if (isNaN(chatId)) {
          console.error('无效的聊天 ID:', renamingChatId);
          return;
        }
        
        const [updatedChat] = await Promise.all([
          chatAPI.updateChat(chatId, { title: renameValue.trim() }),
        ]);
        
        
        if (onChatRenamed) {
          onChatRenamed(renamingChatId, renameValue.trim());
        }
        
        setRenamingChatId(null);
        setRenameValue('');
        
      } catch (error) {
        console.error('重命名聊天失败:', error);
        alert('重命名失败，请检查网络连接和后端服务');
        
        setRenamingChatId(null);
        setRenameValue('');
      } finally {
        setIsRenamingChat(null);
      }
    } else {
      setRenamingChatId(null);
      setRenameValue('');
    }
  };

  // 删除聊天处理
  const handleDeleteChat = async (sessionId: string) => {
    
    if (window.confirm(t('sidebar.confirmDelete'))) {
      try {
        setIsDeletingChat(sessionId);
        
        const chatId = parseInt(sessionId);
        
        if (isNaN(chatId)) {
          console.error('无效的聊天 ID:', sessionId);
          return;
        }
        
        await Promise.all([
          chatAPI.deleteChat(chatId),
        ]);
        
        
        if (onChatDeleted) {
          onChatDeleted(sessionId);
        }
        
        setShowChatMenu(null);
        setChatMenuPosition(null);
        
        if (currentSessionId === sessionId) {
          onSessionSelect('');
        }
        
        
      } catch (error) {
        console.error('删除聊天失败:', error);
        alert('删除失败，请检查网络连接和后端服务');
        
        setShowChatMenu(null);
        setChatMenuPosition(null);
      } finally {
        setIsDeletingChat(null);
      }
    } else {
      setShowChatMenu(null);
      setChatMenuPosition(null);
    }
  };

  const handleRenameCancel = () => {
    setRenamingChatId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent) => {
    
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleRenameSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      handleRenameCancel();
    }
  };

  const handleRenameBlur = (event: React.FocusEvent) => {
    
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.sidebar__chat-menu-btn')) {
      return;
    }
    
    setTimeout(() => {
      handleRenameSubmit();
    }, 150);
  };

  // 🔥 修改：聊天项目点击处理 - 延长加载时间
  const handleChatItemClick = async (sessionId: string) => {
    if (renamingChatId === sessionId || isDeletingChat === sessionId || loadingChatId === sessionId) {
      return; // 防止在重命名、删除或加载时点击
    }

    try {
      
      // 🔥 设置加载状态
      setLoadingChatId(sessionId);
      onChatLoading?.(true, sessionId);
      
      // 🔥 立即更新选中状态（视觉反馈）
      onSessionSelect(sessionId);
      
      // 🔥 如果不在聊天页面，先跳转到聊天页面
      if (location.pathname !== '/chat') {
        navigate('/chat');
        // Give router navigation a moment
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // 增加聊天加载时间
      // Chat loading is now event-driven, no artificial delay needed
      
      
    } catch (error) {
      console.error('聊天加载失败:', error);
      // 加载失败时清除选中状态
      onSessionSelect('');
    } finally {
      // 🔥 清除加载状态
      setLoadingChatId(null);
      onChatLoading?.(false);
    }
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      {/* 侧边栏 */}
      <nav className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
        {/* 🔥 隐藏：折叠按钮 */}
        <button 
          ref={collapseButtonRef}
          className="sidebar__collapse-btn"
          onClick={handleCollapseToggle}
          onMouseEnter={handleTooltipShow}
          onMouseLeave={handleTooltipHide}
          onFocus={handleTooltipShow}
          onBlur={handleTooltipHide}
          aria-label={isCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
          style={{ display: 'none' }} // 🔥 隐藏折叠按钮
        >
          <div className="sidebar__collapse-icon">
            <span className={`sidebar__collapse-line ${isCollapsed ? 'sidebar__collapse-line--collapsed' : ''}`}></span>
            <span className={`sidebar__collapse-line ${isCollapsed ? 'sidebar__collapse-line--collapsed' : ''}`}></span>
          </div>
        </button>

        {/* 侧边栏内容 */}
        <div className={`sidebar__content ${isCollapsed ? 'sidebar__content--hidden' : ''}`}>
          {/* 品牌头部 */}
          <div className="sidebar__header">
            <Link 
              to="/chat" 
              className="sidebar__brand" 
              onClick={() => {
                onNewChat();
                navigate('/chat');
              }}
            >
              <img src="/iCU_Icon.png" alt="iCU Logo" className="sidebar__brand-icon" style={{ width: '32px', height: '32px' }} />
              <span className="sidebar__brand-text">iCU</span>
            </Link>
          </div>

          {/* 新建对话按钮 */}
          <div className="sidebar__section">
            <button
              className={`sidebar__nav-link sidebar__nav-link--new-chat ${
                isCreatingNewChat ? 'sidebar__nav-link--loading' : ''
              } ${
                newChatSuccess ? 'sidebar__nav-link--success' : ''
              }`}
              onClick={handleNewChatClick}
              disabled={isCreatingNewChat}
              style={{ 
                background: 'none', 
                border: 'none', 
                width: '100%',
                textAlign: 'left'
              }}
            >
              <span className="sidebar__nav-icon">
                {isCreatingNewChat ? (
                  <div className="sidebar__loading-spinner sidebar__loading-spinner--small"></div>
                ) : newChatSuccess ? (
                  '✅'
                ) : (
                  '➕'
                )}
              </span>
              <span className="sidebar__nav-text">
                {isCreatingNewChat 
                  ? t('sidebar.creating')
                  : newChatSuccess 
                  ? t('sidebar.created')
                  : t('sidebar.newChat')
                }
              </span>
            </button>
          </div>

          {/* 导航菜单 */}
          <div className="sidebar__section">
            <div className="sidebar__nav">
              {navigationItems.map((item) => (
                <div key={item.path} className="sidebar__nav-item-container">
                  <Link
                    ref={item.hasSubmenu ? coursesButtonRef : undefined}
                    to={item.path}
                    className={`sidebar__nav-link ${
                      isCurrentPath(item.path) ? 'sidebar__nav-link--active' : ''
                    }`}
                    onClick={item.hasSubmenu ? handleCoursesClick : undefined}
                  >
                    <span className="sidebar__nav-icon">{item.icon}</span>
                    <span className="sidebar__nav-text">{item.label}</span>
                    {item.hasSubmenu && (
                      <span className={`sidebar__nav-arrow ${showSemesterDropdown ? 'sidebar__nav-arrow--up' : ''}`}>▼</span>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 🔄 修改：历史聊天 - 添加加载状态显示 */}
          <div className="sidebar__section sidebar__section--flex">
            <div className="sidebar__section-title">
              {t('sidebar.chatHistory')}
              {isLoadingChatList && (
                <div className="sidebar__loading-spinner sidebar__loading-spinner--small" style={{ marginLeft: '8px' }}></div>
              )}
            </div>
            
            {/* 🔥 新增：整体聊天列表加载状态 */}
            {isLoadingChatList && chatSessions.length === 0 ? (
              <div className="sidebar__chat-list-loading">
                <div className="sidebar__chat-list-loading-content">
                  <div className="sidebar__loading-spinner sidebar__loading-spinner--large"></div>
                  <div className="sidebar__chat-list-loading-text">
                    {t('sidebar.loadingChatHistory')}
                  </div>
                  <div className="sidebar__chat-list-loading-subtitle">
                    {t('sidebar.loadingChatHistoryDesc')}
                  </div>
                </div>
                
                {/* 🔥 新增：骨架屏动画 */}
                <div className="sidebar__chat-list-skeleton">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="sidebar__chat-skeleton-item">
                      <div className="sidebar__chat-skeleton-icon"></div>
                      <div className="sidebar__chat-skeleton-content">
                        <div className="sidebar__chat-skeleton-title"></div>
                        <div className="sidebar__chat-skeleton-subtitle"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="sidebar__chat-list">
                {chatSessions.length === 0 ? (
                  <div className="sidebar__empty-state">
                    {t('sidebar.noChatHistory')}
                  </div>
                ) : (
                  <>
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`sidebar__chat-item ${
                          currentSessionId === session.id ? 'sidebar__chat-item--active' : ''
                        } ${
                          renamingChatId === session.id ? 'sidebar__chat-item--renaming' : ''
                        } ${
                          showChatMenu === session.id ? 'sidebar__chat-item--menu-open' : ''
                        } ${
                          isDeletingChat === session.id ? 'sidebar__chat-item--deleting' : ''
                        } ${
                          loadingChatId === session.id ? 'sidebar__chat-item--loading' : ''
                        }`}
                        onClick={() => handleChatItemClick(session.id)} // 🔥 修改：使用新的点击处理函数
                        title={renamingChatId !== session.id ? session.title : undefined}
                      >
                        <span className="sidebar__chat-icon">
                          {isDeletingChat === session.id ? (
                            <div className="sidebar__loading-spinner sidebar__loading-spinner--small sidebar__loading-spinner--delete"></div>
                          ) : loadingChatId === session.id ? (
                            <div className="sidebar__loading-spinner sidebar__loading-spinner--small sidebar__loading-spinner--chat"></div>
                          ) : (
                            '💬'
                          )}
                        </span>
                        <span className="sidebar__chat-text">
                          {isDeletingChat === session.id 
                            ? t('sidebar.deleting')
                            : loadingChatId === session.id
                            ? t('sidebar.loading')
                            : truncateText(session.title)
                        }
                        </span>
                        
                        {/* 重命名输入框 */}
                        {renamingChatId === session.id && (
                          <input
                            ref={renameInputRef}
                            type="text"
                            className="sidebar__chat-rename-input"
                            value={renameValue}
                            onChange={(e) => {
                              setRenameValue(e.target.value);
                            }}
                            onBlur={handleRenameBlur}
                            onKeyDown={handleRenameKeyDown}
                            placeholder={t('sidebar.renamePlaceholder')}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            disabled={isRenamingChat === session.id}
                            autoFocus
                          />
                        )}
                        
                        {/* 🔄 修改：三个点菜单按钮 - 添加重命名加载状态 */}
                        <button
                          className="sidebar__chat-menu-btn"
                          onClick={(e) => handleChatMenuClick(e, session.id)}
                          aria-label="聊天选项"
                          disabled={isDeletingChat === session.id || isRenamingChat === session.id}
                        >
                          <span className="sidebar__chat-menu-icon">
                            {isRenamingChat === session.id ? (
                              <div className="sidebar__loading-spinner sidebar__loading-spinner--small"></div>
                            ) : (
                              '⋯'
                            )}
                          </span>
                        </button>
                      </div>
                    ))}
                    
                    {/* 如果有更多聊天记录，显示加载更多按钮 */}
                    {chatSessions.length > 10 && (
                      <div className="sidebar__load-more">
                        <div className="sidebar__load-more-text">{t('sidebar.loadMore')}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 用户信息 */}
          <div className="sidebar__footer">
            <Link to="/settings" className="sidebar__user">
              <div className="sidebar__user-avatar">
                <img
                  src={getUserAvatar()}
                  alt={t('sidebar.userAvatar')}
                  className="sidebar__user-image"
                  onError={(e) => {
                    // 🔥 头像加载失败时使用默认头像
                    const target = e.target as HTMLImageElement;
                    target.src = "/Head_Portrait.png";
                  }}
                />
                <div className="sidebar__user-status"></div>
              </div>
              <div className="sidebar__user-info">
                {/* 🔥 显示真实用户名 */}
                <div className="sidebar__user-name" title={user?.username || getUserDisplayName()}>
                  {getUserDisplayName()}
                </div>
                {/* 🔥 显示用户状态或角色 */}
                <div className="sidebar__user-status-text">
                  {getUserStatusText()}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* 使用 Portal 渲染下拉菜单 */}
      {renderDropdownPortal()}

      {/* 使用 Portal 渲染聊天菜单 */}
      {renderChatMenu()}

      {/* 使用 Portal 渲染 Tooltip */}
      {renderTooltip()}
    </>
  );
};

export default Sidebar;
