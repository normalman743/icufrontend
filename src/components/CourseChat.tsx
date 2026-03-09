import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatMessage, AIModel } from '../types'; // 🔥 确保导入了 AIModel
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, courseAPI, folderAPI, fileAPI, semesterAPI } from '../utils/api';
import MarkdownRenderer from './MarkdownRenderer';
import './CourseChat.css';
import { createPortal } from 'react-dom';

// 🔥 更新：CourseFile 接口定义
interface CourseFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  folderId?: number;
  folderName?: string;
  folderType?: string;
}

const CourseChat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 🔥 修改：同时获取 courseId 和 courseName 参数
  const { courseId, courseName } = useParams<{ 
    courseId?: string; 
    courseName?: string; 
  }>();
  
  // 🔥 修改：AI模型选择状态 - 使用与Chat一致的模型类型
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.STAR);
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // 🔥 新增：课程信息状态
  const [courseInfo, setCourseInfo] = useState<{
    id?: number;
    name: string;
    code?: string;
    description?: string;
    semester?: {
      id: number;
      name: string;
      year?: number;
      term?: string;
    };
  } | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<CourseFile[]>([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [isRagPanelExpanded, setIsRagPanelExpanded] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [greeting, setGreeting] = useState('');
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 🔥 新增：课程文件和文件夹状态
  const [courseFolders, setCourseFolders] = useState<any[]>([]);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  
  // SSE streaming state
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 🔥 新增：完整的课程数据加载状态
  const [semesters, setSemesters] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loadingCourseData, setLoadingCourseData] = useState(false);
  
  // 🔥 添加缺失的滚动相关状态
  const [scrollInfo, setScrollInfo] = useState({ top: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  
  // 🔥 添加缺失的 refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // i18n
  const { t } = useTranslation();

  // 模型选择器 - memoized to avoid recreating every render
  const modelSelectorModels = React.useMemo(() => [
    { 
      id: AIModel.STAR, 
      name: 'Star', 
      icon: '⭐',
      description: t('courseChat.modelStar')
    },
    { 
      id: AIModel.STAR_PLUS, 
      name: 'StarPlus', 
      icon: '🌟',
      description: t('courseChat.modelStarPlus')
    },
    { 
      id: AIModel.STAR_CODE, 
      name: 'StarCode', 
      icon: '💻',
      description: t('courseChat.modelStarCode')
    }
  ], [t]);

  const handleModelChange = useCallback((modelId: AIModel) => {
    setSelectedModel(modelId);
    setShowModelSelector(false);
  }, []);

  const renderModelSelector = () => (
    <div className="course-chat-model-selector">
      <button 
        className="course-chat-model-trigger"
        onClick={() => setShowModelSelector(!showModelSelector)}
      >
        <span className="course-chat-model-icon">
          {modelSelectorModels.find(m => m.id === selectedModel)?.icon}
        </span>
        <span className="course-chat-model-name">
          {modelSelectorModels.find(m => m.id === selectedModel)?.name}
        </span>
        <span className="course-chat-model-arrow">
          {showModelSelector ? '▲' : '▼'}
        </span>
      </button>
      
      {showModelSelector && (
        <div className="course-chat-model-dropdown">
          {modelSelectorModels.map(model => (
            <button
              key={model.id}
              className={`course-chat-model-option ${
                selectedModel === model.id ? 'course-chat-model-option--active' : ''
              }`}
              onClick={() => handleModelChange(model.id)}
            >
              <span className="course-chat-model-option-icon">{model.icon}</span>
              <div className="course-chat-model-option-info">
                <span className="course-chat-model-option-name">{model.name}</span>
                <span className="course-chat-model-option-description">{model.description}</span>
              </div>
              {selectedModel === model.id && (
                <span className="course-chat-model-option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  
  // 🔥 新增：缺失的工具函数
  const handleBackToCourses = () => {
    navigate('/courses');
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${t('courseChat.bytes')}`;
    const k = 1024;
    const sizes = [t('courseChat.bytes'), t('courseChat.kb'), t('courseChat.mb'), t('courseChat.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件图标
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'xls':
      case 'xlsx':
        return '📈';
      default:
        return '📄';
    }
  };

  // 🔥 新增：新建聊天功能 - 添加在工具函数之后
  const handleCreateNewChat = async () => {
    try {
      
      // 清空当前状态
      setMessages([]);
      setCurrentChatId(null);
      setInputValue('');
      
      // 显示欢迎消息
      const welcomeMessage: ChatMessage = {
        id: -(Date.now() % 1000000000),
        chat_id: 0,
        content: t('courseChat.newChatWelcome', { courseName: courseInfo?.name || (i18n.language === 'zh_CN' ? '课程' : 'Course') }),
        role: 'assistant',
        model_name: null,
        tokens_used: null,
        cost: null,
        response_time_ms: null,
        rag_sources: null,
        created_at: new Date().toISOString(),
        file_attachments: null,
      };
      
      setMessages([welcomeMessage]);
      
      
    } catch (error) {
      console.error('创建新聊天失败:', error);
      const errorText = t('courseChat.createNewChatFailed');
      alert(errorText);
    }
  };

  // 切换 RAG 面板展开/收起
  const toggleRagPanel = () => {
    setIsRagPanelExpanded(!isRagPanelExpanded);
    if (!isRagPanelExpanded) {
      setShowFileSelector(true); // 展开时显示文件选择器
    } else {
      setShowFileSelector(false); // 收起时隐藏文件选择器
    }
  };
  
  // 🔥 修复：从课程ID获取课程信息
  const loadCourseInfo = async () => {
    try {
      
      if (courseId) {
        // 通过课程ID获取课程信息
        const apiResponse = await courseAPI.getCourse(parseInt(courseId));
        
        // 🔥 修复：处理可能的嵌套结构，使用 any 类型避免 TypeScript 错误
        const rawResponse = apiResponse as any;
        const course = rawResponse.course || rawResponse;
        
        // 🔥 新增：详细分析课程对象结构
        
        // 🔥 新增：查找所有可能包含名称的字段
        const possibleNameFields = [
          'name', 'course_name', 'title', 'code', 'display_name', 'courseName',
          'subject', 'subject_name', 'course_title', 'full_name'
        ];
        
        possibleNameFields.forEach(field => {
          if (course[field] !== undefined && course[field] !== null && course[field] !== '') {
          } else {
          }
        });
        
        // 🔥 修复：更智能的课程名称选择逻辑
        const courseIdNumber = course.id || parseInt(courseId);
        
        // 优先选择有意义的名称字段，避免选择代码或ID
        let courseName = '';
        
        // 第一优先级：明确的名称字段
        if (course.name && course.name !== '' && course.name !== courseIdNumber.toString()) {
          courseName = course.name;
        } 
        // 第二优先级：course_name
        else if (course.course_name && course.course_name !== '' && course.course_name !== courseIdNumber.toString()) {
          courseName = course.course_name;
        }
        // 第三优先级：title
        else if (course.title && course.title !== '' && course.title !== courseIdNumber.toString()) {
          courseName = course.title;
        }
        // 第四优先级：subject 或 subject_name
        else if (course.subject && course.subject !== '' && course.subject !== courseIdNumber.toString()) {
          courseName = course.subject;
        }
        else if (course.subject_name && course.subject_name !== '' && course.subject_name !== courseIdNumber.toString()) {
          courseName = course.subject_name;
        }
        // 最后选择：代码字段（如果不是纯数字）
        else if (course.code && course.code !== '' && isNaN(Number(course.code))) {
          courseName = course.code;
        }
        // 默认值
        else {
          courseName = `课程 ${courseIdNumber}`;
        }
      
        
        setCourseInfo({
          id: courseIdNumber, // 🔥 确保ID是数字
          name: courseName,
          code: course.code,
          description: course.description
        });
        
      } else if (courseName) {
        // 通过课程名称（解码）
        const decodedName = decodeURIComponent(courseName);
        setCourseInfo({
          name: decodedName
        });
        
      } else {
        console.error('没有提供课程ID或课程名称');
        setCourseInfo(null);
      }
    } catch (error) {
      console.error('加载课程信息失败:', error);
      // 🔥 改进错误处理：即使API失败也要设置基本信息
      if (courseId) {
        // 如果有courseId，设置一个默认名称，但确保ID是有效的
        const courseIdNumber = parseInt(courseId);
        if (!isNaN(courseIdNumber)) {
          setCourseInfo({
            id: courseIdNumber,
            name: `课程 ${courseId}`
          });
        } else {
          console.error('无效的课程ID:', courseId);
          setCourseInfo(null);
        }
      } else if (courseName) {
        setCourseInfo({
          name: decodeURIComponent(courseName)
        });
      } else {
        setCourseInfo(null);
      }
    }
  };

  // 🔥 修改：在组件挂载时加载课程信息
  useEffect(() => {
    if (courseId || courseName) {
      loadCourseInfo();
    }
  }, [courseId, courseName]);

  // 🔥 修改：获取当前课程名称
  const getCurrentCourseName = () => {
    return courseInfo?.name || '未知课程';
  };

  // 🔥 添加：输入框占位符函数
  const getInputPlaceholder = () => {
    const currentCourseName = getCurrentCourseName();
    return t('courseChat.inputPlaceholder', { courseName: currentCourseName });
  };

  // 🔥 修改：从真实API获取课程文件数据
  const loadCourseFiles = async () => {
    if (!courseInfo?.id) {
      return [];
    }

    setLoadingResources(true);
    try {

      // 1. 获取课程文件夹
      const foldersResponse = await folderAPI.getCourseFolders(courseInfo.id);
      setCourseFolders(foldersResponse.folders);

      // 2. 获取所有文件（用于备选）
      try {
        const filesResponse = await fileAPI.getFiles();
        
        // 过滤出属于当前课程的文件
        const courseFiles = filesResponse.files.filter(file => 
          file.course_id === courseInfo.id
        );
        setAllFiles(courseFiles);
      } catch (error) {
        console.warn('获取文件列表失败:', error);
        setAllFiles([]);
      }

      // 3. 构建文件列表用于界面显示
      const files: CourseFile[] = [];

      // 从文件夹中加载文件
      for (const folder of foldersResponse.folders) {
        try {
          const folderFilesResponse = await folderAPI.getFolderFiles(folder.id);
          
          folderFilesResponse.files.forEach(file => {
            files.push({
              id: file.id.toString(),
              name: file.original_name,
              size: file.file_size,
              type: file.file_type || file.original_name.split('.').pop() || 'unknown',
              uploadDate: new Date(file.created_at),
              folderId: folder.id,
              folderName: folder.name,
              folderType: folder.folder_type
            });
          });
        } catch (error) {
          console.warn(`获取文件夹 ${folder.name} 文件失败:`, error);
        }
      }


      return files;
    } catch (error) {
      console.error('加载课程资源失败:', error);
      return [];
    } finally {
      setLoadingResources(false);
    }
  };

  // 🔥 修复：创建课程聊天函数 - 确保有有效的课程ID
  const createCourseChat = async (firstMessage: string): Promise<number> => {
    try {

      // 🔥 验证课程ID
      if (!courseInfo?.id || courseInfo.id <= 0) {
        throw new Error(`无效的课程ID: ${courseInfo?.id}。课程聊天需要有效的课程ID。`);
      }

      // 🔥 确保有file_ids和folder_ids
      const fileIds = selectedFiles
        .map(file => parseInt(file.id))
        .filter(id => !isNaN(id));
      
      const folderIds = courseFolders
        .map(folder => folder.id)
        .filter(id => id && id > 0);

      // 如果没有选中文件，至少选择一个课程文件
      if (fileIds.length === 0 && allFiles.length > 0) {
        const firstFileId = allFiles[0].id;
        if (firstFileId && firstFileId > 0) {
          fileIds.push(firstFileId);
        }
      }

      // 如果没有文件夹，至少选择一个课程文件夹
      if (folderIds.length === 0 && courseFolders.length > 0) {
        const firstFolderId = courseFolders[0].id;
        if (firstFolderId && firstFolderId > 0) {
          folderIds.push(firstFolderId);
        }
      }


      // 🔥 验证必需的参数
      if (folderIds.length === 0) {
        console.warn('警告：没有可用的文件夹ID，这可能导致创建失败');
      }

      const createChatData = {
        chat_type: 'course' as const,
        first_message: firstMessage.trim(),
        course_id: courseInfo.id,
        custom_prompt: `你是《${courseInfo.name}》课程的AI助手，请基于课程内容回答用户问题。`,
        ai_model: selectedModel, // 🔥 使用选择的模型：AIModel.STAR | AIModel.STAR_PLUS | AIModel.STAR_CODE
        search_enabled: true,
        context_mode: 'Standard',
        file_ids: fileIds,
        folder_ids: folderIds,
        temporary_file_tokens: [],
        stream: false
      };


      const response = await chatAPI.createChat(createChatData);
      
      if (response.chat) {
        setCurrentChatId(response.chat.id);
        
        // 如果有AI回复，添加到消息列表
        if (response.ai_message) {
          const userMessage: ChatMessage = {
            id: -(Date.now() % 1000000000),
            chat_id: response.chat.id,
            content: firstMessage,
            role: 'user',
            model_name: null,
            tokens_used: null,
            cost: null,
            response_time_ms: null,
            rag_sources: null,
            created_at: new Date(Date.now() - 1000).toISOString(),
            file_attachments: null,
          };
          
          setMessages([userMessage, response.ai_message]);
        }
        
        return response.chat.id;
      } else {
        throw new Error('创建课程聊天失败：没有返回聊天数据');
      }
    } catch (error) {
      console.error('创建课程聊天失败:', error);
      
      // 🔥 改进错误处理
      if (error instanceof Error) {
        if (error.message.includes('Course ID is required')) {
          throw new Error(`课程聊天需要有效的课程ID。当前课程ID: ${courseInfo?.id}`);
        } else if (error.message.includes('file_ids') || error.message.includes('folder_ids')) {
          throw new Error('创建课程聊天失败：需要至少一个文件或文件夹。请先在课程页面上传文件。');
        }
      }
      
      throw error;
    }
  };

  // 🔥 新增：获取文件预览
  const handleFilePreview = async (fileId: string) => {
    try {
      const preview = await fileAPI.getFilePreview(parseInt(fileId));
      // 可以在这里显示预览内容
    } catch (error) {
      console.error('获取文件预览失败:', error);
    }
  };

  // 🔥 新增：下载文件
  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await fileAPI.downloadFile(parseInt(fileId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件失败:', error);
      alert('下载文件失败');
    }
  };

  // 修改原有的切换文件选择器函数
  const toggleFileSelector = () => {
    if (selectedFiles.length > 0) {
      // 如果已有选择的文件，切换 RAG 面板
      toggleRagPanel();
    } else {
      // 如果没有选择文件，直接显示文件选择器
      setShowFileSelector(!showFileSelector);
      setIsRagPanelExpanded(!showFileSelector);
    }
  };

  // 关闭文件选择器
  const closeFileSelector = () => {
    setShowFileSelector(false);
    setIsRagPanelExpanded(false);
  };

  // 选择/取消选择文件
  const toggleFileSelection = (file: CourseFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  // 清空选择的文件
  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  // 新增：加载聊天消息
  const loadChatMessages = async (chatId: number) => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChatMessages(chatId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('加载聊天消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 修改：发送消息处理 - 包含文件和文件夹信息
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // 添加用户消息到本地状态
    const userMessage: ChatMessage = {
      id: -(Date.now() % 1000000000),
      chat_id: currentChatId || 0,
      content: content,
      role: 'user',
      model_name: null,
      tokens_used: null,
      cost: null,
      response_time_ms: null,
      rag_sources: null,
      created_at: new Date().toISOString(),
      file_attachments: null,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let chatId = currentChatId;
      
      // 如果没有当前聊天ID，创建新的课程聊天
      if (!chatId) {
        chatId = await createCourseChat(content);
      } else {
        // 🔥 修改：检查是否选择了文件
        if (selectedFiles.length === 0) {
          throw new Error('请至少选择一个文件');
        }

        // 发送消息到现有聊天 - SSE streaming
        const sendMessageData = {
          content: content,
          ai_model: selectedModel,
          search_enabled: true,
          ...(selectedFiles.length > 0 && {
            file_ids: selectedFiles.map(f => parseInt(f.id)).filter(id => !isNaN(id)),
            folder_ids: courseFolders.map(folder => folder.id).filter(id => id)
          })
        };

        setIsStreaming(true);
        setStreamingContent('');
        let finalAiMessage: ChatMessage | null = null;
        
        await chatAPI.sendMessageStream(
          chatId,
          sendMessageData,
          (event: any) => {
            switch (event.type) {
              case 'content':
                setStreamingContent(prev => prev + (event.content || ''));
                break;
              case 'completion':
                if (event.ai_message) {
                  finalAiMessage = event.ai_message;
                }
                break;
              case 'error':
                throw new Error(event.error || '流式响应出错');
            }
          },
          (error: Error) => {
            throw error;
          }
        );
        
        // Stream finished - add final AI message and clear streaming state
        setIsStreaming(false);
        setStreamingContent('');
        
        if (finalAiMessage) {
          setMessages(prev => [...prev, finalAiMessage!]);
        }
      }
    } catch (error) {
      console.error(t('courseChat.sendMessageFailed'), error);
      
      // 🔥 修改：针对不同错误显示不同信息
      let errorText = t('courseChat.sendMessageFailed');
      if (error instanceof Error) {
        if (error.message.includes('请至少选择一个文件') || 
            error.message.includes('Please select at least one file')) {
          errorText = i18n.language === 'zh_CN' ? '请至少选择一个文件' : 'Please select at least one file';
        } else if (error.message.includes('网络请求失败')) {
          errorText = i18n.language === 'zh_CN' ? '请至少选择一个文件' : 'Please select at least one file';
        } else {
          errorText = `${t('courseChat.sendMessageFailed')}: ${error.message}`;
        }
      }
      
      // 发送失败时，显示错误消息
      const errorMessage: ChatMessage = {
        id: -(Date.now() % 1000000000 + 1),
        chat_id: currentChatId || 0,
        content: errorText,
        role: 'assistant',
        model_name: null,
        tokens_used: null,
        cost: null,
        response_time_ms: null,
        rag_sources: null,
        created_at: new Date().toISOString(),
        file_attachments: null,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // 🔥 修改：当课程信息加载完成后，加载课程文件和初始化聊天
  useEffect(() => {
    const initializeCourseData = async () => {
      if (!courseInfo || !courseInfo.id) {
        return;
      }
      
      
      // 1. 加载课程文件
      const files = await loadCourseFiles();
      setCourseFiles(files);
      
      // 2. 尝试加载现有的课程聊天
      try {
        const response = await chatAPI.getChats();
        
        // 通过课程ID查找现有聊天
        const courseChat = response.chats.find(chat => {
          if (chat.chat_type === 'course') {
            // 优先通过课程ID匹配
            if (courseInfo.id && chat.course_id === courseInfo.id) {
              return true;
            }
            // 其次通过标题包含课程名称匹配
            if (chat.title?.includes(courseInfo.name)) {
              return true;
            }
          }
          return false;
        });

        if (courseChat) {
          setCurrentChatId(courseChat.id);
          await loadChatMessages(courseChat.id);
        } else {
        }
      } catch (error) {
      }
    };

    initializeCourseData();
  }, [courseInfo]); // 🔥 确保依赖数组正确

  // 🔥 修改：定义问候语 - 根据语言动态生成
  const getRandomGreeting = () => {
    const currentCourseName = getCurrentCourseName();
    const greetings = t('courseChat.welcomeGreetings', { returnObjects: true, courseName: currentCourseName }) as string[];
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  };

  // 🔥 修改：当课程信息改变时更新问候语
  useEffect(() => {
    if (courseInfo) {
      setGreeting(getRandomGreeting());
    }
  }, [courseInfo, t]);

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
  const hasMessages = messages.length > 0;

  // 如果需要的话，可以通过 localStorage 或 sessionStorage 来同步状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sidebar-collapsed') {
        setIsSidebarCollapsed(e.newValue === 'true');
      }
    };

    // 读取初始状态
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsSidebarCollapsed(saved === 'true');
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 添加优化的滚动事件处理
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
            30 // 最小高度30px，确保指示器可见
          );
          const maxTop = viewportHeight - indicatorHeight;
          const indicatorTop = Math.min(scrollPercentage * maxTop, maxTop);
          
          setScrollInfo({
            top: indicatorTop,
            height: indicatorHeight
          });
        }

        // 设置滚动状态
        setIsScrolling(true);
        
        // 清除之前的定时器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // 500ms后取消滚动状态
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      }
    });
  }, []);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      // 使用 passive: true 提高性能
      messagesElement.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // 初始化
      
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
  }, [messages, handleScroll]);

  // 🔥 修改：验证课程信息而不是课程名称 - 增加加载状态
  if (!courseInfo) {
    // 如果正在加载课程信息，显示加载状态
    if ((courseId || courseName) || loadingCourseData) {
      return (
        <div className={`course-chat-container ${isSidebarCollapsed ? 'course-chat-container--sidebar-collapsed' : ''}`}>
          <div className="course-chat-welcome-center">
            <div className="course-chat-welcome-logo">
              <div className="course-chat-welcome-logo-image">🎓</div>
              <span className="course-chat-welcome-logo-text">
                {loadingCourseData ? '正在获取课程信息...' : '加载中...'}
              </span>
            </div>
            {loadingCourseData && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
                正在从学期和课程列表中查找课程...
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className={`course-chat-container ${isSidebarCollapsed ? 'course-chat-container--sidebar-collapsed' : ''}`}>
        <div className="course-chat-welcome-center">
          <div className="course-chat-welcome-logo">
            <div className="course-chat-welcome-logo-image">❌</div>
            <span className="course-chat-welcome-logo-text">{t('courseChat.invalidCourseName')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`course-chat-container ${isSidebarCollapsed ? 'course-chat-container--sidebar-collapsed' : ''}`}>
        {/* 顶部导航栏 */}
        <div className="course-chat-header">
          <button 
            className="course-chat-back-btn"
            onClick={handleBackToCourses}
          >
            {t('courseChat.backToCourses')}
          </button>
          {/* 🔥 更新：顶部导航栏显示更多信息 */}
          <div className="course-chat-header-center">
            <h2 className="course-chat-title">
              《{courseInfo.name}》
              {courseInfo.code && (
                <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
                  ({courseInfo.code})
                </span>
              )}
            </h2>
            {courseInfo.semester && (
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {courseInfo.semester.name}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div 
                className={`course-chat-rag-badge ${isRagPanelExpanded ? 'course-chat-rag-badge--expanded' : ''}`}
                onClick={toggleRagPanel}
                title={isRagPanelExpanded ? t('courseChat.collapseRagPanel') : t('courseChat.expandRagPanel')}
              >
                <span className="course-chat-rag-icon">🔍</span>
                <span className="course-chat-rag-text">{t('courseChat.ragPanel')}</span>
                <span className="course-chat-rag-count">{selectedFiles.length}</span>
                <span className="course-chat-rag-toggle">
                  {isRagPanelExpanded ? '▲' : '▼'}
                </span>
              </div>
            )}
          </div>
          {/* 模型选择器 */}
          {renderModelSelector()}
        </div>

        {/* 文件选择器 - 添加展开/收起动画 */}
        {showFileSelector && (
          <div className={`course-chat-file-selector ${isRagPanelExpanded ? 'course-chat-file-selector--expanded' : 'course-chat-file-selector--collapsed'}`}>
            <div className="course-chat-file-selector-header">
              <h3>{t('courseChat.selectCourseFiles')}</h3>
              <div className="course-chat-file-selector-actions">
                {selectedFiles.length > 0 && (
                  <button 
                    className="course-chat-clear-selection"
                    onClick={clearSelectedFiles}
                  >
                    {t('courseChat.clearSelection')}
                  </button>
                )}
                <button 
                  className="course-chat-close-selector"
                  onClick={closeFileSelector}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="course-chat-file-list">
              {loadingResources ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  加载课程文件中...
                </div>
              ) : courseFiles.length > 0 ? (
                courseFiles.map(file => (
                  <div 
                    key={file.id}
                    className={`course-chat-file-item ${
                      selectedFiles.some(f => f.id === file.id) ? 'course-chat-file-item--selected' : ''
                    }`}
                    onClick={() => toggleFileSelection(file)}
                  >
                    <div className="course-chat-file-icon">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="course-chat-file-info">
                      <div className="course-chat-file-name" title={file.name}>
                        {file.name}
                      </div>
                      <div className="course-chat-file-meta">
                        {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString(i18n.language === 'zh_CN' ? 'zh-CN' : 'en-US')}
                        {file.folderName && (
                          <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                            📁 {file.folderName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="course-chat-file-actions">
                      {/* 🔥 删除：移除眼睛预览按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDownload(file.id, file.name);
                        }}
                        className="course-chat-file-download"
                        title="下载文件"
                      >
                        ⬇
                      </button>
                    </div>
                    <div className="course-chat-file-checkbox">
                      {selectedFiles.some(f => f.id === file.id) ? '✓' : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  {t('courseChat.noFiles')}
                  <br />
                  <small>{t('courseChat.uploadFilesFirst')}</small>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 主聊天区域 - 添加 ref */}
        <div className={`course-chat-main ${showFileSelector && isRagPanelExpanded ? 'course-chat-main--with-rag-panel' : ''}`}>
          {/* 无消息时的欢迎界面 */}
          {!hasMessages && (
            <div className="course-chat-welcome-center">
              <div className="course-chat-welcome-logo">
                <div className="course-chat-welcome-logo-image">🎓</div>
                <span className="course-chat-welcome-logo-text">{t('courseChat.courseAIAssistant')}</span>
              </div>
              <div className="course-chat-welcome-greeting">
                {greeting}
              </div>
              <button 
                className="course-chat-rag-enable-btn"
                onClick={toggleFileSelector}
              >
                {t('courseChat.enableRagSearch')}
              </button>
            </div>
          )}

          {/* 有消息时的聊天记录区域 - 添加 ref 和 onScroll */}
          {hasMessages && (
            <div 
              ref={messagesRef}
              className="course-chat-messages"
              onScroll={handleScroll}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`course-chat-message ${
                    message.role === 'user' ? 'course-chat-message--user' : 'course-chat-message--assistant'
                  }`}
                >
                  <div className="course-chat-message-avatar">
                    {message.role === 'user' ? (
                      <img
                        src="/Head_Portrait.png"
                        alt={t('courseChat.userAlt')}
                        className="course-chat-message-avatar-image"
                      />
                    ) : (
                      <img
                        src="/iCU_Icon.png"
                        alt={t('courseChat.aiAssistantAlt')}
                        className="course-chat-message-avatar-bot"
                      />
                    )}
                  </div>
                  <div className="course-chat-message-content">
                    <div className="course-chat-message-text"><MarkdownRenderer content={message.content} /></div>
                    <div className="course-chat-message-time">
                      {new Date(message.created_at).toLocaleTimeString(i18n.language === 'zh_CN' ? 'zh-CN' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {/* SSE streaming response display */}
              {isStreaming && streamingContent && (
                <div className="course-chat-message course-chat-message--assistant">
                  <div className="course-chat-message-avatar">
                    <img
                      src="/iCU_Icon.png"
                      alt={t('courseChat.aiAssistantAlt')}
                      className="course-chat-message-avatar-bot"
                    />
                  </div>
                  <div className="course-chat-message-content">
                    <div className="course-chat-message-text"><MarkdownRenderer content={streamingContent} /></div>
                  </div>
                </div>
              )}
              {/* Loading indicator (waiting for first chunk or non-stream loading) */}
              {isLoading && !streamingContent && (
                <div className="course-chat-message course-chat-message--assistant">
                  <div className="course-chat-message-avatar">
                    <img
                      src="/iCU_Icon.png"
                      alt={t('courseChat.aiAssistantAlt')}
                      className="course-chat-message-avatar-bot"
                    />
                  </div>
                  <div className="course-chat-message-content">
                    <div className="course-chat-message-loading">
                      <div className="course-chat-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* 底部固定输入区域 */}
        <div className="course-chat-input-fixed">
          <div className="course-chat-input-container">
            <div className="course-chat-input-wrapper">
              <div className="course-chat-input-row">
                <button
                  type="button"
                  className={`course-chat-file-toggle-btn ${selectedFiles.length > 0 ? 'course-chat-file-toggle-btn--active' : ''}`}
                  onClick={toggleFileSelector}
                  title={selectedFiles.length > 0 ? t('courseChat.manageRagFiles') : t('courseChat.selectFilesForRag')}
                >
                  {selectedFiles.length > 0 ? '🔍' : '📁'}
                </button>
                <textarea
                  ref={textareaRef}
                  className="course-chat-input"
                  placeholder={getInputPlaceholder()}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isLoading}
                />
                {/* 🔥 新建聊天按钮 */}
                <button
                  type="button"
                  className="course-chat-new-chat-btn"
                  onClick={handleCreateNewChat}
                  title={t('courseChat.newChat')}
                  disabled={isLoading}
                >
                  <span className="course-chat-new-chat-icon">+</span>
                </button>
                <button
                  className="course-chat-send-button"
                  onClick={(e) => handleSubmit(e)}
                  disabled={!inputValue.trim() || isLoading}
                  title={t('courseChat.sendMessage')}
                >
                  <span className="course-chat-send-icon">↗</span>
                </button>
              </div>
            </div>
            <div className="course-chat-input-hint">
              {selectedFiles.length > 0 ? (
                <span className="course-chat-rag-active">
                  🔍 {t('courseChat.ragEnabled')} • {t('courseChat.selectedFiles')} {selectedFiles.length} {t('courseChat.filesCount')} • {t('courseChat.clickRagBadge')}
                </span>
              ) : (
                t('courseChat.selectFilesHint')
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加滚动指示器 - 使用 Portal 渲染到 body */}
      {hasMessages && scrollInfo.height < window.innerHeight && createPortal(
        <>
          <div className={`course-chat-scroll-indicator ${isScrolling ? 'course-chat-scroll-indicator--active' : ''}`} />
          <div 
            className={`course-chat-scroll-thumb ${isScrolling ? 'course-chat-scroll-thumb--active' : ''}`}
            style={{
              top: scrollInfo.top,
              height: scrollInfo.height,
              transform: `translateY(0px)`, // 确保没有额外的transform影响
            }}
          />
        </>,
        document.body
      )}
    </>
  );
};

export default CourseChat;