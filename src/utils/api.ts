import { 
  ApiResponse, 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  Semester,
  Course,
  Folder,
  ApiFile,
  GlobalFile,
  Chat,
  ChatMessage,
  InviteCode,
  SSEMessage,
  CreateChatRequest,
  CreateChatResponse,
  SendMessageRequest,
  SendMessageResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  UpdateUserRequest,
  FileUploadResponse,
  GlobalFileUploadResponse,
  FolderFilesResponse,
  CourseFoldersResponse,
  CourseListResponse,
  SemesterListResponse,
  ChatListResponse,
  ChatMessagesResponse,
  UserListResponse,
  InviteCodeListResponse,
  FileListResponse,
  GlobalFileListResponse
} from '../types';
import { mockAPI } from './mockAPI';

// 模拟数据导入（用于模拟API模式）
const mockFiles = [
  {
    id: 1,
    original_name: 'lecture1.pdf',
    file_type: 'pdf',
    file_size: 1024000,
    file_path: '/files/lecture1.pdf',
    course_id: 1,
    folder_id: null,
    uploaded_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_processed: true,
    processing_status: 'completed',
    metadata: {}
  }
];

const mockGlobalFiles = [
  {
    id: 1,
    original_name: 'test.txt',
    file_type: 'txt',
    file_size: 1024,
    file_path: '/global/test.txt',
    category: 'document',
    description: '测试文件',
    uploaded_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_processed: true,
    processing_status: 'completed',
    metadata: {}
  }
];

const mockInviteCodes = [
  {
    id: 1,
    code: 'INVITE123',
    created_by: 1,
    used_by: null as number | null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    used_at: null as string | null
  }
];

// 配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api-icu.584743.xyz/api/v1';
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';

// 默认用户配置
const default_users = {
  "admin": {
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin123456",
    "role": "admin"
  },
  "user": {
    "username": "user",
    "email": "user@test.com", 
    "password": "user123456",
    "role": "user"
  }
};

console.log('=== API配置信息 (硬编码测试) ===');
console.log('原始 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
console.log('原始 REACT_APP_USE_MOCK_API:', process.env.REACT_APP_USE_MOCK_API);
console.log('原始 REACT_APP_USE_MOCK_API 类型:', typeof process.env.REACT_APP_USE_MOCK_API);
console.log('USE_MOCK_API (硬编码):', USE_MOCK_API);
console.log('API_BASE_URL (硬编码):', API_BASE_URL);
console.log('默认用户配置:', default_users);

// 获取认证token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 设置认证token
const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// 移除认证token
const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// 自定义错误类型
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 改进的 API 请求函数 - 统一响应处理
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {},
  timeout: number = 30000
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || getStatusMessage(response.status);
      const errorCode = data?.error?.code || data?.code;
      const errorDetails = data?.error?.details || data?.details;
      
      throw new APIError(errorMessage, response.status, errorCode, errorDetails);
    }
    
    // 统一返回处理：如果有 data 字段则返回 data，否则返回整个响应
    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // 修复类型错误
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('请求超时', 408, 'TIMEOUT');
    }
    
    throw new APIError('网络请求失败', 0, 'NETWORK_ERROR', error);
  }
};

// 错误状态码消息映射
const getStatusMessage = (status: number): string => {
  const statusMessages: { [key: number]: string } = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '禁止访问',
    404: '资源不存在',
    405: '请求方法不被允许',
    409: '资源冲突',
    422: '请求数据验证失败',
    429: '请求过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  };
  return statusMessages[status] || `HTTP ${status} 错误`;
};

