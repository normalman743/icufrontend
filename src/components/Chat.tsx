import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage, AIModel } from '../types';
import { chatAPI } from '../utils/api';
import ModelSelector from './ModelSelector';
import './Chat.css';
import { createPortal } from 'react-dom';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  token?: string; // 临时文件的token - 这个很重要！
  expires_at?: string;
}

interface ChatProps {
  currentSession: ChatSession | null;
  onSendMessage: (content: string, files?: File[], model?: AIModel, searchEnabled?: boolean) => void;
  onCreateNewChat?: (model?: AIModel, searchEnabled?: boolean) => void; // 🔥 新增创建新对话回调
  isLoading?: boolean;
  isSidebarCollapsed?: boolean;
  language?: 'zh_CN' | 'en';
  onMessageSent?: (message: ChatMessage) => void;
  onBatchMessagesLoaded?: (sessionId: string, messages: ChatMessage[]) => void; // 🔥 新增批量消息回调
  onError?: (error: string) => void;
  onFilesUploaded?: (fileTokens: string[]) => void;
}

// 国际化文本
const i18nTexts = {
  'zh_CN': {
    // 主要问候语
    mainGreeting: 'I See U！我是Intelligent CU，您的AI学习助手',
    
    // 随机问候语
    randomGreetings: [
      '准备好开始学习之旅了吗？',
      '有什么我可以帮助您的吗？',
      '让我们一起探索知识的海洋',
      '今天想学习什么新内容呢？',
      '我在这里随时为您提供帮助'
    ],
    
    // 🔥 新增：9个预定义的消息建议（来自workflowExamples）
    messageSuggestions: [
      '本周香港天气怎么样？',
      'CSCI3100这门课难不难？',
      'NA体育馆在哪里？开放时间是什么？',
      '深度学习领域最近有什么重大突破？',
      '比较一下CSCI3100和CSCI3160，应该选哪个？',
      '如何规划计算机专业的选课路径？',
      '用Python写一个快速排序算法',
      '我的C++作业编译报错，帮我看看哪里错了',
      'CUHK的CSCI课程主要用什么编程语言？'
    ],
    
    // 界面文本
    inputPlaceholder: 'How can I help you?',
    uploadFile: '上传文件',
    removeFile: '删除文件',
    addFile: '添加文件',
    cancel: '取消',
    addToChat: '添加到聊天框',
    dropFileHint: '释放文件以上传',
    sources: '来源',
    
    // 文件类型
    fileSize: '大小',
    fileName: '文件名',

    // 🔥 新增文本
    deepSearch: '深度搜索',
    deepSearchTooltip: '启用知识库深度搜索功能',
    modelSwitchConfirm: '切换模型需要创建新对话，是否继续？',
    searchToggleConfirm: '修改搜索设置需要创建新对话，是否继续？',
    createNewChatWithModel: '是否创建新对话并使用该模型？',
    createNewChatWithSearch: '是否创建新对话并开启深度搜索功能？',
    createNewChatWithoutSearch: '是否创建新对话并取消深度搜索功能？',
    confirm: '确认',
    cancelAction: '取消' // 🔥 修改为 cancelAction 避免重复
  },
  'en': {
    // 主要问候语
    mainGreeting: 'I See U! I\'m Intelligent CU, your AI learning assistant',
    
    // 随机问候语
    randomGreetings: [
      'Ready to start your learning journey?',
      'How can I help you today?',
      'Let\'s explore the ocean of knowledge together',
      'What would you like to learn today?',
      'I\'m here to help you anytime'
    ],
    
    // 🔥 新增：9个预定义的消息建议（来自workflowExamples）
    messageSuggestions: [
      'What\'s the weather like in Hong Kong this week?',
      'Is CSCI3100 difficult?',
      'Where is the NA Sports Complex? What are the opening hours?',
      'What are the recent major breakthroughs in deep learning?',
      'Compare CSCI3100 and CSCI3160, which should I choose?',
      'How to plan the course path for Computer Science major?',
      'Write a quicksort algorithm in Python',
      'My C++ assignment has compile errors, help me find the bugs',
      'What programming languages are mainly used in CUHK CSCI courses?'
    ],
    
    // 界面文本
    inputPlaceholder: 'How can I help you?',
    uploadFile: 'Upload File',
    removeFile: 'Remove File',
    addFile: 'Add File',
    cancel: 'Cancel',
    addToChat: 'Add to Chat',
    dropFileHint: 'Drop files to upload',
    sources: 'Sources',
    
    // 文件类型
    fileSize: 'Size',
    fileName: 'File Name',

    // 🔥 新增文本
    deepSearch: 'Deep Search',
    deepSearchTooltip: 'Enable knowledge base deep search',
    modelSwitchConfirm: 'Switching models requires creating a new chat. Continue?',
    searchToggleConfirm: 'Changing search settings requires creating a new chat. Continue?',
    createNewChatWithModel: 'Create new chat and use this model?',
    createNewChatWithSearch: 'Create new chat and enable deep search?',
    createNewChatWithoutSearch: 'Create new chat and disable deep search?',
    confirm: 'Confirm',
    cancelAction: 'Cancel' // 🔥 修改为 cancelAction 避免重复
  }
};

