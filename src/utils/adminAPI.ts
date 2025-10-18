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

interface CreateInviteCodeRequest {
  description?: string;
  expires_at?: string;
}

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api-icu.584743.xyz/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const adminAPI = {
  // 邀请码管理
  async getInviteCodes(): Promise<{ invite_codes: InviteCode[] }> {
    const response = await fetch(`${API_BASE}/invite-codes`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`获取邀请码失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || { invite_codes: [] };
  },

  async createInviteCode(data: CreateInviteCodeRequest): Promise<{ invite_code: InviteCode }> {
    const response = await fetch(`${API_BASE}/invite-codes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`创建邀请码失败: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  },

  async deleteInviteCode(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/invite-codes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`删除邀请码失败: ${response.status}`);
    }
  },

  // 全局文件管理
  async getGlobalFiles(): Promise<{ files: GlobalFile[] }> {
    const response = await fetch(`${API_BASE}/global-files`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`获取全局文件失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || { files: [] };
  },

  async uploadGlobalFile(file: File, onProgress?: (progress: number) => void): Promise<{ file: GlobalFile }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.data);
          } catch (error) {
            reject(new Error('解析上传响应失败'));
          }
        } else {
          reject(new Error(`上传文件失败: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('上传文件网络错误'));
      });
      
      const token = localStorage.getItem('auth_token');
      xhr.open('POST', `${API_BASE}/global-files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  async deleteGlobalFile(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/global-files/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`删除全局文件失败: ${response.status}`);
    }
  },

  async downloadGlobalFile(id: number, filename: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/global-files/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`下载文件失败: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};