// 带重试机制的 API 请求
const apiRequestWithRetry = async <T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> => {
  let lastError: APIError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(endpoint, options);
    } catch (error) {
      lastError = error instanceof APIError ? error : new APIError('未知错误', 0);
      
      // 不重试的错误状态码
      if (lastError.status >= 400 && lastError.status < 500) {
        throw lastError;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError!;
};

// 认证API - 统一响应处理
export const authAPI = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('=== API层登录调试信息 ===');
    console.log('USE_MOCK_API:', USE_MOCK_API);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('完整请求URL:', `${API_BASE_URL}/auth/login`);
    console.log('用户名:', `"${data.username}"`);
    console.log('密码:', `"${data.password}"`);
    console.log('密码长度:', data.password.length);
    console.log('密码字符码:', Array.from(data.password).map(c => c.charCodeAt(0)));
    console.log('发送的完整JSON:', JSON.stringify(data, null, 2));
    
    if (USE_MOCK_API) {
      console.log('使用模拟API');
      return mockAPI.login(data);
    }
    
    console.log('使用真实API，准备发送请求...');
    
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('登录响应成功:', response);
      
      if (response.access_token) {
        setAuthToken(response.access_token);
        console.log('Token已保存到localStorage');
      }
      
      return response;
    } catch (error) {
      console.error('登录API错误详情:', error);
      if (error instanceof APIError) {
        console.error('错误状态码:', error.status);
        console.error('错误代码:', error.code);
        console.error('错误详情:', error.details);
      }
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('=== API层注册调试信息 ===');
    console.log('注册用户名:', `"${data.username}"`);
    console.log('注册密码:', `"${data.password}"`);
    console.log('注册密码长度:', data.password.length);
    console.log('注册密码字符码:', Array.from(data.password).map(c => c.charCodeAt(0)));
    console.log('发送的JSON:', JSON.stringify(data));
    
    if (USE_MOCK_API) {
      return mockAPI.register(data);
    }
    
    try {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('注册响应成功:', response);
      return response;
    } catch (error) {
      console.error('注册API错误:', error);
      throw error;
    }
  },
  
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      return mockAPI.getCurrentUser();
    }
    
    return apiRequest<User>('/auth/me');
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    if (USE_MOCK_API) {
      return mockAPI.updateUser(data);
    }
    
    return apiRequest<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      return mockAPI.logout();
    }
    
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },
};

