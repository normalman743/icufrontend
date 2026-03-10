import React, { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import { ChatSession, ChatMessage, AIModel } from '../types';
import { chatAPI, fileAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface ChatPageProps {
  currentSession: ChatSession | null;
  currentSessionId: string | null;
  onCreateNewSession: (firstMessage: string, fileTokens?: string[], model?: AIModel, searchEnabled?: boolean) => Promise<string>;
  onAddMessage: (sessionId: string, message: ChatMessage) => Promise<void>;
  onCreateNewChat?: (model?: AIModel, searchEnabled?: boolean) => void; // 🔥 模型/搜索切换时创建新对话
  isSidebarCollapsed?: boolean;
  onMessageSent?: (message: ChatMessage) => void;
  onBatchMessagesLoaded?: (sessionId: string, messages: ChatMessage[]) => void; // 🔥 新增批量消息回调
  onError?: (error: string) => void;
  isChatLoading?: boolean;
  loadingChatId?: string | null;
}

const ChatPage: React.FC<ChatPageProps> = ({
  currentSession,
  currentSessionId,
  onCreateNewSession,
  onAddMessage,
  onCreateNewChat, // 🔥 模型/搜索切换时创建新对话
  isSidebarCollapsed,
  onMessageSent,
  onBatchMessagesLoaded, // 🔥 新增
  onError,
  isChatLoading,
  loadingChatId
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNewSession, setIsCreatingNewSession] = useState(false);
  const [pendingFileTokens, setPendingFileTokens] = useState<string[]>([]);
  
  // 🔥 修复：将Hooks移到顶层
  const [loadingStage, setLoadingStage] = useState(0);

  // 获取用户语言设置
  const userLanguage = user?.preferred_language || 'zh_CN';

  // 🔥 修复：将useEffect移到顶层，并添加条件判断
  useEffect(() => {
    if (isChatLoading) {
      const stages = [
        { delay: 0, stage: 0 },
        { delay: 800, stage: 1 },
        { delay: 1600, stage: 2 },
        { delay: 2400, stage: 3 },
        { delay: 3200, stage: 4 },
        { delay: 3800, stage: 5 }
      ];
      
      const timeouts = stages.map(({ delay, stage }) => 
        setTimeout(() => {
          if (isChatLoading) {
            setLoadingStage(stage);
          }
        }, delay)
      );
      
      // 清理函数
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
        setLoadingStage(0);
      };
    } else {
      // 如果不在加载状态，重置阶段
      setLoadingStage(0);
    }
  }, [isChatLoading]);
  // 处理文件上传回调 (kept for backwards compat, no longer drives new-session flow)
  const handleFilesUploaded = (fileTokens: string[]) => {
    console.log('ChatPage: 收到文件tokens (备用):', fileTokens);
    setPendingFileTokens(fileTokens);
  };

  // 发送消息处理
  const handleSendMessage = async (content: string, files?: globalThis.File[], model?: AIModel, searchEnabled?: boolean, fileTokens?: string[]) => {
    // 🔥 修复：优先使用直接传入的fileTokens，fallback到pendingFileTokens
    const resolvedFileTokens = (fileTokens && fileTokens.length > 0) ? fileTokens : pendingFileTokens;

    if (!content.trim() && (!files || files.length === 0) && resolvedFileTokens.length === 0) return;

    // 如果是新会话，显示创建聊天加载状态
    if (!currentSessionId) {
      setIsCreatingNewSession(true);
    } else {
      setIsLoading(true);
    }    try {
      if (!currentSessionId) {
        console.log('ChatPage: 创建新会话，消息:', content);
        console.log('ChatPage: 使用的AI模型:', model);
        console.log('ChatPage: 使用的文件tokens (resolved):', resolvedFileTokens);
        
        // 🔥 修复：传入resolvedFileTokens而非pendingFileTokens，避免异步竞态
        const newSessionId = await onCreateNewSession(content.trim(), resolvedFileTokens, model, searchEnabled);
        console.log('新聊天创建成功，ID:', newSessionId);
        
        // 清空pending tokens
        setPendingFileTokens([]);
      } else {
        // 如果是现有会话，直接发送消息
        const userMessage: ChatMessage = {
          id: Date.now() + Math.random(),
          chat_id: parseInt(currentSessionId),
          content: content.trim(),
          role: 'user',
          model_name: model || null,
          tokens_used: null,
          cost: null,
          response_time_ms: null,
          rag_sources: null,
          created_at: new Date().toISOString(),
          file_attachments: null,
        };

        await onAddMessage(currentSessionId, userMessage);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      onError?.(error instanceof Error ? error.message : '发送消息失败');
    } finally {
      setIsLoading(false);
      setIsCreatingNewSession(false);
    }
  };

  // 获取加载文本
  const getLoadingText = () => {
    const stages = userLanguage === 'zh_CN' ? [
      '正在连接聊天服务...',
      '正在验证访问权限...',
      '正在加载聊天记录...',
      '正在解析历史消息...',
      '正在渲染消息界面...',
      '即将完成...'
    ] : [
      'Connecting to chat service...',
      'Verifying access permissions...',
      'Loading chat history...',
      'Parsing message history...',
      'Rendering message interface...',
      'Almost ready...'
    ];
    
    return stages[loadingStage] || stages[0];
  };

  // 🔥 聊天加载界面
  if (isChatLoading && loadingChatId) {
    return (
      <div className={`chat-loading-page ${isSidebarCollapsed ? 'chat-loading-page--sidebar-collapsed' : ''}`}>
        <div className="chat-loading-page-content">
          <div className="chat-loading-page-animation">
            <div className="chat-loading-spinner chat-loading-spinner--extra-large"></div>
            <div className="chat-loading-page-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="chat-loading-page-text">
            <div className="chat-loading-page-title">
              {userLanguage === 'zh_CN' ? '正在加载聊天' : 'Loading Chat'}
            </div>
            <div className="chat-loading-page-subtitle">
              {getLoadingText()}
            </div>
            <div className="chat-loading-page-chat-id">
              {userLanguage === 'zh_CN' ? `聊天 ID: ${loadingChatId}` : `Chat ID: ${loadingChatId}`}
            </div>
            {/* 🔥 加载进度条 */}
            <div className="chat-loading-progress">
              <div className="chat-loading-progress-bar" style={{
                width: `${((loadingStage + 1) / 6) * 100}%`, // 6个阶段
                transition: 'width 0.5s ease-out'
              }}></div>
            </div>
          </div>
        </div>
        
        {/* 🔥 装饰动画 */}
        <div className="chat-loading-page-decoration">
          <div className="chat-loading-decoration-circle chat-loading-decoration-circle--1"></div>
          <div className="chat-loading-decoration-circle chat-loading-decoration-circle--2"></div>
          <div className="chat-loading-decoration-circle chat-loading-decoration-circle--3"></div>
          <div className="chat-loading-decoration-line chat-loading-decoration-line--1"></div>
          <div className="chat-loading-decoration-line chat-loading-decoration-line--2"></div>
        </div>
      </div>
    );
  }

  return (
    <Chat
      currentSession={currentSession}
      onSendMessage={handleSendMessage}
      onCreateNewChat={onCreateNewChat} // 🔥 传递模型切换创建新对话回调
      isLoading={isChatLoading && loadingChatId === currentSessionId}
      isSidebarCollapsed={isSidebarCollapsed}
      onMessageSent={onMessageSent}
      onBatchMessagesLoaded={onBatchMessagesLoaded} // 🔥 传递批量消息回调
      onError={onError}
      onFilesUploaded={handleFilesUploaded}
    />
  );
};

export default ChatPage;
