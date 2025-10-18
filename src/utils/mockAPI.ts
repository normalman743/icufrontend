import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  Semester,
  Course,
  Chat,
  ChatMessage,
  InviteCode,
  ApiFile,
  Folder,
  GlobalFile,
  CreateChatRequest,
  CreateChatResponse,
  SendMessageRequest,
  SendMessageResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  UpdateUserRequest,
  FileUploadResponse,
  GlobalFileUploadResponse,
  CourseListResponse,
  SemesterListResponse,
  ChatListResponse,
  ChatMessagesResponse,
  UserListResponse,
  InviteCodeListResponse,
  FileListResponse,
  GlobalFileListResponse,
  FolderFilesResponse,
  CourseFoldersResponse
} from '../types';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据
const mockUsers: User[] = [
  {
    id: 1,
    username: 'Jackal',
    email: 'jackal@example.com',
    role: 'admin',
    balance: 100.50,
    total_spent: 25.00,
    preferred_language: 'zh_CN',
    preferred_theme: 'light',
    last_opened_semester_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    name: 'Jackal',
    avatar: '/Head_Portrait.png'
  },
  {
    id: 2,
    username: 'Alice',
    email: 'alice@example.com',
    role: 'user',
    balance: 50.00,
    total_spent: 10.00,
    preferred_language: 'zh_CN',
    preferred_theme: 'light',
    last_opened_semester_id: 1,
    created_at: '2024-01-15T00:00:00Z',
    name: 'Alice',
    avatar: '/Head_Portrait.png'
  }
];

const mockSemesters: Semester[] = [
  {
    id: 1,
    name: '2025, T3',
    start_date: '2025-01-01',
    end_date: '2025-04-30',
    is_active: true,
    created_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 2,
    name: '2024-25, T2',
    start_date: '2024-09-01',
    end_date: '2024-12-31',
    is_active: false,
    created_at: '2024-08-01T00:00:00Z'
  },
  {
    id: 3,
    name: '2024-25, T1',
    start_date: '2024-05-01',
    end_date: '2024-08-31',
    is_active: false,
    created_at: '2024-04-01T00:00:00Z'
  }
];

const mockCourses: Course[] = [
  {
    id: 1,
    name: '数据结构与算法',
    code: 'CS2040',
    description: '学习基本的数据结构和算法',
    semester_id: 1,
    user_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    semester: mockSemesters[0],
    stats: { total_files: 5, total_chats: 3 }
  },
  {
    id: 2,
    name: '微积分II',
    code: 'MATH1040',
    description: '高等数学课程',
    semester_id: 1,
    user_id: 1,
    created_at: '2024-01-02T00:00:00Z',
    semester: mockSemesters[0],
    stats: { total_files: 3, total_chats: 2 }
  },
  {
    id: 3,
    name: '哲学导论',
    code: 'PHIL1010',
    description: '哲学基础课程',
    semester_id: 1,
    user_id: 1,
    created_at: '2024-01-03T00:00:00Z',
    semester: mockSemesters[0],
    stats: { total_files: 2, total_chats: 1 }
  }
];

const mockChats: Chat[] = [
  {
    id: 1,
    title: '关于算法复杂度的问题',
    chat_type: 'general',
    course_id: null,
    user_id: 1,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:30:00Z',
    last_message_at: '2024-01-01T10:30:00Z'
  },
  {
    id: 2,
    title: '数据结构学习讨论',
    chat_type: 'course',
    course_id: 1,
    user_id: 1,
    created_at: '2024-01-02T14:00:00Z',
    updated_at: '2024-01-02T15:00:00Z',
    last_message_at: '2024-01-02T15:00:00Z'
  },
  {
    id: 3,
    title: '微积分问题解答',
    chat_type: 'course',
    course_id: 2,
    user_id: 1,
    created_at: '2024-01-03T09:00:00Z',
    updated_at: '2024-01-03T09:45:00Z',
    last_message_at: '2024-01-03T09:45:00Z'
  }
];