// 🔥 新增：文件名截断函数 - 在组件开始处添加
const truncateFileName = (fileName: string, maxLength: number = 20): string => {
  if (fileName.length <= maxLength) return fileName;
  
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
  const maxNameLength = maxLength - extension.length - 4; // 为 "..." 和 "." 留空间
  
  if (maxNameLength > 0) {
    return `${nameWithoutExt.slice(0, maxNameLength)}...${extension}`;
  }
  
  return `${fileName.slice(0, maxLength - 3)}...`;
};

const Chat: React.FC<ChatProps> = ({ 
  currentSession, 
  onSendMessage, 
  onCreateNewChat, // 🔥 新增参数
  isLoading: externalLoading, 
  isSidebarCollapsed,
  language = 'zh_CN',
  onMessageSent,
  onBatchMessagesLoaded, // 🔥 确保接收这个参数
  onError,
  onFilesUploaded
}) => {
  const [inputValue, setInputValue] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadConfirm, setUploadConfirm] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [scrollInfo, setScrollInfo] = useState({ top: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileStatuses, setFileStatuses] = useState<{ [key: string]: string }>({});
  const [isFullscreenLoading, setIsFullscreenLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  // 🔥 新增：AI模型选择状态
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.STAR);
  // 🔥 新增状态
  const [searchEnabled, setSearchEnabled] = useState(false); // 深度搜索状态
  const [showModelConfirm, setShowModelConfirm] = useState(false);
  const [showSearchConfirm, setShowSearchConfirm] = useState(false);
  const [pendingModel, setPendingModel] = useState<AIModel | null>(null);
  const [pendingSearch, setPendingSearch] = useState<boolean | null>(null);
  
  // 🔥 获取当前对话的初始模型和搜索设置
  const [initialModel, setInitialModel] = useState<AIModel>(AIModel.STAR);
  const [initialSearchEnabled, setInitialSearchEnabled] = useState(false);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  // 🔥 新增：loading防抖ref，防止重复加载
  const loadingRef = useRef<boolean>(false);
  const lastLoadedSessionRef = useRef<string | null>(null);

  // 🔥 新增：加号菜单状态
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // 合并外部和内部的loading状态
  const isLoading = externalLoading || internalLoading;

  // 获取当前语言的文本
  const t = i18nTexts[language] || i18nTexts['zh_CN'];

  const getRandomGreeting = () => {
    const randomIndex = Math.floor(Math.random() * t.randomGreetings.length);
    return t.randomGreetings[randomIndex];
  };

  const [randomGreeting] = useState(() => getRandomGreeting());

  // 🔥 新增：生成3个随机消息建议
  const getRandomSuggestions = () => {
    const suggestions = t.messageSuggestions;
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const [randomSuggestions] = useState(() => getRandomSuggestions());

  // 获取认证token
  const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  // 文件图标函数
  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎬';
      case 'mp3':
      case 'wav':
      case 'flac':
        return '🎵';
      case 'zip':
      case 'rar':
      case '7z':
        return '📦';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      default:
        return '📎';
    }
  };

  // 文件大小格式化函数
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 滚动到底部函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 🔥 修复：改进的消息去重函数
  const deduplicateMessages = useCallback((messages: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<number>();
    return messages.filter(message => {
      const id = typeof message.id === 'string' ? parseInt(message.id) : message.id;
      if (seen.has(id)) {
        console.log('发现重复消息，已去除:', id);
        return false;
      }
      seen.add(id);
      return true;
    });
  }, []);

  // 🔥 修复：批量设置消息的函数
  const setBatchMessages = useCallback((sessionId: string, messages: ChatMessage[]) => {
    console.log('批量设置消息:', sessionId, messages.length);
    
    // 去重和排序
    const uniqueMessages = deduplicateMessages(messages);
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    console.log('去重排序后消息数量:', sortedMessages.length);
    
    // 🔥 关键：使用特殊的批量设置回调，而不是逐条调用onMessageSent
    if (onBatchMessagesLoaded) {
      onBatchMessagesLoaded(sessionId, sortedMessages);
    } else {
      // 降级方案：如果没有批量回调，清空后逐条添加（但只调用一次每条消息）
      console.log('使用降级方案：逐条设置消息');
      sortedMessages.forEach((message, index) => {
        setTimeout(() => {
          onMessageSent?.(message);
        }, index * 10);
      });
    }
  }, [onMessageSent, onBatchMessagesLoaded, deduplicateMessages]); // 🔥 添加 onBatchMessagesLoaded 依赖

  // 🔥 修复：改进的加载聊天消息函数，增加防重复加载
  const loadChatMessages = useCallback(async (chatId: number) => {
    const sessionIdStr = chatId.toString();
    
    // 🔥 防止重复加载同一个会话
    if (loadingRef.current) {
      console.log('正在加载中，跳过重复请求');
      return;
    }
    
    if (lastLoadedSessionRef.current === sessionIdStr) {
      console.log('已加载过此会话，跳过重复加载:', sessionIdStr);
      return;
    }
    
    try {
      loadingRef.current = true;
      setInternalLoading(true);
      setLoadingMessage('正在加载聊天记录...');
      
      console.log(`开始加载聊天 ${chatId} 的消息`);
      const response = await chatAPI.getChatMessages(chatId);
      
      console.log('获取到的聊天消息:', response);
      
      if (response.messages && response.messages.length > 0) {
        console.log(`从API获取了 ${response.messages.length} 条消息`);
        
        // 🔥 使用批量设置而不是逐条调用
        setBatchMessages(sessionIdStr, response.messages);
        
        // 记录已加载的会话
        lastLoadedSessionRef.current = sessionIdStr;
        
        // 滚动到底部
        setTimeout(scrollToBottom, 100);
      } else {
        console.log('会话无历史消息');
      }
    } catch (error) {
      console.error('加载聊天消息失败:', error);
      onError?.(error instanceof Error ? error.message : '加载聊天消息失败');
    } finally {
      loadingRef.current = false;
      setInternalLoading(false);
      setLoadingMessage('');
    }
  }, [setBatchMessages, onError]);

  // 🔥 修复：当currentSession变化时的加载逻辑
  useEffect(() => {
    if (currentSession && currentSession.id && !isNaN(Number(currentSession.id))) {
      const sessionIdStr = currentSession.id;
      
      // 🔥 关键改进：检查是否需要加载
      const needsLoading = !currentSession.messages || 
                          currentSession.messages.length === 0 ||
                          lastLoadedSessionRef.current !== sessionIdStr;
      
      if (needsLoading) {
        console.log('需要加载聊天消息:', sessionIdStr);
        loadChatMessages(Number(currentSession.id));
      } else {
        console.log(`会话 ${sessionIdStr} 已有 ${currentSession.messages?.length || 0} 条消息，无需重新加载`);
        // 确保滚动到底部
        setTimeout(scrollToBottom, 100);
      }
    } else {
      // 清除记录，准备加载新会话
      lastLoadedSessionRef.current = null;
    }
  }, [currentSession?.id, loadChatMessages]);

  // 🔥 修改：当currentSession变化时，更新初始设置
  useEffect(() => {
    if (currentSession) {
      // 🔥 修复：从currentSession获取真实的模型和搜索设置
      // 假设后端返回的chat对象包含 ai_model 和 search_enabled 字段
      const sessionModel = (currentSession as any).ai_model || AIModel.STAR;
      const sessionSearch = (currentSession as any).search_enabled || false;
      
      console.log('🔍 从聊天会话读取设置:');
      console.log('- 会话ID:', currentSession.id);
      console.log('- 模型设置:', sessionModel);
      console.log('- 搜索设置:', sessionSearch);
      
      setInitialModel(sessionModel);
      setInitialSearchEnabled(sessionSearch);
      setSelectedModel(sessionModel);
      setSearchEnabled(sessionSearch); // 🔥 这里会显示搜索状态指示器
    } else {
      // 新对话，使用默认设置
      setInitialModel(AIModel.STAR);
      setInitialSearchEnabled(false);
      setSelectedModel(AIModel.STAR);
      setSearchEnabled(false);
    }
  }, [currentSession]);

  // 🔥 新增：点击外部关闭加号菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔥 新增：处理点击消息建议
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // 自动聚焦到输入框
    if (textareaRef.current) {
      textareaRef.current.focus();
      // 自动调整高度
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // 🔥 新增：处理随机按钮点击
  const handleRandomClick = () => {
    const suggestions = t.messageSuggestions;
    const randomIndex = Math.floor(Math.random() * suggestions.length);
    const randomSuggestion = suggestions[randomIndex];
    setInputValue(randomSuggestion);
    // 自动聚焦到输入框
    if (textareaRef.current) {
      textareaRef.current.focus();
      // 自动调整高度
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // 取消上传函数
  const handleCancelUpload = () => {
    setUploadConfirm(null);
  };

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    // 检查是否已经有相同文件在处理中
    const isDuplicate = uploadedFiles.some(f => 
      f.name === file.name && f.size === file.size
    );
    
    if (isDuplicate) {
      onError?.('该文件已经添加，请勿重复上传');
      return;
    }
    
    // 只有在没有其他弹窗时才显示新的弹窗
    if (!uploadConfirm) {
      setUploadConfirm(file);
    }
  };

  // 点击文件上传按钮
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // 🔥 修改：处理加号菜单点击
  const handlePlusMenuClick = () => {
    setShowPlusMenu(!showPlusMenu);
  };

  // 🔥 新增：处理深度搜索菜单点击
  const handleSearchMenuClick = () => {
    handleSearchToggle(!searchEnabled);
    setShowPlusMenu(false);
  };

  // 文件输入改变
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // 处理多个文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        handleFileSelect(file);
      }
    }
    // 清空文件输入，以便可以重复选择同一个文件
    e.target.value = '';
  };

  // 拖拽处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // 🔥 关键修改：文件上传处理 - 保存token而不只是ID
  const handleFileUpload = async (file: File): Promise<{ id: string; token: string } | null> => {
    try {
      console.log('开始上传临时文件:', file.name);
      
      const fileId = Date.now().toString();
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      setFileStatuses(prev => ({ ...prev, [fileId]: 'uploading' }));
      
      const response = await uploadTemporaryFile(
        file,
        'chat_upload',
        1, // 1小时过期
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }
      );
      
      console.log('临时文件上传成功:', response);
      
      // 清除进度显示
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        setFileStatuses(prev => {
          const newStatuses = { ...prev };
          delete newStatuses[fileId];
          return newStatuses;
        });
      }, 500);
      
      // 🔥 关键：返回ID和token
      return {
        id: response.file.id.toString(),
        token: response.file.token
      };
    } catch (error) {
      console.error('临时文件上传失败:', error);
      onError?.(error instanceof Error ? error.message : '文件上传失败');
      return null;
    }
  };

  // 🔥 关键修改：确认上传文件 - 添加防重复处理
  const handleConfirmUpload = async () => {
    if (uploadConfirm) {
      try {
        // 🔥 立即关闭弹窗，防止重复点击
        const fileToUpload = uploadConfirm;
        setUploadConfirm(null);
        
        // 上传临时文件
        const uploadResult = await handleFileUpload(fileToUpload);
        
        if (uploadResult) {
          const newFile: UploadedFile = {
            id: uploadResult.id,
            file: fileToUpload,
            name: fileToUpload.name,
            size: fileToUpload.size,
            type: fileToUpload.type,
            token: uploadResult.token
          };
          setUploadedFiles(prev => [...prev, newFile]);
        }
      } catch (error) {
        console.error('上传确认失败:', error);
        onError?.(error instanceof Error ? error.message : '文件上传失败');
      }
    }
  };

  // 删除已上传的文件
  const handleRemoveFile = async (fileId: string) => {
    try {
      // 从本地列表移除
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      console.log('文件已从列表中移除:', fileId);
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  };

  // 🔥 修改：发送消息时包含搜索设置
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if ((!trimmedInput && uploadedFiles.length === 0) || isLoading) return;

    if (currentSession && currentSession.id && !isNaN(Number(currentSession.id))) {
      try {
        setInternalLoading(true);
        setLoadingMessage('正在发送消息...');
        
        const fileTokens = uploadedFiles
          .map(uf => uf.token)
          .filter(token => token && typeof token === 'string' && token.trim() !== '') as string[];
        
        console.log('=== 发送消息到现有聊天调试信息 ===');
        console.log('消息内容:', trimmedInput);
        console.log('选中的AI模型:', selectedModel);
        console.log('深度搜索状态:', searchEnabled); // 🔥 添加搜索状态日志
        console.log('临时文件token列表:', fileTokens);
        
        const sendMessageData = {
          content: trimmedInput,
          ai_model: selectedModel,
          search_enabled: searchEnabled, // 🔥 添加搜索设置到请求中
          ...(fileTokens.length > 0 && {
            temporary_file_tokens: fileTokens
          })
        };

        const chatId = Number(currentSession.id);
        
        // 🔥 修复：生成唯一的消息ID，避免重复
        const messageId = Date.now() + Math.random();
        const currentTime = new Date().toISOString();
        
        const userMessage: ChatMessage = {
          id: messageId,
          chat_id: chatId,
          content: trimmedInput,
          role: 'user',
          model_name: null,
          tokens_used: null,
          cost: null,
          response_time_ms: null,
          rag_sources: null,
          created_at: currentTime,
          file_attachments: uploadedFiles.length > 0 ? uploadedFiles.map(uf => ({
            id: parseInt(uf.id),
            original_name: uf.name,
            file_type: uf.type,
            file_size: uf.size,
          })) : null,
        };
        
        // 🔥 先添加用户消息
        console.log('立即添加用户消息到UI:', userMessage);
        onMessageSent?.(userMessage);
        
        // 清空输入
        setInputValue('');
        setUploadedFiles([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        
        setLoadingMessage('AI正在思考中...');
        
        // 发送到API
        const response = await chatAPI.sendMessage(chatId, sendMessageData);
        
        // 🔥 处理AI响应
        if (response.ai_message) {
          // 确保AI消息有唯一ID
          if (!response.ai_message.id) {
            response.ai_message.id = Date.now() + Math.random() + 1;
          }
          
          console.log('添加AI响应消息:', response.ai_message);
          onMessageSent?.(response.ai_message);
        }

      } catch (error) {
        console.error('发送消息失败:', error);
        onError?.(error instanceof Error ? error.message : '发送消息失败');
      } finally {
        setInternalLoading(false);
        setLoadingMessage('');
      }
    } else {
      // 创建新聊天的逻辑保持不变
      try {
        setIsCreatingChat(true);
        setLoadingMessage('正在创建新聊天...');
        
        const fileTokens = uploadedFiles
          .map(uf => uf.token)
          .filter(token => token && typeof token === 'string' && token.trim() !== '') as string[];
        
        console.log('=== 创建新聊天调试信息 ===');
        console.log('消息内容:', trimmedInput);
        console.log('选中的AI模型:', selectedModel);
        console.log('深度搜索状态:', searchEnabled); // 🔥 添加搜索状态日志
        console.log('临时文件token列表:', fileTokens);
        
        if (fileTokens.length > 0 && onFilesUploaded) {
          console.log('通知父组件文件tokens:', fileTokens);
          onFilesUploaded(fileTokens);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log('调用onSendMessage，传递消息、AI模型和搜索设置');
        await onSendMessage(trimmedInput, undefined, selectedModel, searchEnabled); // 🔥 传递搜索设置
        
        // 清空输入
        setInputValue('');
        setUploadedFiles([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('创建新聊天失败:', error);
        onError?.(error instanceof Error ? error.message : '创建新聊天失败');
      } finally {
        setIsCreatingChat(false);
        setLoadingMessage('');
      }
    }
  };

  // 🔥 修复：消息去重和排序
  const getDisplayMessages = useCallback((): ChatMessage[] => {
    if (!currentSession?.messages) return [];
    
    // 去重和排序
    const uniqueMessages = deduplicateMessages(currentSession.messages);
    return uniqueMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [currentSession?.messages, deduplicateMessages]);

  // 当消息列表更新时滚动到底部
  useEffect(() => {
    if (currentSession?.messages && currentSession.messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [currentSession?.messages?.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // 判断是否有对话内容
  const displayMessages = getDisplayMessages();
  const hasDisplayMessages = displayMessages.length > 0; // 🔥 修复：重命名变量避免冲突

  // 合并所有加载状态
  const isAnyLoading = externalLoading || internalLoading || isCreatingChat;

  // 优化的滚动事件处理
  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (messagesRef.current) {
        const element = messagesRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        
        if (scrollHeight > clientHeight) {
          const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
          const viewportHeight = window.innerHeight;
          const indicatorHeight = Math.max(
            (clientHeight / scrollHeight) * viewportHeight,
            30
          );
          const maxTop = viewportHeight - indicatorHeight;
          const indicatorTop = Math.min(scrollPercentage * maxTop, maxTop);
          
          setScrollInfo({
            top: indicatorTop,
            height: indicatorHeight
          });
        }

        setIsScrolling(true);
        
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      }
    });
  }, []);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      
      return () => {
        messagesElement.removeEventListener('scroll', handleScroll);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [currentSession?.messages, handleScroll]);

  // 新增：uploadTemporaryFile函数定义
  const uploadTemporaryFile = async (
    file: File,
    purpose: string = 'chat_upload',
    expiry_hours: number = 1,
    onProgress?: (progress: number) => void // 修复：添加类型定义
  ): Promise<{ file: { id: number; token: string; original_name: string; file_type: string; file_size: number; mime_type: string; expires_at: string; purpose: string; created_at: string } }> => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api-icu.584743.xyz/api/v1';
    const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';
    
    if (USE_MOCK_API) {
      // 模拟返回
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          onProgress?.(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve({
              file: {
                id: Date.now(),
                token: 'mock-token-' + Date.now(),
                original_name: file.name,
                file_type: file.type.split('/').pop() || '',
                file_size: file.size,
                mime_type: file.type,
                expires_at: new Date(Date.now() + expiry_hours * 3600 * 1000).toISOString(),
                purpose,
                created_at: new Date().toISOString()
              }
            });
          }
        }, 200);
      });
    }

    const token = getAuthToken();
    const url = `${API_BASE_URL}/files/temporary`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    formData.append('expiry_hours', expiry_hours.toString());

    console.log(`开始上传临时文件: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = 60000; // 60秒超时

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          console.log(`上传进度: ${progress}%`);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        console.log(`上传完成，状态码: ${xhr.status}`);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const rawResponse = xhr.responseText;
            console.log('=== 临时文件上传原始响应 ===');
            console.log('原始响应:', rawResponse);
            
            const response = JSON.parse(rawResponse);
            console.log('解析后的完整响应:', JSON.stringify(response, null, 2));
            
            // 修复：正确提取响应数据
            const fileData = response?.data?.file || response?.file || response;
            console.log('提取的文件数据:', JSON.stringify(fileData, null, 2));
            
            // 验证token字段
            if (!fileData.token) {
              console.error('警告：响应中没有token字段！');
            }
            
            resolve({
              file: {
                id: fileData.id,
                token: fileData.token,
                original_name: fileData.original_name,
                file_type: fileData.file_type,
                file_size: fileData.file_size,
                mime_type: fileData.mime_type,
                expires_at: fileData.expires_at,
                purpose: fileData.purpose,
                created_at: fileData.created_at
              }
            });
          } catch (parseError) {
            console.error('解析响应失败:', parseError);
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error(`上传失败，状态码: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('上传请求失败');
        reject(new Error('上传请求失败'));
      });

      xhr.addEventListener('timeout', () => {
        console.error('上传请求超时');
        reject(new Error('上传请求超时'));
      });

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(formData);
    });
  };

  // 🔥 检查是否有消息的函数 - 重命名避免冲突
  const checkHasMessages = () => {
    return currentSession && currentSession.messages && currentSession.messages.length > 0;
  };

  // 🔥 处理模型切换
  const handleModelChange = (newModel: AIModel) => {
    if (!checkHasMessages() || newModel === initialModel) {
      // 没有消息或选择相同模型，直接切换
      setSelectedModel(newModel);
      return;
    }

    // 有消息且切换到不同模型，显示确认对话框
    setPendingModel(newModel);
    setShowModelConfirm(true);
  };

  // 🔥 处理搜索开关切换
  const handleSearchToggle = (enabled: boolean) => {
    if (!checkHasMessages() || enabled === initialSearchEnabled) {
      // 没有消息或设置相同，直接切换
      setSearchEnabled(enabled);
      return;
    }

    // 有消息且设置不同，显示确认对话框
    setPendingSearch(enabled);
    setShowSearchConfirm(true);
  };

  // 🔥 确认模型切换
  const confirmModelChange = () => {
    if (pendingModel && onCreateNewChat) {
      onCreateNewChat(pendingModel, searchEnabled);
    }
    setShowModelConfirm(false);
    setPendingModel(null);
  };

  // 🔥 确认搜索设置切换
  const confirmSearchChange = () => {
    if (pendingSearch !== null && onCreateNewChat) {
      onCreateNewChat(selectedModel, pendingSearch);
    }
    setShowSearchConfirm(false);
    setPendingSearch(null);
  };

  // 🔥 取消确认
  const cancelConfirm = () => {
    setShowModelConfirm(false);
    setShowSearchConfirm(false);
    setPendingModel(null);
    setPendingSearch(null);
  };

  return (
    <>
      <div 
        className={`chat-container ${dragActive ? 'chat-container--drag-active' : ''} ${isSidebarCollapsed ? 'chat-container--sidebar-collapsed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* 🔥 新增：顶部模型选择器 */}
        <div className="chat-header">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange} // 🔥 使用新的处理函数
            disabled={isAnyLoading}
            language={language}
          />
        </div>

        {/* 主聊天区域 */}
        <div className="chat-main">
          {/* 无消息时的欢迎界面 */}
          {!hasDisplayMessages && !isCreatingChat && ( // 🔥 使用重命名后的变量
            <div className="chat-welcome-center">
              <div className="chat-welcome__logo">
                <img src="/iCU_Icon.png" alt="iCU Logo" className="chat-welcome__logo-image" />
                <span className="chat-welcome__logo-text">Hi</span>
              </div>
              <div className="chat-welcome__greeting">
                <div className="chat-welcome__main-greeting">
                  {t.mainGreeting}
                </div>
                <div className="chat-welcome__random-greeting">
                  {randomGreeting}
                </div>
              </div>
            </div>
          )}

          {/* 创建聊天时的加载界面 */}
          {isCreatingChat && !hasDisplayMessages && ( // 🔥 使用重命名后的变量
            <div className="chat-welcome-center">
              <div className="chat-creating-chat">
                <div className="chat-loading-spinner chat-loading-spinner--large"></div>
                <div className="chat-creating-chat-text">
                  <div className="chat-creating-chat-primary">正在创建新聊天...</div>
                  <div className="chat-creating-chat-secondary">请稍候，正在为您准备对话环境</div>
                </div>
              </div>
            </div>
          )}

          {/* 有消息时的聊天记录区域 */}
          {hasDisplayMessages && ( // 🔥 使用重命名后的变量
            <div 
              ref={messagesRef}
              className="chat-messages"
              onScroll={handleScroll}
            >
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.role === 'user' ? 'chat-message--user' : 'chat-message--assistant'
                  }`}
                >
                  <div className="chat-message-avatar">
                    {message.role === 'user' ? (
                      <img
                        src="/Head_Portrait.png"
                        alt="用户头像"
                        className="chat-message-avatar-image"
                      />
                    ) : (
                      <img
                        src="/iCU_Icon.png"
                        alt="iCU助手"
                        className="chat-message-avatar-image"
                      />
                    )}
                  </div>
                  <div className="chat-message-content">
                    <div className="chat-message-text">{message.content}</div>
                    {/* 显示RAG来源 */}
                    {message.rag_sources && message.rag_sources.length > 0 && (
                      <div className="chat-message-sources">
                        <small>{t.sources}: {message.rag_sources.map(source => source.source_file).join(', ')}</small>
                      </div>
                    )}
                    {/* 显示文件附件 */}
                    {message.file_attachments && message.file_attachments.length > 0 && (
                      <div className="chat-message-attachments">
                        {message.file_attachments.map(attachment => (
                          <div key={attachment.id} className="chat-message-attachment">
                            <span className="chat-message-attachment-icon">
                              {getFileIcon(attachment.original_name)}
                            </span>
                            <span 
                              className="chat-message-attachment-name"
                              title={attachment.original_name}
                            >
                              {truncateFileName(attachment.original_name, 18)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="chat-message-time">
                      {new Date(message.created_at).toLocaleTimeString(language === 'zh_CN' ? 'zh-CN' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 加载状态显示 */}
              {isAnyLoading && (
                <div className="chat-message chat-message--assistant">
                  <div className="chat-message-avatar">
                    <img
                      src="/iCU_Icon.png"
                      alt="iCU助手"
                      className="chat-message-avatar-image"
                    />
                  </div>
                  <div className="chat-message-content">
                    <div className="chat-message-loading">
                      <div className="chat-loading-spinner"></div>
                      <div className="chat-loading-text">
                        {loadingMessage || 'AI正在思考中...'}
                      </div>
                    </div>
                    <div className="chat-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* 底部固定输入区域 */}
        <div className="chat-input-fixed">
          {/* 🔥 新增：深度搜索状态指示器 */}
          {searchEnabled && (
            <div className="search-status-indicator">
              <div className="search-status-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="21 21l-4.35-4.35"></path>
                  <circle cx="11" cy="11" r="3" fill="currentColor"></circle>
                </svg>
                <span>{t.deepSearch}</span>
              </div>
            </div>
          )}

          <div className="chat-input-container">
            {/* 显示已上传的文件 */}
            {uploadedFiles.length > 0 && (
              <div className="chat-uploaded-files">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="chat-uploaded-file">
                    <div className="chat-uploaded-file-icon">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="chat-uploaded-file-info">
                      <div 
                        className="chat-uploaded-file-name" 
                        title={file.name}
                      >
                        {truncateFileName(file.name, 20)}
                      </div>
                      <div className="chat-uploaded-file-size">
                        {formatFileSize(file.size)}
                        {fileStatuses[file.id] && (
                          <span className={`file-status file-status--${fileStatuses[file.id]}`}>
                            {fileStatuses[file.id]}
                          </span>
                        )}
                        {uploadProgress[file.id] !== undefined && (
                          <span className="upload-progress">
                            {uploadProgress[file.id]}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="chat-uploaded-file-actions">
                      <button 
                        className="chat-uploaded-file-remove"
                        onClick={() => handleRemoveFile(file.id)}
                        title={t.removeFile}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 文件上传进度显示 */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="chat-uploaded-files">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="chat-file-uploading">
                    <div className="chat-loading-spinner"></div>
                    <div className="chat-file-upload-progress">
                      <div className="chat-file-upload-progress-bar">
                        <div 
                          className="chat-file-upload-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="chat-loading-text">上传中... {progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`chat-input-wrapper ${isAnyLoading ? 'chat-input-wrapper--loading' : ''}`}>
              {/* 🔥 修改：加号按钮替换原来的上传按钮 */}
              <div className="plus-menu-container" ref={plusMenuRef}>
                <button
                  type="button"
                  className={`plus-menu-button ${showPlusMenu ? 'active' : ''}`}
                  onClick={handlePlusMenuClick}
                  disabled={isAnyLoading}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`plus-icon ${showPlusMenu ? 'rotated' : ''}`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>

                {/* 🔥 新增：加号菜单 */}
                {showPlusMenu && (
                  <div className="plus-menu-dropdown">
                    <div 
                      className="plus-menu-item"
                      onClick={handleAttachClick}
                    >
                      <span className="plus-menu-icon">📎</span>
                      <span className="plus-menu-text">{t.uploadFile}</span>
                    </div>
                    <div 
                      className={`plus-menu-item ${searchEnabled ? 'active' : ''}`}
                      onClick={handleSearchMenuClick}
                    >
                      <span className="plus-menu-icon">🔍</span>
                      <span className="plus-menu-text">
                        {searchEnabled ? '关闭深度搜索' : t.deepSearch}
                      </span>
                      {searchEnabled && (
                        <span className="plus-menu-status">✓</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder={isCreatingChat ? '正在创建聊天...' : t.inputPlaceholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isAnyLoading}
              />
              
              {/* 🔥 新增：随机消息按钮 */}
              <button
                type="button"
                className="chat-random-button"
                onClick={handleRandomClick}
                disabled={isAnyLoading}
                title={language === 'zh_CN' ? '随机填入一个问题' : 'Fill in a random question'}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* 骰子图标 */}
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                  <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                  <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
                  <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"></circle>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
                </svg>
              </button>
              
              <button
                type="submit"
                className={`chat-send-button ${isAnyLoading ? 'chat-send-button--loading' : ''}`}
                disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isAnyLoading}
                onClick={handleSubmit}
              >
                {!isAnyLoading && <span className="chat-send-icon">↗</span>}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                className="chat-file-input"
                onChange={handleFileInputChange}
                multiple
                accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 拖拽提示覆盖层 */}
        {dragActive && (
          <div className="chat-drag-overlay">
            <div className="chat-drag-content">
              <div className="chat-drag-icon">📁</div>
              <div className="chat-drag-text">{t.dropFileHint}</div>
            </div>
          </div>
        )}

        {/* 🔥 优化：文件上传确认弹窗 */}
        {uploadConfirm && (
          <div className="chat-upload-modal">
            <div className="chat-upload-modal-content">
              <div className="chat-upload-modal-header">
                <h3>{t.addFile}</h3>
                <button 
                  className="chat-upload-modal-close"
                  onClick={handleCancelUpload}
                >
                  ✕
                </button>
              </div>
              <div className="chat-upload-file-info">
                <div className="chat-upload-file-icon">{getFileIcon(uploadConfirm.name)}</div>
                <div className="chat-upload-file-details">
                  <div 
                    className="chat-upload-file-name"
                    title={uploadConfirm.name} // 🔥 添加完整文件名的tooltip
                  >
                    {uploadConfirm.name} {/* 🔥 弹窗中显示完整文件名 */}
                  </div>
                  <div className="chat-upload-file-size">{formatFileSize(uploadConfirm.size)}</div>
                </div>
              </div>
              <div className="chat-upload-modal-actions">
                <button 
                  className="chat-upload-cancel-button"
                  onClick={handleCancelUpload}
                >
                  {t.cancel}
                </button>
                <button 
                  className="chat-upload-confirm-button"
                  onClick={handleConfirmUpload}
                >
                  {t.addToChat}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 全屏加载覆盖层 */}
        {(isFullscreenLoading || isCreatingChat) && (
          <div className="chat-loading-overlay">
            <div className="chat-loading-spinner chat-loading-spinner--large"></div>
            <div className="chat-loading-text">
              {loadingMessage || (isCreatingChat ? '正在创建新聊天...' : '正在加载...')}
            </div>
          </div>
        )}
      </div>

      {/* 滚动指示器 */}
      {hasDisplayMessages && scrollInfo.height < window.innerHeight && createPortal( // 🔥 使用重命名后的变量
        <>
          <div className={`chat-scroll-indicator ${isScrolling ? 'chat-scroll-indicator--active' : ''}`} />
          <div 
            className={`chat-scroll-thumb ${isScrolling ? 'chat-scroll-thumb--active' : ''}`}
            style={{
              top: scrollInfo.top,
              height: scrollInfo.height,
              transform: `translateY(0px)`,
            }}
          />
        </>,
        document.body
      )}

      {/* 🔥 模型切换确认对话框 */}
      {showModelConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <h3>{t.createNewChatWithModel}</h3>
              <p>当前模型: {initialModel} → 新模型: {pendingModel}</p>
            </div>
            <div className="confirm-dialog-actions">
              <button onClick={cancelConfirm} className="cancel-btn">
                {t.cancelAction}
              </button>
              <button onClick={confirmModelChange} className="confirm-btn">
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 搜索设置确认对话框 */}
      {showSearchConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <h3>
                {pendingSearch ? t.createNewChatWithSearch : t.createNewChatWithoutSearch}
              </h3>
              <p>
                当前设置: {initialSearchEnabled ? '已开启' : '已关闭'} → 
                新设置: {pendingSearch ? '开启' : '关闭'}深度搜索
              </p>
            </div>
            <div className="confirm-dialog-actions">
              <button onClick={cancelConfirm} className="cancel-btn">
                {t.cancelAction}
              </button>
              <button onClick={confirmSearchChange} className="confirm-btn">
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