// 聊天API - 统一响应处理
export const chatAPI = {
  async getChats(): Promise<ChatListResponse> {
    if (USE_MOCK_API) {
      return mockAPI.getChats();
    }
    
    return apiRequest<ChatListResponse>('/chats');
  },

  async getChat(chatId: number): Promise<Chat> {
    if (USE_MOCK_API) {
      const chats = await mockAPI.getChats();
      const chat = chats.chats.find(c => c.id === chatId);
      if (!chat) throw new APIError('聊天不存在', 404, 'CHAT_NOT_FOUND');
      return chat;
    }
    
    return apiRequest<Chat>(`/chats/${chatId}`);
  },

  async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
    if (USE_MOCK_API) {
      return mockAPI.createChat(data);
    }
    
    console.log('=== 创建聊天API调试 ===');
    console.log('创建聊天数据:', JSON.stringify(data, null, 2));
    console.log('API端点:', '/chats');
    
    // 🔥 验证必需参数
    if (!data.chat_type) {
      throw new APIError('chat_type 是必需的', 400, 'MISSING_CHAT_TYPE');
    }
    
    return apiRequest<CreateChatResponse>('/chats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateChat(chatId: number, data: { title?: string }): Promise<Chat> {
    return apiRequest<Chat>(`/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteChat(chatId: number): Promise<void> {
    if (USE_MOCK_API) {
      return Promise.resolve();
    }
    
    await apiRequest(`/chats/${chatId}`, { method: 'DELETE' });
  },

  async deleteBatchChats(chatIds: number[]): Promise<void> {
    await apiRequest('/chats/batch-delete', {
      method: 'DELETE',
      body: JSON.stringify({ chat_ids: chatIds }),
    });
  },

  async getChatMessages(chatId: number): Promise<ChatMessagesResponse> {
    if (USE_MOCK_API) {
      return mockAPI.getChatMessages(chatId);
    }
    
    return apiRequest<ChatMessagesResponse>(`/chats/${chatId}/messages`);
  },

  async sendMessage(chatId: number, data: SendMessageRequest): Promise<SendMessageResponse> {
    if (USE_MOCK_API) {
      return mockAPI.sendMessage(chatId, data);
    }
    
    console.log('=== 发送消息API调试 ===');
    console.log('聊天ID:', chatId);
    console.log('消息数据:', JSON.stringify(data, null, 2));
    console.log('API端点:', `/chats/${chatId}/messages`);
    
    return apiRequest<SendMessageResponse>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async searchChats(query: string): Promise<ChatListResponse> {
    return apiRequest<ChatListResponse>(`/chats/search?q=${encodeURIComponent(query)}`);
  },

  async clearChatHistory(chatId: number): Promise<void> {
    await apiRequest(`/chats/${chatId}/clear`, { method: 'POST' });
  },

  async exportChatHistory(chatId: number): Promise<Blob> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/chats/${chatId}/export`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new APIError('导出聊天记录失败', response.status);
    }
    
    return response.blob();
  },

  // 改进的流式处理
  async sendMessageStream(
    chatId: number, 
    data: SendMessageRequest,
    onMessage: (message: any) => void,
    onError?: (error: Error) => void,
    maxRetries: number = 3
  ): Promise<void> {
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        await this._sendMessageStreamInternal(chatId, data, onMessage);
        return; // 成功完成，退出重试循环
      } catch (error) {
        retryCount++;
        
        if (retryCount > maxRetries) {
          onError?.(error instanceof Error ? error : new Error('流式请求失败'));
          throw error;
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  },

  async _sendMessageStreamInternal(
    chatId: number, 
    data: SendMessageRequest,
    onMessage: (message: any) => void
  ): Promise<void> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/chats/${chatId}/messages/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `流式请求失败: ${errorText}`,
        response.status,
        'STREAM_REQUEST_FAILED'
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new APIError('无法读取响应流', 500, 'STREAM_READER_UNAVAILABLE');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 修复语法错误：完整的decode调用
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            
            try {
              const message = JSON.parse(data);
              onMessage(message);
            } catch (error) {
              console.warn('解析SSE消息失败:', error, 'Raw data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // 创建聊天并发送第一条消息（流式）
  async createChatStream(
    data: CreateChatRequest,
    onMessage: (message: any) => void
  ): Promise<CreateChatResponse> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/chats/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new APIError('创建聊天流式请求失败', response.status);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new APIError('无法读取响应流', 500);
    }

    const decoder = new TextDecoder();
    let chat: Chat | null = null;
    let aiMessage: ChatMessage | null = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return {
              chat: chat!,
              ai_message: aiMessage || undefined,
            };
          }
          
          try {
            const message = JSON.parse(data);
            onMessage(message);
            
            if (message.type === 'chat_created') {
              chat = message.data.chat;
            } else if (message.type === 'ai_end') {
              aiMessage = message.data.ai_message;
            }
          } catch (error) {
            console.error('解析SSE消息失败:', error);
          }
        }
      }
    }
    
    return {
      chat: chat!,
      ai_message: aiMessage || undefined,
    };
  },
};