const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    chat_id: 1,
    content: '什么是时间复杂度？',
    role: 'user',
    model_name: null,
    tokens_used: 0,
    cost: 0,
    response_time_ms: 0,
    rag_sources: null,
    created_at: '2024-01-01T10:00:00Z',
    file_attachments: null
  },
  {
    id: 2,
    chat_id: 1,
    content: '时间复杂度是算法运行时间随输入规模增长的度量...',
    role: 'assistant',
    model_name: 'gpt-4',
    tokens_used: 120,
    cost: 0.003,
    response_time_ms: 1500,
    rag_sources: null,
    created_at: '2024-01-01T10:01:00Z',
    file_attachments: null
  }
];

const mockFiles: ApiFile[] = [
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
  },
  {
    id: 2,
    original_name: 'assignment1.docx',
    file_type: 'docx',
    file_size: 512000,
    file_path: '/files/assignment1.docx',
    course_id: 1,
    folder_id: null,
    uploaded_by: 1,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    is_processed: true,
    processing_status: 'completed',
    metadata: {}
  },
  {
    id: 3,
    original_name: 'calculus_notes.pdf',
    file_type: 'pdf',
    file_size: 800000,
    file_path: '/files/calculus_notes.pdf',
    course_id: 2,
    folder_id: null,
    uploaded_by: 1,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    is_processed: true,
    processing_status: 'completed',
    metadata: {}
  }
];

const mockGlobalFiles: GlobalFile[] = [
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
  },
  {
    id: 2,
    original_name: 'reference.pdf',
    file_type: 'pdf',
    file_size: 2048000,
    file_path: '/global/reference.pdf',
    category: 'reference',
    description: '参考资料',
    uploaded_by: 1,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    is_processed: true,
    processing_status: 'completed',
    metadata: {}
  }
];

