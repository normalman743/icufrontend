// API 基础类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  total_spent: number;
  preferred_language: 'zh_CN' | 'en';
  preferred_theme: 'light' | 'dark' | 'system';
  last_opened_semester_id: number | null;
  created_at: string;
  // 为了兼容Settings组件
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'zh_CN' | 'en';
  notifications: boolean;
}

// 认证相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  invite_code: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 学期相关类型
export interface Semester {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// 课程相关类型
export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  semester_id: number;
  user_id: number;
  created_at: string;
  semester: Semester;
  stats: {
    total_files: number;
    total_chats: number;
  };
}

export interface CourseSection {
  id: string;
  name: string;
  files: ApiFile[];
}

export interface CourseResource {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
  description: string;
}

// 文件夹相关类型
export interface Folder {
  id: number;
  name: string;
  folder_type: string;
  course_id: number;
  parent_folder_id: number | null;
  created_at: string;
}

// 文件相关类型 - 重命名为ApiFile避免与浏览器File冲突
export interface ApiFile {
  id: number;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  course_id: number | null;
  folder_id: number | null;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  is_processed: boolean;
  processing_status: string;
  metadata: any;
}

// 全局文件类型
export interface GlobalFile {
  id: number;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  category: string;
  description: string | null;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  is_processed: boolean;
  processing_status: string;
  metadata: any;
}

// 聊天相关类型
export interface Chat {
  id: number;
  title: string;
  chat_type: 'general' | 'course';
  course_id: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  lastActivity: Date;
  messages: ChatMessage[];
  chatType: 'general' | 'course';
  courseId?: number;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  content: string;
  role: 'user' | 'assistant';
  model_name: string | null;
  tokens_used: number | null;
  cost: number | null;
  response_time_ms: number | null;
  rag_sources: RAGSource[] | null;
  created_at: string;
  file_attachments: FileAttachment[] | null;
  // 为了兼容旧代码
  sender?: 'user' | 'assistant';
  timestamp?: Date;
}

export interface RAGSource {
  source_file: string;
  content: string;
  similarity_score: number;
}

export interface FileAttachment {
  id: number;
  original_name: string;
  file_type: string;
  file_size: number;
}

// 邀请码相关类型
export interface InviteCode {
  id: number;
  code: string;
  created_by: number;
  used_by: number | null;
  is_active: boolean;
  created_at: string;
  used_at: string | null;
}

// SSE消息类型
export interface SSEMessage {
  type: 'chat_created' | 'user_message' | 'ai_start' | 'ai_content' | 'ai_end' | 'error';
  data: any;
}

// 聊天创建请求
export interface CreateChatRequest {
  chat_type: 'general' | 'course'; // 🔥 修复：明确类型
  first_message?: string; // 🔥 修复：改为可选，因为新建聊天时可能没有首条消息
  course_id?: number;
  custom_prompt?: string;
  ai_model?: AIModel | string; // 支持枚举或字符串
  search_enabled?: boolean;
  context_mode?: string;
  file_ids?: number[];
  folder_ids?: number[];
  temporary_file_tokens?: string[];
  stream?: boolean;
}

// 聊天创建响应
export interface CreateChatResponse {
  chat: Chat;
  ai_message?: ChatMessage;
}

// 发送消息请求
export interface SendMessageRequest {
  content: string;
  ai_model?: AIModel | string; // 添加模型选择支持
  file_ids?: number[];
  folder_ids?: number[];
  temporary_file_tokens?: string[];
  stream?: boolean;
}

// 发送消息响应
export interface SendMessageResponse {
  ai_message: ChatMessage;
}

// 课程创建请求
export interface CreateCourseRequest {
  name: string;
  code: string;
  description: string;
  semester_id: number;
  user_id: number;
}

// 课程更新请求
export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  description?: string;
  semester_id?: number;
}

// 用户更新请求
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  preferred_language?: 'zh_CN' | 'en';
  preferred_theme?: 'light' | 'dark' | 'system';
}

// 文件上传响应
export interface FileUploadResponse {
  file: ApiFile;
}

// 全局文件上传响应
export interface GlobalFileUploadResponse {
  global_file: GlobalFile;
}

// 文件夹文件响应
export interface FolderFilesResponse {
  files: ApiFile[];
}

// 课程文件夹响应
export interface CourseFoldersResponse {
  folders: Folder[];
}

// 课程资源批量响应（一个请求获取所有文件夹及其文件）
export interface FolderWithFiles {
  id: number;
  name: string;
  folder_type: string;
  course_id: number;
  is_default: boolean;
  created_at: string;
  stats: { file_count: number };
  files: ApiFile[];
}

export interface CourseResourcesResponse {
  folders: FolderWithFiles[];
}

// 课程列表响应
export interface CourseListResponse {
  courses: Course[];
}

// 学期列表响应
export interface SemesterListResponse {
  semesters: Semester[];
}

// 聊天列表响应
export interface ChatListResponse {
  chats: Chat[];
}

// 聊天消息列表响应
export interface ChatMessagesResponse {
  messages: ChatMessage[];
}

// 用户列表响应
export interface UserListResponse {
  users: User[];
}

// 邀请码列表响应
export interface InviteCodeListResponse {
  invite_codes: InviteCode[];
}

// 文件列表响应
export interface FileListResponse {
  files: ApiFile[];
}

// 全局文件列表响应
export interface GlobalFileListResponse {
  global_files: GlobalFile[];
}

// 在现有类型定义中添加AI模型枚举
export enum AIModel {
  STAR = "Star",
  STAR_PLUS = "StarPlus",
  STAR_CODE = "StarCode"
}

// 更新CreateChatRequest接口，确保ai_model字段使用正确的类型
export interface CreateChatRequest {
  chat_type: 'general' | 'course';
  first_message?: string;
  course_id?: number;
  custom_prompt?: string;
  ai_model?: AIModel | string; // 支持枚举或字符串
  search_enabled?: boolean;
  context_mode?: string;
  file_ids?: number[];
  folder_ids?: number[];
  temporary_file_tokens?: string[];
  stream?: boolean;
}

// 更新SendMessageRequest接口，也可能需要模型选择
export interface SendMessageRequest {
  content: string;
  ai_model?: AIModel | string; // 添加模型选择支持
  file_ids?: number[];
  folder_ids?: number[];
  temporary_file_tokens?: string[];
  stream?: boolean;
}