// 课程API
export const courseAPI = {
  async getCourses(): Promise<CourseListResponse> {
    if (USE_MOCK_API) {
      return mockAPI.getCourses();
    }
    
    return apiRequest<CourseListResponse>('/courses');
  },

  async getCourse(courseId: number): Promise<Course> {
    if (USE_MOCK_API) {
      const courses = await mockAPI.getCourses();
      const course = courses.courses.find(c => c.id === courseId);
      if (!course) throw new Error('课程不存在');
      return course;
    }
    
    console.log('=== getCourse API调试 ===');
    console.log('请求课程ID:', courseId);
    console.log('API端点:', `/courses/${courseId}`);
    
    try {
      // 🔥 修复：使用 any 类型接收API响应，避免 TypeScript 类型错误
      const response = await apiRequest<any>(`/courses/${courseId}`);
      console.log('getCourse API原始响应:', response);
      
      // 🔥 修复：处理可能的响应格式 {course: {...}} 或直接的课程对象
      const courseData = response.course || response;
      console.log('提取的课程数据:', courseData);
      
      // 🔥 确保课程对象包含所有必需字段，并尝试多个可能的名称字段
      const course: Course = {
        id: courseData.id || courseId,
        name: courseData.name || 
              courseData.course_name || 
              courseData.title || 
              courseData.code || 
              courseData.display_name ||
              courseData.courseName ||
              `课程 ${courseId}`, // 🔥 更智能的默认名称
        code: courseData.code || '',
        description: courseData.description || '',
        semester_id: courseData.semester_id || null,
        user_id: courseData.user_id || null,
        created_at: courseData.created_at || new Date().toISOString(),
        updated_at: courseData.updated_at || new Date().toISOString(),
        ...courseData // 保留其他字段
      };
      
      console.log('🔍 课程名称处理过程:');
      console.log('- courseData.name:', courseData.name);
      console.log('- courseData.course_name:', courseData.course_name);
      console.log('- courseData.title:', courseData.title);
      console.log('- courseData.code:', courseData.code);
      console.log('- courseData.display_name:', courseData.display_name);
      console.log('- courseData.courseName:', courseData.courseName);
      console.log('- 最终 course.name:', course.name);
      console.log('处理后的完整课程对象:', course);
      
      return course;
    } catch (error) {
      console.error('getCourse API错误:', error);
      throw error;
    }
  },

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    if (USE_MOCK_API) {
      return mockAPI.createCourse(data);
    }
    
    try {
      console.log('=== 创建课程 API 调试 ===');
      console.log('发送数据:', JSON.stringify(data, null, 2));
      
      const response = await apiRequest<any>('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('创建课程原始响应:', response);
      
      // 处理可能的响应格式：{course: {...}} 或直接的课程对象
      const course = response.course || response;
      console.log('提取的课程对象:', course);
      
      return course;
    } catch (error) {
      console.error('创建课程 API 错误:', error);
      
      // 特别处理课程代码重复错误
      if (error instanceof APIError && error.message.includes('already exists')) {
        throw new APIError(
          `课程代码 "${data.code}" 在当前学期已存在，请使用不同的课程代码`,
          400,
          'COURSE_CODE_DUPLICATE',
          { courseCode: data.code, semesterId: data.semester_id }
        );
      }
      
      throw error;
    }
  },

  async updateCourse(courseId: number, data: UpdateCourseRequest): Promise<Course> {
    if (USE_MOCK_API) {
      return mockAPI.updateCourse(courseId, data);
    }
    
    return apiRequest<Course>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(courseId: number): Promise<void> {
    if (USE_MOCK_API) {
      return mockAPI.deleteCourse(courseId);
    }
    
    await apiRequest(`/courses/${courseId}`, { method: 'DELETE' });
  },
};

// 学期API
export const semesterAPI = {
  async getSemesters(): Promise<SemesterListResponse> {
    if (USE_MOCK_API) {
      return mockAPI.getSemesters();
    }
    
    return apiRequest<SemesterListResponse>('/semesters');
  },

  async getSemester(semesterId: number): Promise<Semester> {
    if (USE_MOCK_API) {
      const semesters = await mockAPI.getSemesters();
      const semester = semesters.semesters.find(s => s.id === semesterId);
      if (!semester) throw new Error('学期不存在');
      return semester;
    }
    
    return apiRequest<Semester>(`/semesters/${semesterId}`);
  },
};

// 修复文件夹API - 使用正确的端点
export const folderAPI = {
  getFolders: async (): Promise<{ folders: Folder[] }> => {
    if (USE_MOCK_API) {
      return { folders: [] };
    }
    
    try {
      return await apiRequest<{ folders: Folder[] }>('/folders');
    } catch (error) {
      if (error instanceof APIError && error.status === 405) {
        console.warn('文件夹 API 方法不被允许，使用降级方案');
        return { folders: [] };
      }
      throw error;
    }
  },

  getCourseFolders: async (courseId: number): Promise<CourseFoldersResponse> => {
    if (USE_MOCK_API) {
      // 返回模拟的课程文件夹结构
      return {
        folders: [
          { id: 1, name: 'Outline', folder_type: 'outline', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 2, name: 'Tutorial', folder_type: 'tutorial', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 3, name: 'Lecture', folder_type: 'lecture', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 4, name: 'Assignments', folder_type: 'assignments', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 5, name: 'Exams', folder_type: 'exams', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 6, name: 'Others', folder_type: 'others', course_id: courseId, parent_folder_id: null, created_at: '' }
        ]
      };
    }
    
    try {
      // 使用正确的API端点：GET /api/v1/courses/{course_id}/folders
      console.log(`尝试获取课程 ${courseId} 的文件夹`);
      return await apiRequest<CourseFoldersResponse>(`/courses/${courseId}/folders`);
    } catch (error) {
      console.warn('获取课程文件夹失败，使用降级方案:', error);
      
      // 检查是否是认证问题
      if (error instanceof APIError && error.status === 401) {
        console.error('认证失败，可能需要重新登录');
        // 可以选择重新跳转到登录页面
        // window.location.href = '/login';
      }
      
      // 返回默认的文件夹结构作为降级方案
      return {
        folders: [
          { id: 1, name: 'Outline', folder_type: 'outline', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 2, name: 'Tutorial', folder_type: 'tutorial', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 3, name: 'Lecture', folder_type: 'lecture', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 4, name: 'Assignments', folder_type: 'assignments', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 5, name: 'Exams', folder_type: 'exams', course_id: courseId, parent_folder_id: null, created_at: '' },
          { id: 6, name: 'Others', folder_type: 'others', course_id: courseId, parent_folder_id: null, created_at: '' }
        ]
      };
    }
  },

  // 使用正确的端点创建文件夹
  createFolder: async (data: {
    name: string;
    folder_type: string;
    course_id: number;
    parent_folder_id?: number;
  }): Promise<{ folder: Folder }> => {
    if (USE_MOCK_API) {
      const newFolder: Folder = {
        id: Date.now(),
        name: data.name,
        folder_type: data.folder_type,
        course_id: data.course_id,
        parent_folder_id: data.parent_folder_id || null,
        created_at: new Date().toISOString()
      };
      return { folder: newFolder };
    }
    
    // 根据API文档，可能需要使用课程相关的端点
    return apiRequest<{ folder: Folder }>(`/courses/${data.course_id}/folders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getFolderFiles: async (folderId: number): Promise<FolderFilesResponse> => {
    if (USE_MOCK_API) {
      return { files: [] };
    }
    
    try {
      // 使用正确的端点：GET /api/v1/folders/{folder_id}/files
      return await apiRequest<FolderFilesResponse>(`/folders/${folderId}/files`);
    } catch (error) {
      console.warn(`获取文件夹 ${folderId} 文件失败:`, error);
      
      // 检查是否是认证问题
      if (error instanceof APIError && error.status === 401) {
        console.error('认证失败，Token可能已过期');
        // 可以尝试刷新Token或跳转到登录页面
      }
      
      // 返回空文件列表作为降级方案
      return { files: [] };
    }
  },
};

// 文件API - 增加超时和重试机制
export const fileAPI = {
  uploadFile: async (
    file: globalThis.File, 
    courseId?: number, 
    folderId?: number,
    onProgress?: (progress: number) => void,
    onUploadStart?: () => void,
    onUploadComplete?: () => void
  ): Promise<FileUploadResponse> => {
    if (USE_MOCK_API) {
      return mockAPI.uploadFile(file);
    }
    
    const additionalData: Record<string, string> = {};
    if (courseId) additionalData.course_id = courseId.toString();
    if (folderId) additionalData.folder_id = folderId.toString();
    
    // 添加详细的参数日志
    console.log(`=== 文件上传API参数 ===`);
    console.log(`文件名: ${file.name}`);
    console.log(`课程ID: ${courseId}`);
    console.log(`文件夹ID: ${folderId}`);
    console.log(`附加数据:`, additionalData);
    console.log(`FormData将包含:`, {
      file: `[File: ${file.name}]`,
      ...additionalData
    });
    console.log(`========================`);
    
    return uploadFileWithProgress(
      '/files/upload', 
      file, 
      additionalData, 
      onProgress, 
      onUploadStart, 
      onUploadComplete
    );
  },

  uploadBatchFiles: async (
    files: globalThis.File[],
    courseId?: number,
    folderId?: number,
    onProgress?: (fileIndex: number, progress: number) => void,
    onFileComplete?: (fileIndex: number, result: FileUploadResponse) => void,
    onError?: (fileIndex: number, error: Error) => void
  ): Promise<FileUploadResponse[]> => {
    const results: FileUploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await fileAPI.uploadFile(
          file,
          courseId,
          folderId,
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        results.push(result);
        onFileComplete?.(i, result);
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError('上传失败', 0);
        onError?.(i, apiError);
        throw apiError;
      }
    }
    
    return results;
  },

  getFiles: async (): Promise<FileListResponse> => {
    if (USE_MOCK_API) {
      return { files: [] };
    }
    
    return apiRequest<FileListResponse>('/files');
  },

  getFile: async (fileId: number): Promise<ApiFile> => {
    if (USE_MOCK_API) {
      const files = mockFiles.filter(f => f.id === fileId);
      if (files.length === 0) throw new APIError('文件不存在', 404, 'FILE_NOT_FOUND');
      return files[0];
    }
    
    return apiRequest<ApiFile>(`/files/${fileId}`);
  },

  getFilePreview: async (fileId: number): Promise<string> => {
    return apiRequest<string>(`/files/${fileId}/preview`);
  },

  getFileStatus: async (fileId: number): Promise<{ status: string; progress?: number }> => {
    return apiRequest<{ status: string; progress?: number }>(`/files/${fileId}/status`);
  },

  downloadFile: async (fileId: number): Promise<Blob> => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/files/${fileId}/download`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new APIError('文件下载失败', response.status, 'DOWNLOAD_FAILED');
    }
    
    return response.blob();
  },

  shareFile: async (fileId: number, shareData: any): Promise<{ share_link: string }> => {
    return apiRequest<{ share_link: string }>(`/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  },

  getFileAccessLogs: async (fileId: number): Promise<any[]> => {
    return apiRequest<any[]>(`/files/${fileId}/access-logs`);
  },

  deleteFile: async (fileId: number): Promise<void> => {
    if (USE_MOCK_API) {
      const fileIndex = mockFiles.findIndex(f => f.id === fileId);
      if (fileIndex === -1) throw new APIError('文件不存在', 404, 'FILE_NOT_FOUND');
      mockFiles.splice(fileIndex, 1);
      return;
    }
    
    try {
      // 增加删除文件的超时时间并添加重试机制
      await apiRequestWithRetry(`/files/${fileId}`, { 
        method: 'DELETE' 
      }, 2, 1500); // 最多重试2次，每次间隔1.5秒
    } catch (error) {
      console.error(`删除文件 ${fileId} 失败:`, error);
      
      if (error instanceof APIError) {
        // 针对不同错误类型提供更好的错误信息
        if (error.status === 404) {
          throw new APIError('文件不存在或已被删除', 404, 'FILE_NOT_FOUND');
        } else if (error.status === 403) {
          throw new APIError('没有权限删除此文件', 403, 'PERMISSION_DENIED');
        } else if (error.status === 408 || error.code === 'TIMEOUT') {
          throw new APIError('删除文件超时，请稍后重试', 408, 'DELETE_TIMEOUT');
        }
      }
      
      throw error;
    }
  },

  deleteBatchFiles: async (fileIds: number[]): Promise<void> => {
    if (fileIds.length === 0) return;
    
    await apiRequest('/files/batch-delete', {
      method: 'DELETE',
      body: JSON.stringify({ file_ids: fileIds }),
    });
  },

  uploadGlobalFile: async (
    file: globalThis.File, 
    category: string, 
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<GlobalFileUploadResponse> => {
    if (USE_MOCK_API) {
      return mockAPI.uploadGlobalFile(file, category, description);
    }
    
    const additionalData: Record<string, string> = { category };
    if (description) additionalData.description = description;
    
    return uploadFileWithProgress('/global-files/upload', file, additionalData, onProgress);
  },

  getGlobalFiles: async (): Promise<GlobalFileListResponse> => {
    if (USE_MOCK_API) {
      return mockAPI.getGlobalFiles();
    }
    
    return apiRequest<GlobalFileListResponse>('/global-files');
  },

  deleteGlobalFile: async (fileId: number): Promise<void> => {
    if (USE_MOCK_API) {
      const fileIndex = mockGlobalFiles.findIndex(f => f.id === fileId);
      if (fileIndex === -1) throw new APIError('文件不存在', 404, 'FILE_NOT_FOUND');
      mockGlobalFiles.splice(fileIndex, 1);
      return;
    }
    
    await apiRequest(`/global-files/${fileId}`, { method: 'DELETE' });
  },

  searchFiles: async (query: string, courseId?: number): Promise<FileListResponse> => {
    const params = new URLSearchParams({ q: query });
    if (courseId) params.append('course_id', courseId.toString());
    
    return apiRequest<FileListResponse>(`/files/search?${params.toString()}`);
  },

  // 新增：上传临时文件
  uploadTemporaryFile: async (
    file: File,
    purpose: string = 'chat_upload',
    expiry_hours: number = 1,
    onProgress?: (progress: number) => void
  ): Promise<{ file: { id: number; token: string; original_name: string; file_type: string; file_size: number; mime_type: string; expires_at: string; purpose: string; created_at: string } }> => {
    if (USE_MOCK_API) {
      // 模拟返回
      return {
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
      };
    }

    const token = getAuthToken();
    const url = `${API_BASE_URL}/files/temporary`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    formData.append('expiry_hours', expiry_hours.toString());

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resp = JSON.parse(xhr.responseText);
            resolve(resp.data);
          } catch (err) {
            reject(new APIError('响应解析失败', xhr.status));
          }
        } else {
          reject(new APIError('上传临时文件失败', xhr.status));
        }
      };

      xhr.onerror = () => reject(new APIError('网络错误', 0));
      xhr.ontimeout = () => reject(new APIError('上传超时', 0));
      xhr.send(formData);
    });
  },
};

// 文件验证配置
const FILE_VALIDATION = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp']
};

// 文件验证函数
const validateFile = (file: File): void => {
  // 文件大小检查
  if (file.size > FILE_VALIDATION.maxSize) {
    throw new APIError(
      `文件大小不能超过 ${Math.round(FILE_VALIDATION.maxSize / 1024 / 1024)}MB`,
      400,
      'FILE_TOO_LARGE',
      { maxSize: FILE_VALIDATION.maxSize, actualSize: file.size }
    );
  }
  
  // 文件类型检查
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidType = FILE_VALIDATION.allowedTypes.includes(file.type) || 
                     FILE_VALIDATION.allowedExtensions.includes(fileExtension || '');
  
  if (!isValidType && file.type !== '') {
    throw new APIError(
      '不支持的文件类型',
      400,
      'UNSUPPORTED_FILE_TYPE',
      { 
        allowedTypes: FILE_VALIDATION.allowedTypes,
        allowedExtensions: FILE_VALIDATION.allowedExtensions,
        actualType: file.type,
        actualExtension: fileExtension
      }
    );
  }
  
  // 文件名检查
  if (file.name.length > 255) {
    throw new APIError('文件名过长', 400, 'FILENAME_TOO_LONG');
  }
};

// 带进度的文件上传函数 - 增加超时和重试机制
const uploadFileWithProgress = async (
  endpoint: string,
  file: File,
  additionalData: Record<string, string> = {},
  onProgress?: (progress: number) => void,
  onUploadStart?: () => void,
  onUploadComplete?: () => void
): Promise<any> => {
  validateFile(file);
  
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const formData = new FormData();
  formData.append('file', file);
  
  // 添加详细的FormData构建日志
  console.log(`=== FormData 构建过程 ===`);
  console.log(`基础文件添加: file = ${file.name}`);
  
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
    console.log(`添加参数: ${key} = ${value}`);
  });
  
  // 验证FormData内容
  console.log(`=== FormData 最终内容 ===`);
  const entries = Array.from(formData.entries());
  entries.forEach(([key, value]) => {
    if (value instanceof File) {
      console.log(`${key}: [File: ${value.name}, size: ${value.size}]`);
    } else {
      console.log(`${key}: ${value}`);
    }
  });
  console.log(`==========================`);
  
  console.log(`开始上传文件: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB, 超时: 60秒`);
  
  onUploadStart?.();
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // 🔥 关键修复：先设置超时，再打开连接，最后设置请求头
    xhr.timeout = 60000; // 60秒超时
    
    // 设置事件监听器（在打开连接之前）
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      onUploadComplete?.();
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const rawResponse = xhr.responseText;
          console.log(`=== 上传响应原始数据 ===`);
          console.log(`状态码: ${xhr.status}`);
          console.log(`原始响应:`, rawResponse);
          
          const response = JSON.parse(rawResponse);
          console.log(`解析后响应:`, JSON.stringify(response, null, 2));
          
          const finalData = response?.data || response;
          console.log(`最终返回数据:`, JSON.stringify(finalData, null, 2));
          console.log(`========================`);
          
          resolve(finalData);
        } catch (error) {
          console.error('响应解析失败:', error);
          console.error('原始响应:', xhr.responseText);
          reject(new APIError('响应解析失败', xhr.status, 'PARSE_ERROR'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new APIError(
            errorResponse.message || `HTTP ${xhr.status}`,
            xhr.status,
            errorResponse.code || 'HTTP_ERROR'
          ));
        } catch {
          reject(new APIError(`HTTP ${xhr.status}`, xhr.status, 'HTTP_ERROR'));
        }
      }
    });
    
    xhr.addEventListener('error', () => {
      onUploadComplete?.();
      reject(new APIError('网络错误', 0, 'NETWORK_ERROR'));
    });
    
    xhr.addEventListener('timeout', () => {
      onUploadComplete?.();
      reject(new APIError('上传超时', 0, 'TIMEOUT_ERROR'));
    });
    
    // 🔥 关键修复：必须先调用 open() 方法
    xhr.open('POST', url);
    
    // 🔥 现在可以安全地设置请求头了
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    console.log(`发送POST请求到: ${url}`);
    console.log(`请求头包含: Authorization: Bearer ${token ? '[有Token]' : '[无Token]'}`);
    
    // 发送请求
    xhr.send(formData);
  });
};

// 添加缺少的 adminAPI
export const adminAPI = {
  async getUsers(): Promise<UserListResponse> {
    if (USE_MOCK_API) {
      return mockAPI.getUsers();
    }
    
    return apiRequest<UserListResponse>('/admin/users');
  },

  async getInviteCodes(): Promise<InviteCodeListResponse> {
    if (USE_MOCK_API) {
      return mockAPI.getInviteCodes();
    }
    
    return apiRequest<InviteCodeListResponse>('/admin/invite-codes');
  },

  async createInviteCode(): Promise<InviteCode> {
    if (USE_MOCK_API) {
      return mockAPI.createInviteCode();
    }
    
    return apiRequest<InviteCode>('/admin/invite-codes', {
      method: 'POST',
    });
  },

  async deactivateInviteCode(codeId: number): Promise<void> {
    await apiRequest(`/admin/invite-codes/${codeId}/deactivate`, {
      method: 'POST',
    });
  },

  async getUserStats(): Promise<any> {
    return apiRequest<any>('/admin/stats/users');
  },

  async getSystemStats(): Promise<any> {
    return apiRequest<any>('/admin/stats/system');
  },
};