const mockFolders: Folder[] = [
  {
    id: 1,
    name: '课件',
    folder_type: 'course',
    course_id: 1,
    parent_folder_id: null,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '作业',
    folder_type: 'course',
    course_id: 1,
    parent_folder_id: null,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '第一章',
    folder_type: 'course',
    course_id: 1,
    parent_folder_id: 1,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockInviteCodes: InviteCode[] = [
  {
    id: 1,
    code: 'INVITE123',
    created_by: 1,
    used_by: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    used_at: null
  },
  {
    id: 2,
    code: 'INVITE456',
    created_by: 1,
    used_by: 2,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    used_at: '2024-01-15T00:00:00Z'
  }
];

// 模拟API类
export class MockAPI {
  // 认证API
  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay(500);
    
    const user = mockUsers.find(u => u.username === data.username);
    if (!user || data.password !== 'password') {
      throw new Error('用户名或密码错误');
    }
    
    return {
      access_token: 'mock_token_' + user.id,
      token_type: 'bearer',
      user
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay(800);
    
    if (mockUsers.find(u => u.username === data.username)) {
      throw new Error('用户名已存在');
    }
    
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('邮箱已存在');
    }
    
    const newUser: User = {
      id: mockUsers.length + 1,
      username: data.username,
      email: data.email,
      role: 'user',
      balance: 0,
      total_spent: 0,
      preferred_language: 'zh_CN',
      preferred_theme: 'light',
      last_opened_semester_id: null,
      created_at: new Date().toISOString(),
      name: data.username,
      avatar: '/Head_Portrait.png'
    };
    
    mockUsers.push(newUser);
    
    return {
      access_token: 'mock_token_' + newUser.id,
      token_type: 'bearer',
      user: newUser
    };
  }

  async getCurrentUser(): Promise<User> {
    await delay(300);
    return mockUsers[0];
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    await delay(400);
    const user = { ...mockUsers[0], ...data };
    mockUsers[0] = user;
    return user;
  }

  async logout(): Promise<void> {
    await delay(200);
  }

  // 学期API
  async getSemesters(): Promise<SemesterListResponse> {
    await delay(300);
    return { semesters: mockSemesters };
  }

  async getSemester(semesterId: number): Promise<Semester> {
    await delay(300);
    const semester = mockSemesters.find(s => s.id === semesterId);
    if (!semester) throw new Error('学期不存在');
    return semester;
  }

  // 课程API
  async getCourses(): Promise<CourseListResponse> {
    await delay(400);
    return { courses: mockCourses };
  }

  async getCourse(courseId: number): Promise<Course> {
    await delay(300);
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) throw new Error('课程不存在');
    return course;
  }

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    await delay(600);
    const newCourse: Course = {
      id: mockCourses.length + 1,
      name: data.name,
      code: data.code,
      description: data.description,
      semester_id: data.semester_id,
      user_id: data.user_id,
      created_at: new Date().toISOString(),
      semester: mockSemesters.find(s => s.id === data.semester_id) || mockSemesters[0],
      stats: { total_files: 0, total_chats: 0 }
    };
    mockCourses.push(newCourse);
    return newCourse;
  }

  async updateCourse(courseId: number, data: UpdateCourseRequest): Promise<Course> {
    await delay(500);
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      throw new Error('课程不存在');
    }
    
    mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...data };
    return mockCourses[courseIndex];
  }

  async deleteCourse(courseId: number): Promise<void> {
    await delay(400);
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      throw new Error('课程不存在');
    }
    mockCourses.splice(courseIndex, 1);
  }

  async getCourseFiles(courseId: number): Promise<FileListResponse> {
    await delay(300);
    const files = mockFiles.filter(f => f.course_id === courseId);
    return { files };
  }

  // 聊天API
  async getChats(): Promise<ChatListResponse> {
    await delay(300);
    return { chats: mockChats };
  }

  async getChat(chatId: number): Promise<Chat> {
    await delay(300);
    const chat = mockChats.find(c => c.id === chatId);
    if (!chat) throw new Error('聊天不存在');
    return chat;
  }

  async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
    await delay(600);
    const newChat: Chat = {
      id: mockChats.length + 1,
      title: data.first_message ? data.first_message.substring(0, 30) + '...' : '新聊天',
      chat_type: data.chat_type as 'general' | 'course', // 🔥 修复：显式类型转换
      course_id: data.course_id || null,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: null
    };
    
    mockChats.unshift(newChat);
    
    let aiMessage: ChatMessage | undefined;
    if (data.first_message) {
      aiMessage = {
        id: Date.now(),
        chat_id: newChat.id,
        content: `这是对"${data.first_message}"的回复。我是AI助手，很高兴为您服务！`,
        role: 'assistant',
        model_name: 'gpt-4',
        tokens_used: 50,
        cost: 0.001,
        response_time_ms: 1000,
        rag_sources: null,
        created_at: new Date().toISOString(),
        file_attachments: null
      };
    }
    
    return {
      chat: newChat,
      ai_message: aiMessage
    };
  }

  async updateChat(chatId: number, data: { title?: string }): Promise<Chat> {
    await delay(400);
    const chatIndex = mockChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) throw new Error('聊天不存在');
    
    mockChats[chatIndex] = { ...mockChats[chatIndex], ...data, updated_at: new Date().toISOString() };
    return mockChats[chatIndex];
  }

  async deleteChat(chatId: number): Promise<void> {
    await delay(300);
    const chatIndex = mockChats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) throw new Error('聊天不存在');
    mockChats.splice(chatIndex, 1);
  }

  async deleteBatchChats(chatIds: number[]): Promise<void> {
    await delay(500);
    chatIds.forEach(id => {
      const index = mockChats.findIndex(c => c.id === id);
      if (index !== -1) mockChats.splice(index, 1);
    });
  }

  async getChatMessages(chatId: number): Promise<ChatMessagesResponse> {
    await delay(300);
    const messages = mockChatMessages.filter(m => m.chat_id === chatId);
    return { messages };
  }

  async sendMessage(chatId: number, data: SendMessageRequest): Promise<SendMessageResponse> {
    await delay(1000);
    
    const processedContent = data.content.replace(/\s+/g, ' ').trim();
    
    const aiMessage: ChatMessage = {
      id: Date.now(),
      chat_id: chatId,
      content: `这是对"${processedContent}"的AI回复。我理解您的问题，让我为您详细解答...`,
      role: 'assistant',
      model_name: 'gpt-4',
      tokens_used: 80,
      cost: 0.002,
      response_time_ms: 1200,
      rag_sources: data.file_ids && data.file_ids.length > 0 ? [
        {
          source_file: 'lecture1.pdf',
          content: '相关文档内容...',
          similarity_score: 0.85
        }
      ] : null,
      created_at: new Date().toISOString(),
      file_attachments: null
    };
    
    return { ai_message: aiMessage };
  }

  async searchChats(query: string): Promise<ChatListResponse> {
    await delay(400);
    const filteredChats = mockChats.filter(chat => 
      chat.title.toLowerCase().includes(query.toLowerCase())
    );
    return { chats: filteredChats };
  }

  async clearChatHistory(chatId: number): Promise<void> {
    await delay(500);
    // 清除该聊天的所有消息
    const messageIndices = mockChatMessages
      .map((msg, index) => msg.chat_id === chatId ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    messageIndices.forEach(index => mockChatMessages.splice(index, 1));
  }

  async exportChatHistory(chatId: number): Promise<Blob> {
    await delay(800);
    const chat = mockChats.find(c => c.id === chatId);
    const messages = mockChatMessages.filter(m => m.chat_id === chatId);
    
    const exportData = {
      chat,
      messages,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    return blob;
  }

  // 文件夹API
  async getFolders(): Promise<{ folders: Folder[] }> {
    await delay(300);
    return { folders: mockFolders };
  }

  async getCourseFolders(courseId: number): Promise<CourseFoldersResponse> {
    await delay(300);
    const folders = mockFolders.filter(f => f.course_id === courseId);
    return { folders };
  }

  async createFolder(data: {
    name: string;
    folder_type: string;
    course_id: number;
    parent_folder_id?: number;
  }): Promise<{ folder: Folder }> {
    await delay(500);
    
    const newFolder: Folder = {
      id: mockFolders.length + 1,
      name: data.name,
      folder_type: data.folder_type,
      course_id: data.course_id,
      parent_folder_id: data.parent_folder_id || null,
      created_at: new Date().toISOString()
    };
    
    mockFolders.push(newFolder);
    return { folder: newFolder };
  }

  async getFolderFiles(folderId: number): Promise<FolderFilesResponse> {
    await delay(300);
    const files = mockFiles.filter(f => f.folder_id === folderId);
    return { files };
  }

  // 文件API
  async getFiles(): Promise<FileListResponse> {
    await delay(300);
    return { files: mockFiles };
  }

  async getFile(fileId: number): Promise<ApiFile> {
    await delay(300);
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) throw new Error('文件不存在');
    return file;
  }

  async uploadFile(file: File, courseId?: number, folderId?: number): Promise<FileUploadResponse> {
    await delay(1500);
    
    const newFile: ApiFile = {
      id: mockFiles.length + 1,
      original_name: file.name,
      file_type: file.type || file.name.split('.').pop() || 'unknown',
      file_size: file.size,
      file_path: `/files/${file.name}`,
      course_id: courseId || null,
      folder_id: folderId || null,
      uploaded_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_processed: true,
      processing_status: 'completed',
      metadata: {}
    };
    
    mockFiles.push(newFile);
    return { file: newFile };
  }

  async getFilePreview(fileId: number): Promise<string> {
    await delay(500);
    return `模拟文件预览内容 - 文件ID: ${fileId}`;
  }

  async getFileStatus(fileId: number): Promise<{ status: string; progress?: number }> {
    await delay(200);
    return { status: 'completed', progress: 100 };
  }

  async downloadFile(fileId: number): Promise<Blob> {
    await delay(800);
    const content = `模拟文件内容 - 文件ID: ${fileId}`;
    return new Blob([content], { type: 'text/plain' });
  }

  async shareFile(fileId: number, shareData: any): Promise<{ share_link: string }> {
    await delay(400);
    return { share_link: `https://mock-share.example.com/files/${fileId}/share?token=mock_token` };
  }

  async getFileAccessLogs(fileId: number): Promise<any[]> {
    await delay(300);
    return [
      {
        id: 1,
        file_id: fileId,
        user_id: 1,
        action: 'view',
        ip_address: '127.0.0.1',
        user_agent: 'Mock Browser',
        created_at: new Date().toISOString()
      }
    ];
  }

  async deleteFile(fileId: number): Promise<void> {
    await delay(400);
    const fileIndex = mockFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) throw new Error('文件不存在');
    mockFiles.splice(fileIndex, 1);
  }

  async deleteBatchFiles(fileIds: number[]): Promise<void> {
    await delay(600);
    fileIds.forEach(id => {
      const index = mockFiles.findIndex(f => f.id === id);
      if (index !== -1) mockFiles.splice(index, 1);
    });
  }

  async searchFiles(query: string, courseId?: number): Promise<FileListResponse> {
    await delay(400);
    let filteredFiles = mockFiles.filter(file => 
      file.original_name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (courseId) {
      filteredFiles = filteredFiles.filter(file => file.course_id === courseId);
    }
    
    return { files: filteredFiles };
  }

  // 全局文件API
  async getGlobalFiles(): Promise<GlobalFileListResponse> {
    await delay(300);
    return { global_files: mockGlobalFiles };
  }

  async uploadGlobalFile(file: File, category: string, description?: string): Promise<GlobalFileUploadResponse> {
    await delay(1500);
    
    const newFile: GlobalFile = {
      id: mockGlobalFiles.length + 1,
      original_name: file.name,
      file_type: file.type || file.name.split('.').pop() || 'unknown',
      file_size: file.size,
      file_path: `/global/${file.name}`,
      category,
      description: description || '',
      uploaded_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_processed: true,
      processing_status: 'completed',
      metadata: {}
    };
    
    mockGlobalFiles.push(newFile);
    return { global_file: newFile };
  }

  async deleteGlobalFile(fileId: number): Promise<void> {
    await delay(400);
    const fileIndex = mockGlobalFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) throw new Error('全局文件不存在');
    mockGlobalFiles.splice(fileIndex, 1);
  }

  // 管理员API
  async getUsers(): Promise<UserListResponse> {
    await delay(300);
    return { users: mockUsers };
  }

  async getInviteCodes(): Promise<InviteCodeListResponse> {
    await delay(300);
    return { invite_codes: mockInviteCodes };
  }

  async createInviteCode(): Promise<InviteCode> {
    await delay(400);
    const newCode: InviteCode = {
      id: mockInviteCodes.length + 1,
      code: `INVITE${Date.now()}`,
      created_by: 1,
      used_by: null,
      is_active: true,
      created_at: new Date().toISOString(),
      used_at: null
    };
    mockInviteCodes.push(newCode);
    return newCode;
  }

  async deactivateInviteCode(codeId: number): Promise<void> {
    await delay(300);
    const codeIndex = mockInviteCodes.findIndex(c => c.id === codeId);
    if (codeIndex === -1) throw new Error('邀请码不存在');
    mockInviteCodes[codeIndex].is_active = false;
  }

  async getUserStats(): Promise<any> {
    await delay(400);
    return {
      total_users: mockUsers.length,
      active_users: mockUsers.filter(u => u.last_opened_semester_id !== null).length,
      new_users_this_month: 1,
      user_growth_rate: 0.15
    };
  }

  async getSystemStats(): Promise<any> {
    await delay(400);
    return {
      total_files: mockFiles.length + mockGlobalFiles.length,
      total_chats: mockChats.length,
      total_messages: mockChatMessages.length,
      total_courses: mockCourses.length,
      storage_used: 1024 * 1024 * 500, // 500MB
      api_calls_today: 1250
    };
  }
}

// 导出单例实例
export const mockAPI = new MockAPI();