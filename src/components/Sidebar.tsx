import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

// 国际化文本
const i18nTexts = {
  'zh_CN': {
    // 按钮和链接
    newChat: '新建对话',
    courseManagement: '课程管理',
    apiTest: 'API测试',
    settings: '设置',
    
    // 历史聊天
    chatHistory: '历史聊天',
    noChatHistory: '暂无聊天记录',
    loadMore: '滚动加载更多...',
    
    // 下拉菜单
    selectSemester: '选择学期',
    otherSemesters: '其他学期',
    allSemesters: '所有学期',
    
    // 用户状态
    online: '在线',
    
    // Tooltip
    expandSidebar: '展开侧边栏',
    collapseSidebar: '折叠侧边栏',
    
    // 学期格式
    semesterFormat: {
      't1': 'T1',
      't2': 'T2',
      'other': '其他学期'
    },
    
    // 新增：聊天菜单
    renameChat: '重命名',
    deleteChat: '删除',
    confirmDelete: '确定要删除这个对话吗？',
    renamePlaceholder: '输入新的对话标题...',
    
    // 加载状态
    loading: '加载中...',
    loadError: '加载失败',
  },
  'en': {
    // 按钮和链接
    newChat: 'New Chat',
    courseManagement: 'Course Management',
    apiTest: 'API Test',
    settings: 'Settings',
    
    // 历史聊天
    chatHistory: 'Chat History',
    noChatHistory: 'No chat history',
    loadMore: 'Scroll to load more...',
    
    // 下拉菜单
    selectSemester: 'Select Semester',
    otherSemesters: 'Other Semesters',
    allSemesters: 'All Semesters',
    
    // 用户状态
    online: 'Online',
    
    // Tooltip
    expandSidebar: 'Expand Sidebar',
    collapseSidebar: 'Collapse Sidebar',
    
    // 学期格式
    semesterFormat: {
      't1': 'T1',
      't2': 'T2',
      'other': 'Other Semesters'
    },
    
    // 新增：聊天菜单
    renameChat: 'Rename',
    deleteChat: 'Delete',
    confirmDelete: 'Are you sure you want to delete this chat?',
    renamePlaceholder: 'Enter new chat title...',
    
    // 加载状态
    loading: 'Loading...',
    loadError: 'Load failed',
  }
};

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

  // 获取当前语言的文本
  const t = i18nTexts[language] || i18nTexts['zh_CN'];

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
    
    return language === 'zh_CN' ? '用户' : 'User';
  };

  const getUserStatusText = () => {
    if (user?.role === 'admin') {
      return language === 'zh_CN' ? '管理员' : 'Admin';
    }
    
    return t.online;
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
        console.log('=== 开始加载学期数据 ===');
        const response = await semesterAPI.getSemesters();
        console.log('学期 API 响应:', response);
        
        if (response.semesters && Array.isArray(response.semesters)) {
          // 按创建时间倒序排列，最新的学期在前面
          const sortedSemesters = response.semesters.sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.id - a.id;
          });
          
          setSemesters(sortedSemesters);
          console.log('学期数据加载成功:', sortedSemesters);
        } else {
          console.warn('学期数据格式不正确:', response);
          setSemesters([]);
        }
      } catch (error) {
        console.error('加载学期数据失败:', error);
        setSemesterLoadError(t.loadError);
        // 设置默认学期数据作为降级方案
        setSemesters([]);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    loadSemesters();
  }, [t.loadError]);

  // 生成学期选项 - 结合API数据和默认选项，修复类型定义
  const getSemesterOptions = (): SemesterOption[] => {
    const options: SemesterOption[] = [
      { 
        id: 'all', 
        name: t.allSemesters, 
        display: t.allSemesters,
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
          name: t.otherSemesters, 
          display: t.otherSemesters,
          isDefault: true
        },
        { 
          id: '2025-26-T2', 
          name: `2025-26, ${t.semesterFormat.t2}`, 
          display: `2025-26 ${t.semesterFormat.t2}`,
          isDefault: true
        },
        { 
          id: '2025-26-T1', 
          name: `2025-26, ${t.semesterFormat.t1}`, 
          display: `2025-26 ${t.semesterFormat.t1}`,
          isDefault: true
        }
      ];
      options.push(...defaultSemesters);
    }

    return options;
  };

  // 导航菜单 - 根据语言动态生成
  const getNavigationItems = () => [
    { icon: '📖', label: t.courseManagement, path: '/courses', hasSubmenu: true },
    // 🔥 修改：API测试页面也只对admin1用户显示
    ...(user?.username === 'admin1' ? [
      { icon: '🧪', label: t.apiTest, path: '/api-test', hasSubmenu: false },
      { icon: '⚙️', label: language === 'zh_CN' ? '管理员面板' : 'Admin Panel', path: '/admin', hasSubmenu: false }
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
    console.log('=== 学期点击事件 ===');
    console.log('选择的学期ID:', semesterId);
    
    // 更新选中的学期
    onSemesterChange(semesterId);
    
    // 关闭下拉菜单
    setShowSemesterDropdown(false);
    setDropdownPosition(null);
    
    // 跳转到课程页面
    console.log('跳转到课程页面...');
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
    return selectedSemester === 'all' ? t.allSemesters : '未知学期';
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
          {t.expandSidebar}
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
          <span className="sidebar__submenu-title">{t.selectSemester}</span>
          <span className="sidebar__submenu-current">{getCurrentSemesterDisplay()}</span>
        </div>

        {/* 加载状态或错误状态 */}
        {isLoadingSemesters && (
          <div className="sidebar__submenu-loading" style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#6b7280' 
          }}>
            {t.loading}
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
                {language === 'zh_CN' ? `共 ${semesters.length} 个学期` : `${semesters.length} semesters`}
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
          {t.renameChat}
        </button>
        <button
          className="sidebar__chat-menu-item sidebar__chat-menu-item--danger"
          onClick={() => handleDeleteChat(showChatMenu)}
        >
          <span className="sidebar__chat-menu-item-icon">🗑️</span>
          {t.deleteChat}
        </button>
      </div>,
      document.body
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (language === 'zh_CN') {
      if (days === 0) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (days === 1) {
        return '昨天';
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      }
    } else {
      if (days === 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return `${days} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      }
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
      console.log('=== 开始加载聊天列表 ===');
      
      // 添加最小加载时间，让用户看到加载效果
      const [response] = await Promise.all([
        chatAPI.getChats(),
        new Promise(resolve => setTimeout(resolve, 500)) // 最少显示 500ms 加载状态
      ]);
      
      console.log('API 响应:', response);
      
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
        
        console.log('格式化后的聊天会话:', formattedSessions);
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
      
      console.log('=== 准备新建聊天 ===');
      
      // 🔥 不直接创建聊天，只是导航并清空状态
      if (location.pathname !== '/chat') {
        console.log('导航到聊天页面...');
        navigate('/chat');
        // 给导航一点时间
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 清空当前选中的会话，准备创建新聊天
      onNewChat(); // 这会清空 currentSessionId
      onSessionSelect(''); // 确保没有选中任何会话
      
      // 模拟一个短暂的加载过程，让用户感觉有响应
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNewChatSuccess(true);
      
      setTimeout(() => {
        setNewChatSuccess(false);
      }, 800);
      
      console.log('=== 新建聊天准备完成 ===');
      console.log('用户现在可以输入第一条消息来创建聊天');
      
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
    console.log('=== 开始保存重命名 ===');
    console.log('renamingChatId:', renamingChatId);
    console.log('renameValue:', `"${renameValue}"`);
    
    if (renamingChatId && renameValue.trim()) {
      try {
        setIsRenamingChat(renamingChatId);
        console.log('准备调用重命名 API...');
        
        const chatId = parseInt(renamingChatId);
        console.log('转换后的 chatId:', chatId);
        
        if (isNaN(chatId)) {
          console.error('无效的聊天 ID:', renamingChatId);
          return;
        }
        
        // 添加最小加载时间
        const [updatedChat] = await Promise.all([
          chatAPI.updateChat(chatId, { title: renameValue.trim() }),
          new Promise(resolve => setTimeout(resolve, 300))
        ]);
        
        console.log('API 重命名成功:', updatedChat);
        
        if (onChatRenamed) {
          console.log('调用父组件回调...');
          onChatRenamed(renamingChatId, renameValue.trim());
        }
        
        console.log('清除重命名状态...');
        setRenamingChatId(null);
        setRenameValue('');
        console.log('=== 重命名保存完成 ===');
        
      } catch (error) {
        console.error('重命名聊天失败:', error);
        alert('重命名失败，请检查网络连接和后端服务');
        
        setRenamingChatId(null);
        setRenameValue('');
      } finally {
        setIsRenamingChat(null);
      }
    } else {
      console.log('取消保存 - 条件不满足');
      setRenamingChatId(null);
      setRenameValue('');
    }
  };

  // 删除聊天处理
  const handleDeleteChat = async (sessionId: string) => {
    console.log('=== 开始删除聊天 ===');
    console.log('sessionId:', sessionId);
    
    if (window.confirm(t.confirmDelete)) {
      try {
        setIsDeletingChat(sessionId);
        console.log('准备调用删除 API...');
        
        const chatId = parseInt(sessionId);
        console.log('转换后的 chatId:', chatId);
        
        if (isNaN(chatId)) {
          console.error('无效的聊天 ID:', sessionId);
          return;
        }
        
        // 添加最小加载时间
        await Promise.all([
          chatAPI.deleteChat(chatId),
          new Promise(resolve => setTimeout(resolve, 300))
        ]);
        
        console.log('API 删除成功');
        
        if (onChatDeleted) {
          console.log('调用父组件删除回调...');
          onChatDeleted(sessionId);
        }
        
        setShowChatMenu(null);
        setChatMenuPosition(null);
        
        if (currentSessionId === sessionId) {
          console.log('删除的是当前聊天，清除选中状态...');
          onSessionSelect('');
        }
        
        console.log('=== 删除聊天完成 ===');
        
      } catch (error) {
        console.error('删除聊天失败:', error);
        alert('删除失败，请检查网络连接和后端服务');
        
        setShowChatMenu(null);
        setChatMenuPosition(null);
      } finally {
        setIsDeletingChat(null);
      }
    } else {
      console.log('用户取消删除');
      setShowChatMenu(null);
      setChatMenuPosition(null);
    }
  };

  const handleRenameCancel = () => {
    console.log('=== 取消重命名 ===');
    setRenamingChatId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent) => {
    console.log('=== 键盘事件 ===');
    console.log('按键:', event.key);
    console.log('当前值:', `"${renameValue}"`);
    
    if (event.key === 'Enter') {
      console.log('检测到回车键，准备保存...');
      event.preventDefault();
      event.stopPropagation();
      handleRenameSubmit();
    } else if (event.key === 'Escape') {
      console.log('检测到ESC键，准备取消...');
      event.preventDefault();
      event.stopPropagation();
      handleRenameCancel();
    }
  };

  const handleRenameBlur = (event: React.FocusEvent) => {
    console.log('=== 输入框失焦 ===');
    
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.sidebar__chat-menu-btn')) {
      console.log('焦点转移到了菜单按钮，不保存');
      return;
    }
    
    setTimeout(() => {
      console.log('延迟保存...');
      handleRenameSubmit();
    }, 150);
  };

  // 🔥 修改：聊天项目点击处理 - 延长加载时间
  const handleChatItemClick = async (sessionId: string) => {
    if (renamingChatId === sessionId || isDeletingChat === sessionId || loadingChatId === sessionId) {
      return; // 防止在重命名、删除或加载时点击
    }

    try {
      console.log('=== 点击聊天项目 ===');
      console.log('聊天ID:', sessionId);
      
      // 🔥 设置加载状态
      setLoadingChatId(sessionId);
      onChatLoading?.(true, sessionId);
      
      // 🔥 立即更新选中状态（视觉反馈）
      onSessionSelect(sessionId);
      
      // 🔥 如果不在聊天页面，先跳转到聊天页面
      if (location.pathname !== '/chat') {
        console.log('跳转到聊天页面...');
        navigate('/chat');
        // 给路由跳转更多时间
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // 🔥 增加聊天加载时间 - 从 800ms 增加到 2000ms
      // 这个时间可以根据实际情况调整：
      // - 1500ms: 适中的加载时间
      // - 2000ms: 给聊天记录充足的加载时间
      // - 2500ms: 对于较慢的网络环境
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('聊天加载完成');
      
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
          aria-label={isCollapsed ? t.expandSidebar : t.collapseSidebar}
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
                  ? (language === 'zh_CN' ? '创建中...' : 'Creating...')
                  : newChatSuccess 
                  ? (language === 'zh_CN' ? '创建成功！' : 'Created!')
                  : t.newChat
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
              {t.chatHistory}
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
                    {language === 'zh_CN' ? '加载聊天记录中...' : 'Loading chat history...'}
                  </div>
                  <div className="sidebar__chat-list-loading-subtitle">
                    {language === 'zh_CN' ? '请稍候，正在获取您的聊天历史' : 'Please wait, fetching your chat history'}
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
                    {t.noChatHistory}
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
                            ? (language === 'zh_CN' ? '删除中...' : 'Deleting...')
                            : loadingChatId === session.id
                            ? (language === 'zh_CN' ? '加载中...' : 'Loading...')
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
                              console.log('输入值变化:', `"${e.target.value}"`);
                              setRenameValue(e.target.value);
                            }}
                            onBlur={handleRenameBlur}
                            onKeyDown={handleRenameKeyDown}
                            placeholder={t.renamePlaceholder}
                            onClick={(e) => {
                              console.log('输入框被点击');
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
                        <div className="sidebar__load-more-text">{t.loadMore}</div>
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
                  alt={language === 'zh_CN' ? '用户头像' : 'User Avatar'}
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
