// filepath: /Users/apple/Desktop/ccfyp_frontend/src/pages/AdminPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import AdminGuard from '../components/AdminGuard';
import { adminAPI } from '../utils/adminAPI';
import './AdminPage.css';

interface InviteCode {
  id: number;
  code: string;
  description?: string;
  is_used: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface GlobalFile {
  id: number;
  original_name: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

interface AdminPageProps {
  isSidebarCollapsed?: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ isSidebarCollapsed = false }) => {
  // 邀请码相关状态
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showCreateInviteForm, setShowCreateInviteForm] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    description: '',
    expires_at: ''
  });
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [deletingInviteId, setDeletingInviteId] = useState<number | null>(null);

  // 全局文件相关状态
  const [globalFiles, setGlobalFiles] = useState<GlobalFile[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 通用状态
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 清除消息
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // 显示错误消息
  const showError = (message: string) => {
    setError(message);
    setTimeout(clearMessages, 5000);
  };

  // 显示成功消息
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(clearMessages, 3000);
  };

  // 加载邀请码数据
  const loadInviteCodes = async () => {
    try {
      setInviteLoading(true);
      const response = await adminAPI.getInviteCodes();
      setInviteCodes(response.invite_codes || []);
    } catch (error) {
      console.error('加载邀请码失败:', error);
      showError('加载邀请码失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setInviteLoading(false);
    }
  };

  // 创建邀请码
  const handleCreateInviteCode = async () => {
    try {
      setIsCreatingInvite(true);
      clearMessages();

      const data: any = {};
      if (inviteFormData.description.trim()) {
        data.description = inviteFormData.description.trim();
      }
      if (inviteFormData.expires_at) {
        data.expires_at = inviteFormData.expires_at;
      }

      await adminAPI.createInviteCode(data);
      showSuccess('邀请码创建成功');
      
      // 重置表单并关闭
      setInviteFormData({ description: '', expires_at: '' });
      setShowCreateInviteForm(false);
      
      // 重新加载数据
      await loadInviteCodes();
    } catch (error) {
      console.error('创建邀请码失败:', error);
      showError('创建邀请码失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsCreatingInvite(false);
    }
  };

  // 删除邀请码
  const handleDeleteInviteCode = async (id: number) => {
    if (!window.confirm('确定要删除这个邀请码吗？')) return;

    try {
      setDeletingInviteId(id);
      clearMessages();
      
      await adminAPI.deleteInviteCode(id);
      showSuccess('邀请码删除成功');
      
      // 重新加载数据
      await loadInviteCodes();
    } catch (error) {
      console.error('删除邀请码失败:', error);
      showError('删除邀请码失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setDeletingInviteId(null);
    }
  };

  // 加载全局文件数据
  const loadGlobalFiles = async () => {
    try {
      setFileLoading(true);
      const response = await adminAPI.getGlobalFiles();
      setGlobalFiles(response.files || []);
    } catch (error) {
      console.error('加载全局文件失败:', error);
      showError('加载全局文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setFileLoading(false);
    }
  };

  // 上传文件
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      clearMessages();

      await adminAPI.uploadGlobalFile(file, (progress) => {
        setUploadProgress(progress);
      });

      showSuccess('文件上传成功');
      
      // 重新加载数据
      await loadGlobalFiles();
    } catch (error) {
      console.error('上传文件失败:', error);
      showError('上传文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除文件
  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('确定要删除这个文件吗？')) return;

    try {
      setDeletingFileId(id);
      clearMessages();
      
      await adminAPI.deleteGlobalFile(id);
      showSuccess('文件删除成功');
      
      // 重新加载数据
      await loadGlobalFiles();
    } catch (error) {
      console.error('删除文件失败:', error);
      showError('删除文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setDeletingFileId(null);
    }
  };

  // 下载文件
  const handleDownloadFile = async (id: number, filename: string) => {
    try {
      await adminAPI.downloadGlobalFile(id, filename);
    } catch (error) {
      console.error('下载文件失败:', error);
      showError('下载文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadInviteCodes();
    loadGlobalFiles();
  }, []);

  return (
    <AdminGuard>
      <div className={`admin-page ${isSidebarCollapsed ? 'admin-page--sidebar-collapsed' : ''}`}>
        <div className="admin-container">
          {/* 页面标题 */}
          <div className="admin-header">
            <h1 className="admin-title">管理员面板</h1>
            <p className="admin-subtitle">邀请码与全局文件管理</p>
          </div>

          {/* 消息提示 */}
          {error && (
            <div className="admin-message admin-message--error">
              <span className="admin-message-icon">❌</span>
              <span className="admin-message-text">{error}</span>
              <button 
                className="admin-message-close"
                onClick={clearMessages}
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="admin-message admin-message--success">
              <span className="admin-message-icon">✅</span>
              <span className="admin-message-text">{success}</span>
              <button 
                className="admin-message-close"
                onClick={clearMessages}
              >
                ×
              </button>
            </div>
          )}

          {/* 邀请码管理区域 */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                <span className="admin-section-icon">🎫</span>
                邀请码管理
              </h2>
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => setShowCreateInviteForm(true)}
                disabled={inviteLoading}
              >
                <span className="admin-btn-icon">➕</span>
                创建邀请码
              </button>
            </div>

            {/* 创建邀请码表单 */}
            {showCreateInviteForm && (
              <div className="admin-form-card">
                <div className="admin-form-header">
                  <h3>创建新邀请码</h3>
                  <button
                    className="admin-form-close"
                    onClick={() => setShowCreateInviteForm(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="admin-form-body">
                  <div className="admin-form-field">
                    <label className="admin-form-label">描述 (可选)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={inviteFormData.description}
                      onChange={(e) => setInviteFormData(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      placeholder="邀请码描述..."
                      disabled={isCreatingInvite}
                    />
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">过期时间 (可选)</label>
                    <input
                      type="datetime-local"
                      className="admin-form-input"
                      value={inviteFormData.expires_at}
                      onChange={(e) => setInviteFormData(prev => ({ 
                        ...prev, 
                        expires_at: e.target.value 
                      }))}
                      disabled={isCreatingInvite}
                    />
                  </div>
                </div>
                <div className="admin-form-footer">
                  <button
                    className="admin-btn admin-btn--secondary"
                    onClick={() => setShowCreateInviteForm(false)}
                    disabled={isCreatingInvite}
                  >
                    取消
                  </button>
                  <button
                    className="admin-btn admin-btn--primary"
                    onClick={handleCreateInviteCode}
                    disabled={isCreatingInvite}
                  >
                    {isCreatingInvite ? '创建中...' : '创建'}
                  </button>
                </div>
              </div>
            )}

            {/* 邀请码列表 */}
            <div className="admin-table-container">
              {inviteLoading ? (
                <div className="admin-loading">
                  <div className="admin-loading-spinner"></div>
                  <span>加载邀请码中...</span>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>邀请码</th>
                      <th>描述</th>
                      <th>状态</th>
                      <th>过期时间</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inviteCodes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-table-empty">
                          暂无邀请码
                        </td>
                      </tr>
                    ) : (
                      inviteCodes.map((code) => (
                        <tr key={code.id}>
                          <td>{code.id}</td>
                          <td>
                            <code className="admin-code">{code.code}</code>
                          </td>
                          <td>{code.description || '-'}</td>
                          <td>
                            <span className={`admin-status ${code.is_used ? 'admin-status--used' : 'admin-status--unused'}`}>
                              {code.is_used ? '已使用' : '未使用'}
                            </span>
                          </td>
                          <td>{code.expires_at ? formatDate(code.expires_at) : '永不过期'}</td>
                          <td>{formatDate(code.created_at)}</td>
                          <td>
                            <button
                              className="admin-btn admin-btn--danger admin-btn--small"
                              onClick={() => handleDeleteInviteCode(code.id)}
                              disabled={deletingInviteId === code.id}
                            >
                              {deletingInviteId === code.id ? '删除中...' : '删除'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 全局文件管理区域 */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                <span className="admin-section-icon">📁</span>
                全局文件管理
              </h2>
              <div className="admin-upload-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="admin-file-input"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <button
                  className="admin-btn admin-btn--primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <span className="admin-btn-icon">📤</span>
                  {isUploading ? `上传中 ${uploadProgress}%` : '上传文件'}
                </button>
              </div>
            </div>

            {/* 上传进度条 */}
            {isUploading && (
              <div className="admin-progress-container">
                <div className="admin-progress-bar">
                  <div 
                    className="admin-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="admin-progress-text">{uploadProgress}%</span>
              </div>
            )}

            {/* 文件列表 */}
            <div className="admin-table-container">
              {fileLoading ? (
                <div className="admin-loading">
                  <div className="admin-loading-spinner"></div>
                  <span>加载文件中...</span>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>文件名</th>
                      <th>大小</th>
                      <th>类型</th>
                      <th>上传时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalFiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-table-empty">
                          暂无全局文件
                        </td>
                      </tr>
                    ) : (
                      globalFiles.map((file) => (
                        <tr key={file.id}>
                          <td>{file.id}</td>
                          <td>
                            <span className="admin-filename" title={file.original_name}>
                              {file.original_name}
                            </span>
                          </td>
                          <td>{formatFileSize(file.file_size)}</td>
                          <td>
                            <span className="admin-file-type">{file.file_type}</span>
                          </td>
                          <td>{formatDate(file.created_at)}</td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                className="admin-btn admin-btn--secondary admin-btn--small"
                                onClick={() => handleDownloadFile(file.id, file.original_name)}
                                title="下载文件"
                              >
                                📥
                              </button>
                              <button
                                className="admin-btn admin-btn--danger admin-btn--small"
                                onClick={() => handleDeleteFile(file.id)}
                                disabled={deletingFileId === file.id}
                                title="删除文件"
                              >
                                {deletingFileId === file.id ? '删除中...' : '🗑️'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminPage;