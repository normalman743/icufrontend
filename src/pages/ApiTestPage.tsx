import React, { useState } from 'react';
import { 
  authAPI, 
  semesterAPI, 
  courseAPI, 
  chatAPI, 
  fileAPI, 
  adminAPI
} from '../utils/api';
import { User, Course, Chat, ApiFile } from '../types';
import AdminGuard from '../components/AdminGuard'; // 🔥 新增：导入AdminGuard
import './ApiTestPage.css';

// 本地配置对象
const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  useMockApi: process.env.REACT_APP_USE_MOCK_API === 'true'
};

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // 添加日志
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setTestResults(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 49)]);
  };

  // 测试认证API
  const testAuthAPI = async () => {
    try {
      addLog('🚀 开始测试认证API...');
      
      // 测试登录
      const loginResponse = await authAPI.login({ username: 'Jackal', password: 'password' });
      addLog(`✅ 登录成功: ${loginResponse.user.username}`);
      
      // 测试获取当前用户
      const userResponse = await authAPI.getCurrentUser();
      setCurrentUser(userResponse);
      addLog(`✅ 获取当前用户成功: ${userResponse.username}`);
      
      // 测试更新用户
      const updateResponse = await authAPI.updateUser({ username: 'Jackal_Updated' });
      addLog(`✅ 更新用户成功: ${updateResponse.username}`);
      
      // 恢复用户名
      await authAPI.updateUser({ username: 'Jackal' });
      
    } catch (error) {
      addLog(`❌ 认证API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试学期API
  const testSemesterAPI = async () => {
    try {
      addLog('📅 开始测试学期API...');
      
      const response = await semesterAPI.getSemesters();
      setSemesters(response.semesters);
      addLog(`✅ 获取学期列表成功: ${response.semesters.length} 个学期`);
      
    } catch (error) {
      addLog(`❌ 学期API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试课程API
  const testCourseAPI = async () => {
    try {
      addLog('📚 开始测试课程API...');
      
      // 获取课程列表
      const coursesResponse = await courseAPI.getCourses();
      setCourses(coursesResponse.courses);
      addLog(`✅ 获取课程列表成功: ${coursesResponse.courses.length} 个课程`);
      
      // 创建新课程
      const newCourse = await courseAPI.createCourse({
        name: '测试课程',
        code: 'TEST001',
        description: '这是一个测试课程',
        semester_id: 1,
        user_id: 1
      });
      addLog(`✅ 创建课程成功: ${newCourse.name}`);
      
      // 更新课程
      const updatedCourse = await courseAPI.updateCourse(newCourse.id, {
        name: '更新后的课程名称',
        description: '更新后的课程描述'
      });
      addLog(`✅ 更新课程成功: ${updatedCourse.name}`);
      
      // 删除课程
      await courseAPI.deleteCourse(newCourse.id);
      addLog(`✅ 删除课程成功: ID ${newCourse.id}`);
      
    } catch (error) {
      addLog(`❌ 课程API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试聊天API
  const testChatAPI = async () => {
    try {
      addLog('💬 开始测试聊天API...');
      
      // 获取聊天列表
      const chatsResponse = await chatAPI.getChats();
      setChats(chatsResponse.chats);
      addLog(`✅ 获取聊天列表成功: ${chatsResponse.chats.length} 个聊天`);
      
      // 创建新聊天
      const newChat = await chatAPI.createChat({
        chat_type: 'general',
        first_message: '你好，这是一个测试消息'
      });
      addLog(`✅ 创建聊天成功: ${newChat.chat.title}`);
      
      // 发送消息
      if (newChat.chat) {
        const messageResponse = await chatAPI.sendMessage(newChat.chat.id, {
          content: '这是第二条测试消息'
        });
        addLog(`✅ 发送消息成功: ${messageResponse.ai_message?.content.substring(0, 30)}...`);
      }
      
    } catch (error) {
      addLog(`❌ 聊天API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试文件API
  const testFileAPI = async () => {
    try {
      addLog('📁 开始测试文件API...');
      
      // 获取全局文件
      const globalFilesResponse = await fileAPI.getGlobalFiles();
      addLog(`✅ 获取全局文件成功: ${globalFilesResponse.global_files.length} 个文件`);
      
      // 文件上传测试
      if (selectedFile) {
        const uploadResponse = await fileAPI.uploadFile(selectedFile);
        addLog(`✅ 文件上传成功: ${uploadResponse.file.original_name}`);
      } else {
        // 创建测试文件
        const testFile = new File(['这是一个测试文件的内容'], 'test.txt', { type: 'text/plain' });
        const uploadResponse = await fileAPI.uploadFile(testFile);
        addLog(`✅ 文件上传成功: ${uploadResponse.file.original_name}`);
      }
      
    } catch (error) {
      addLog(`❌ 文件API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 测试管理员API
  const testAdminAPI = async () => {
    try {
      addLog('👨‍💼 开始测试管理员API...');
      
      // 获取用户列表
      const usersResponse = await adminAPI.getUsers();
      setUsers(usersResponse.users);
      addLog(`✅ 获取用户列表成功: ${usersResponse.users.length} 个用户`);
      
      // 获取邀请码列表
      const inviteCodesResponse = await adminAPI.getInviteCodes();
      addLog(`✅ 获取邀请码列表成功: ${inviteCodesResponse.invite_codes.length} 个邀请码`);
      
    } catch (error) {
      addLog(`❌ 管理员API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addLog('🚀 开始运行所有API测试...');
    
    try {
      await testAuthAPI();
      await testSemesterAPI();
      await testCourseAPI();
      await testChatAPI();
      await testFileAPI();
      await testAdminAPI();
      
      addLog('🎉 所有API测试完成！');
    } catch (error) {
      addLog(`❌ 测试过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 清空日志
  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <AdminGuard>
      <div className="api-test-page">
        <div className="api-test-header">
          <h1>🧪 API测试工具</h1>
          <p>用于测试前端API功能，支持模拟数据和真实API切换</p>
          <div className="api-test-admin-badge">
            <span className="api-test-admin-icon">👨‍💼</span>
            <span className="api-test-admin-text">管理员专用工具</span>
          </div>
        </div>

        <div className="api-test-content">
          {/* 控制面板 */}
          <div className="api-test-controls">
            <div className="api-test-section">
              <h3>🔧 测试控制</h3>
              <div className="api-test-buttons">
                <button 
                  className="api-test-btn api-test-btn--primary"
                  onClick={runAllTests}
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 测试中...' : '🚀 运行所有测试'}
                </button>
                
                <button 
                  className="api-test-btn"
                  onClick={testAuthAPI}
                  disabled={isLoading}
                >
                  🔐 认证测试
                </button>
                
                <button 
                  className="api-test-btn"
                  onClick={testSemesterAPI}
                  disabled={isLoading}
                >
                  📅 学期测试
                </button>
                
                <button 
                  className="api-test-btn"
                  onClick={testCourseAPI}
                  disabled={isLoading}
                >
                  📚 课程测试
                </button>
                
                <button 
                  className="api-test-btn"
                  onClick={testChatAPI}
                  disabled={isLoading}
                >
                  💬 聊天测试
                </button>
                
                <button 
                  className="api-test-btn"
                  onClick={testFileAPI}
                  disabled={isLoading}
                >
                  📁 文件测试
                </button>
                
                <button 
                  className="api-test-btn"
                  onClick={testAdminAPI}
                  disabled={isLoading}
                >
                  👨‍💼 管理员测试
                </button>
                
                <button 
                  className="api-test-btn api-test-btn--secondary"
                  onClick={clearLogs}
                >
                  🗑️ 清空日志
                </button>
              </div>
            </div>

            {/* 文件上传测试 */}
            <div className="api-test-section">
              <h3>📁 文件上传测试</h3>
              <div className="api-test-file-upload">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                  className="api-test-file-input"
                />
                <span className="api-test-file-info">
                  {selectedFile ? `已选择: ${selectedFile.name}` : '请选择文件进行上传测试'}
                </span>
              </div>
            </div>

            {/* 当前状态 */}
            <div className="api-test-section">
              <h3>📊 当前状态</h3>
              <div className="api-test-status">
                <p>当前配置:</p>
                <ul>
                  <li>API基础URL: {apiConfig.baseUrl}</li>
                  <li>使用模拟API: {apiConfig.useMockApi ? '是' : '否'}</li>
                  <li>当前用户: {currentUser ? currentUser.username : '未登录'}</li>
                </ul>
                
                <p>数据统计:</p>
                <ul>
                  <li>学期: {semesters.length} 个</li>
                  <li>课程: {courses.length} 个</li>
                  <li>聊天: {chats.length} 个</li>
                  <li>用户: {users.length} 个</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 测试结果 */}
          <div className="api-test-results">
            <div className="api-test-results-header">
              <h3>📋 测试日志</h3>
              <span className="api-test-results-count">
                {testResults.length} 条记录
              </span>
            </div>
            
            <div className="api-test-log-container">
              {testResults.length === 0 ? (
                <div className="api-test-empty">
                  <p>暂无测试日志</p>
                  <p>点击上方按钮开始测试</p>
                </div>
              ) : (
                <div className="api-test-log">
                  {testResults.map((log, index) => (
                    <div key={index} className="api-test-log-item">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default ApiTestPage;