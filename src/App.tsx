import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import CoursesPage from './pages/CoursesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ApiTestPage from './pages/ApiTestPage';
import CourseChat from './components/CourseChat';
import WelcomePage from './pages/WelcomePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatSession, ChatMessage, Course, Semester, AIModel } from './types';
import { chatAPI, courseAPI, semesterAPI } from './utils/api';
import './App.css';
import AdminPage from './pages/AdminPage';

// 认证路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 主应用组件
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // 🔥 新增：右侧聊天加载状态
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  // 🔥 新增：处理聊天加载状态
  const handleChatLoading = (isLoading: boolean, chatId?: string) => {
    console.log('App: 聊天加载状态变化', { isLoading, chatId });
    setIsChatLoading(isLoading);
    setLoadingChatId(chatId || null);
  };

  // 从用户偏好中获取语言设置
  const userLanguage = user?.preferred_language || 'zh_CN';

  // 加载学期数据
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const response = await semesterAPI.getSemesters();
        setSemesters(response.semesters);
      } catch (error) {
        console.error('加载学期失败:', error);
      }
    };

    loadSemesters();
  }, []);

  // 加载课程数据
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await courseAPI.getCourses();
        setCourses(response.courses);
      } catch (error) {
        console.error('加载课程失败:', error);
      }
    };

    loadCourses();
  }, [selectedSemester]);

  // 处理聊天列表加载
  const handleChatListLoaded = (sessions: ChatSession[]) => {
    console.log('App: 聊天列表已加载', sessions);
    setChatSessions(sessions);
  };

  // 处理侧边栏切换
  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // 处理学期变化
  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    console.log('App: 学期已切换到', semester);
  };

  // 处理侧边栏折叠状态变化
  const handleSidebarCollapseChange = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
    console.log('App: 侧边栏折叠状态', isCollapsed);
  };

  // 🔥 新增：处理会话选择
  const handleSessionSelect = (sessionId: string) => {
    console.log('App: 选择会话', sessionId);
    setCurrentSessionId(sessionId);
  };

  // 🔥 新增：处理聊天重命名
  const handleChatRenamed = (chatId: string, newTitle: string) => {
    console.log('App: 重命名聊天', chatId, newTitle);
    setChatSessions(prev => 
      prev.map(session => 
        session.id === chatId 
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  // 🔥 新增：处理聊天删除
  const handleChatDeleted = (chatId: string) => {
    console.log('App: 删除聊天', chatId);
    setChatSessions(prev => prev.filter(session => session.id !== chatId));
    // 如果删除的是当前聊天，清空当前聊天ID
    if (currentSessionId === chatId) {
      setCurrentSessionId(null);
    }
  };

  // 修改新建聊天处理 - 简化逻辑，主要由 Sidebar 处理
  const handleNewChat = () => {
    setCurrentSessionId(null);
    console.log('App: 准备创建新聊天');
  };

  // 修复：创建新会话函数，确保消息顺序正确
  const createNewSession = async (firstMessage: string, fileTokens: string[] = [], model?: AIModel): Promise<string> => {
    try {
      console.log('App: 创建新会话，首条消息:', firstMessage);
      console.log('App: 文件tokens:', fileTokens);
      console.log('App: 使用的AI模型:', model);
      
      // 🔥 确保token格式正确
      const validTokens = fileTokens.filter(token => 
        token && typeof token === 'string' && token.trim() !== ''
      );
      
      console.log('App: 验证后的tokens:', validTokens);
      
      // 🔥 构建创建聊天的数据 - 确保包含所有必需字段
      const createChatData = {
        chat_type: 'general' as const,
        first_message: firstMessage.trim(),
        ai_model: model || AIModel.STAR,
        search_enabled: false,
        context_mode: 'Standard',
        stream: false,
        ...(validTokens.length > 0 && {
          temporary_file_tokens: validTokens
        })
      };
      
      console.log('=== 创建聊天的完整数据 ===');
      console.log(JSON.stringify(createChatData, null, 2));
      
      const response = await chatAPI.createChat(createChatData);
      
      if (response.chat) {
        // 🔥 修复：使用服务器返回的时间戳，确保消息顺序正确
        const initialMessages: ChatMessage[] = [];
        
        // 🔥 关键修复：如果API返回了AI消息，说明这是一个完整的对话
        // 用户消息应该已经在服务器端创建，我们需要重新获取完整的消息列表
        if (response.ai_message) {
          try {
            // 获取完整的聊天消息
            const chatMessages = await chatAPI.getChatMessages(response.chat.id);
            if (chatMessages.messages && chatMessages.messages.length > 0) {
              // 使用服务器返回的完整消息列表，确保顺序正确
              initialMessages.push(...chatMessages.messages.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              ));
            }
          } catch (error) {
            console.warn('获取聊天消息失败，使用备用方案:', error);
            // 备用方案：手动创建消息（如果上面的方案失败）
            const userMessage: ChatMessage = {
              id: Date.now(),
              chat_id: response.chat.id,
              content: firstMessage,
              role: 'user',
              model_name: null,
              tokens_used: null,
              cost: null,
              response_time_ms: null,
              rag_sources: null,
              created_at: new Date(Date.now() - 1000).toISOString(), // 🔥 确保用户消息在前
              file_attachments: null,
            };
            initialMessages.push(userMessage, response.ai_message);
          }
        } else {
          // 如果没有AI回复，只添加用户消息
          const userMessage: ChatMessage = {
            id: Date.now(),
            chat_id: response.chat.id,
            content: firstMessage,
            role: 'user',
            model_name: null,
            tokens_used: null,
            cost: null,
            response_time_ms: null,
            rag_sources: null,
            created_at: new Date().toISOString(),
            file_attachments: null,
          };
          initialMessages.push(userMessage);
        }
        
        const newSession: ChatSession = {
          id: response.chat.id.toString(),
          title: response.chat.title,
          lastMessage: response.ai_message?.content || firstMessage,
          lastActivity: new Date(),
          messages: initialMessages, // 🔥 使用正确排序的消息
          chatType: response.chat.chat_type,
          courseId: response.chat.course_id ?? undefined,
        };
        
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        
        console.log('App: 新会话创建成功:', newSession.id);
        console.log('App: 初始消息数量:', initialMessages.length);
        return newSession.id;
      } else {
        throw new Error('创建会话失败：没有返回会话数据');
      }
    } catch (error) {
      console.error('App: 创建新会话失败:', error);
      
      if (error instanceof Error && 'status' in error) {
        const apiError = error as any;
        if (apiError.status === 422) {
          console.error('API验证失败详情:', {
            status: apiError.status,
            code: apiError.code,
            details: apiError.details,
            message: apiError.message
          });
          throw new Error('创建聊天失败：请求参数验证失败，请确保消息内容完整');
        }
      }
      
      throw error;
    }
  };

  // 修复：添加消息到会话 - 返回 Promise<void>
  const addMessageToSession = async (sessionId: string, message: ChatMessage): Promise<void> => {
    try {
      console.log('App: 添加消息到会话', sessionId, message);
      
      // 立即更新本地状态
      setChatSessions(prev => 
        prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: [...session.messages, message],
              lastMessage: message.content,
              lastActivity: new Date(),
              title: session.messages.length === 0 ? 
                (message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content) : 
                session.title
            };
          }
          return session;
        })
      );
      
      // 如果是用户消息，同时发送到API
      if (message.role === 'user') {
        await chatAPI.sendMessage(parseInt(sessionId), {
          content: message.content,
          ai_model: AIModel.STAR, // 默认模型
        });
      }
    } catch (error) {
      console.error('添加消息到会话失败:', error);
      // 即使API失败，本地状态已经更新，用户可以看到消息
    }
  };

  // 🔥 新增：消息去重函数
  const deduplicateMessages = useCallback((messages: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<number>();
    return messages.filter(message => {
      const id = typeof message.id === 'string' ? parseInt(message.id) : message.id;
      if (seen.has(id)) {
        console.log('App: 发现重复消息，已去除:', id);
        return false;
      }
      seen.add(id);
      return true;
    });
  }, []);

  // 🔥 新增：批量设置消息回调
  const handleBatchMessagesLoaded = useCallback((sessionId: string, messages: ChatMessage[]) => {
    console.log('App: 批量加载消息到会话', sessionId, messages.length);
    
    // 去重和排序
    const uniqueMessages = deduplicateMessages(messages);
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    setChatSessions(prev => 
      prev.map(session => {
        if (session.id === sessionId) {
          console.log(`App: 为会话 ${sessionId} 设置 ${sortedMessages.length} 条消息`);
          return {
            ...session,
            messages: sortedMessages, // 🔥 直接替换，不是追加
            lastMessage: sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].content : session.lastMessage,
            lastActivity: sortedMessages.length > 0 ? new Date(sortedMessages[sortedMessages.length - 1].created_at) : session.lastActivity,
          };
        }
        return session;
      })
    );
  }, [deduplicateMessages]);

  // 🔥 修复：单个消息添加 - 只保留一个定义
  const handleMessageSent = useCallback((message: ChatMessage) => {
    if (currentSessionId) {
      setChatSessions(prev => 
        prev.map(session => {
          if (session.id === currentSessionId) {
            // 🔥 检查消息是否已存在
            const messageId = typeof message.id === 'string' ? parseInt(message.id) : message.id;
            const messageExists = session.messages.some(m => {
              const existingId = typeof m.id === 'string' ? parseInt(m.id) : m.id;
              return existingId === messageId;
            });
            
            if (messageExists) {
              console.log('App: 消息已存在，跳过添加:', messageId);
              return session;
            }
            
            // 添加新消息并去重排序
            const newMessages = [...session.messages, message];
            const uniqueMessages = deduplicateMessages(newMessages);
            const sortedMessages = uniqueMessages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            return {
              ...session,
              messages: sortedMessages,
              lastMessage: message.content,
              lastActivity: new Date(message.created_at),
            };
          }
          return session;
        })
      );
    }
  }, [currentSessionId, deduplicateMessages]);

  // 🔥 修复：获取当前会话时确保消息去重
  const getCurrentSession = useCallback((): ChatSession | null => {
    const session = chatSessions.find(session => session.id === currentSessionId);
    if (!session) return null;
    
    // 确保消息去重
    const uniqueMessages = deduplicateMessages(session.messages);
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    if (sortedMessages.length !== session.messages.length) {
      console.log(`App: 当前会话消息去重：${session.messages.length} -> ${sortedMessages.length}`);
    }
    
    return {
      ...session,
      messages: sortedMessages
    };
  }, [chatSessions, currentSessionId, deduplicateMessages]);

  // 新增：处理错误回调
  const handleApiError = (error: string) => {
    console.error('API错误:', error);
    // 这里可以显示错误通知给用户
  };

  // 创建 Sidebar 组件，传递正确的回调
  const sidebarComponent = (
    <Sidebar
      isOpen={sidebarOpen}
      onToggle={handleToggleSidebar}
      chatSessions={chatSessions}
      onNewChat={handleNewChat}
      onSessionSelect={handleSessionSelect}
      currentSessionId={currentSessionId}
      selectedSemester={selectedSemester}
      onSemesterChange={handleSemesterChange}
      onCollapseChange={handleSidebarCollapseChange}
      language={userLanguage}
      onChatRenamed={handleChatRenamed}
      onChatDeleted={handleChatDeleted}
      onChatListLoaded={handleChatListLoaded}
      onChatLoading={handleChatLoading}
    />
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/api-test" element={<ApiTestPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/welcome/:section" element={<WelcomePage />} />

        {/* 课程聊天路由 - 支持 courseId 和 courseName 两种方式 */}
        <Route
          path="/course-chat/:courseId"
          element={
            <ProtectedRoute>
              <CourseChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-chat/name/:courseName"
          element={
            <ProtectedRoute>
              <CourseChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <WelcomePage />
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout
                sidebar={sidebarComponent}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={handleToggleSidebar}
              >
                <ChatPage
                  currentSession={getCurrentSession()}
                  currentSessionId={currentSessionId}
                  onCreateNewSession={createNewSession}
                  onAddMessage={addMessageToSession}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onMessageSent={handleMessageSent}
                  onBatchMessagesLoaded={handleBatchMessagesLoaded}
                  onError={handleApiError}
                  isChatLoading={isChatLoading}
                  loadingChatId={loadingChatId}
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <Layout 
                sidebar={sidebarComponent}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={handleToggleSidebar}
              >
                <CoursesPage
                  selectedSemester={selectedSemester}
                  onSemesterChange={handleSemesterChange}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout 
                sidebar={sidebarComponent}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={handleToggleSidebar}
              >
                <SettingsPage isSidebarCollapsed={isSidebarCollapsed} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Layout 
                sidebar={sidebarComponent}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={handleToggleSidebar}
              >
                <AdminPage isSidebarCollapsed={isSidebarCollapsed} />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// 根应用组件
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
