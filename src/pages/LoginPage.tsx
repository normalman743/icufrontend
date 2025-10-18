import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest, RegisterRequest } from '../types';
import { APIError } from '../utils/api';
import './LoginPage.css';

// 国际化文本
const i18nTexts = {
  'zh_CN': {
    // 标题和副标题
    title: 'Intelligent CU',
    subtitle: '您的AI学习助手',
    
    // 表单标题
    loginTitle: '登录',
    registerTitle: '注册',
    
    // 表单字段
    email: '邮箱',
    username: '用户名',
    password: '密码',
    inviteCode: '邀请码',
    
    // 占位符
    emailPlaceholder: '请输入 @link.cuhk.edu.hk 邮箱',
    usernamePlaceholder: '请输入用户名',
    passwordPlaceholder: '请输入密码（至少8位）混合数字字母',
    inviteCodePlaceholder: '请输入邀请码',
    
    // 按钮
    loginButton: '登录',
    registerButton: '注册',
    processing: '处理中...',
    
    // 切换模式
    switchToRegister: '没有账号？立即注册',
    switchToLogin: '已有账号？立即登录',
    
    // 错误信息
    defaultError: '操作失败，请重试',
    emailDomainError: '邮箱必须以 @link.cuhk.edu.hk 结尾',
    passwordLengthError: '密码必须至少8个字符',
    passwordMinLengthError: '密码长度至少8位',
    invalidEmailError: '请输入有效的 @link.cuhk.edu.hk 邮箱地址',
    requiredFieldsError: '请填写完整的注册信息',
    loginRequiredFieldsError: '请填写完整的登录信息'
  },
  'en': {
    // 标题和副标题
    title: 'Intelligent CU',
    subtitle: 'Your AI Learning Assistant',
    
    // 表单标题
    loginTitle: 'Login',
    registerTitle: 'Register',
    
    // 表单字段
    email: 'Email',
    username: 'Username',
    password: 'Password',
    inviteCode: 'Invite Code',
    
    // 占位符
    emailPlaceholder: 'Enter your @link.cuhk.edu.hk email',
    usernamePlaceholder: 'Enter your username',
    passwordPlaceholder: 'Enter password (at least 8 characters)',
    inviteCodePlaceholder: 'Enter invite code',
    
    // 按钮
    loginButton: 'Login',
    registerButton: 'Register',
    processing: 'Processing...',
    
    // 切换模式
    switchToRegister: 'No account? Register now',
    switchToLogin: 'Have an account? Login now',
    
    // 错误信息
    defaultError: 'Operation failed, please try again',
    emailDomainError: 'Email must end with @link.cuhk.edu.hk',
    passwordLengthError: 'Password must be at least 8 characters',
    passwordMinLengthError: 'Password must be at least 8 characters',
    invalidEmailError: 'Please enter a valid @link.cuhk.edu.hk email address',
    requiredFieldsError: 'Please fill in all registration information',
    loginRequiredFieldsError: 'Please fill in all login information'
  }
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // 添加成功消息状态
  const [showPassword, setShowPassword] = useState(false); // 添加显示密码状态
  
  // 获取语言设置 - 从localStorage或默认中文
  const [language, setLanguage] = useState<'zh_CN' | 'en'>(() => {
    const saved = localStorage.getItem('login-language');
    return (saved as 'zh_CN' | 'en') || 'zh_CN';
  });

  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    username: '',
    password: '',
    email: '',
    invite_code: '',
  });

  // 获取当前语言的文本
  const t = i18nTexts[language];

  // 如果用户已登录，重定向到目标页面
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = (location.state as any)?.from?.pathname || '/chat'; // 修改默认跳转到 /chat
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // 保存语言设置
  useEffect(() => {
    localStorage.setItem('login-language', language);
  }, [language]);

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh_CN' ? 'en' : 'zh_CN');
  };

  // 解析错误消息的函数
  const parseErrorMessage = (errorMessage: string): string => {
    console.log('原始错误消息:', errorMessage);
    
    // 检查是否包含特定错误信息
    if (errorMessage.includes('邮箱必须以 @link.cuhk.edu.hk 结尾') || 
        errorMessage.includes('Email must end with @link.cuhk.edu.hk')) {
      return t.emailDomainError;
    }
    
    if (errorMessage.includes('密码必须至少8个字符') || 
        errorMessage.includes('Password must be at least 8 characters')) {
      return t.passwordLengthError;
    }
    
    // 返回原始错误消息或默认错误
    return errorMessage || t.defaultError;
  };

  // 修改 handleInputChange 函数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`输入字段 ${name}:`, `"${value}"`, '长度:', value.length);
    
    // 🔧 修复：不要在输入时trim，保持用户的原始输入
    setFormData(prev => ({
      ...prev,
      [name]: value // 移除 .trim()
    }));
    setError('');
    setSuccessMessage('');
  };

  // 修改粘贴处理函数
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const fieldName = target.name;
    
    setTimeout(() => {
      const value = target.value; // 🔧 修复：不要trim
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
      console.log(`粘贴字段 ${fieldName}:`, `"${value}"`, '长度:', value.length);
    }, 0);
  };

  // 🔥 新增：用于显示注册成功倒计时的状态
  const [countdown, setCountdown] = useState(0);

  // 🔥 新增：倒计时效果
  useEffect(() => {
    let timer: number | undefined; // 🔥 使用正确的浏览器类型
    
    if (countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && successMessage) {
      // 倒计时结束，切换到登录模式
      setIsLogin(true);
      setSuccessMessage('');
    }
    
    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [countdown, successMessage]);

  // 修改提交处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setCountdown(0); // 🔥 重置倒计时

    try {
      if (isLogin) {
        // 登录逻辑保持不变
        const username = formData.username.trim();
        const password = formData.password.trim();
        
        if (!username || !password) {
          throw new Error(t.loginRequiredFieldsError);
        }
        
        console.log('=== 登录调试信息 ===');
        console.log('原始用户名:', `"${formData.username}"`);
        console.log('处理后用户名:', `"${username}"`);
        console.log('原始密码:', `"${formData.password}"`);
        console.log('处理后密码:', `"${password}"`);
        console.log('密码长度:', password.length);
        
        await login({
          username: username,
          password: password,
        });
      } else {
        // 注册逻辑
        const email = formData.email.trim();
        const username = formData.username.trim();
        const password = formData.password.trim();
        const invite_code = formData.invite_code.trim();
        
        if (!email || !username || !password || !invite_code) {
          throw new Error(t.requiredFieldsError);
        }
        
        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error(t.invalidEmailError);
        }
        
        // 检查邮箱域名
        if (!email.endsWith('@link.cuhk.edu.hk')) {
          throw new Error(t.emailDomainError);
        }
        
        // 密码强度验证
        if (password.length < 8) {
          throw new Error(t.passwordMinLengthError);
        }
        
        console.log('=== 注册调试信息 ===');
        console.log('原始密码:', `"${formData.password}"`);
        console.log('处理后密码:', `"${password}"`);
        console.log('密码长度:', password.length);
        console.log('邮箱:', `"${email}"`);
        
        await register({
          email: email,
          username: username,
          password: password,
          invite_code: invite_code,
        });
        
        // 🔥 注册成功后的处理 - 改进用户体验
        setSuccessMessage(language === 'zh_CN' ? 
          '注册成功！' : 
          'Registration successful!');
        
        // 清空所有字段
        setFormData({
          username: '',
          password: '',
          email: '',
          invite_code: '',
        });
        
        // 🔥 启动3秒倒计时
        setCountdown(3);
        
        return;
      }
    } catch (error: any) {
      console.error('认证失败:', error);
      
      // 处理不同类型的错误
      if (error instanceof APIError) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            setError(language === 'zh_CN' ? '用户名或密码错误' : 'Invalid username or password');
            break;
          case 'USER_ALREADY_EXISTS':
            setError(language === 'zh_CN' ? '用户名或邮箱已存在' : 'Username or email already exists');
            break;
          case 'INVALID_INVITE_CODE':
            setError(language === 'zh_CN' ? '邀请码无效或已使用' : 'Invalid or used invite code');
            break;
          case 'NETWORK_ERROR':
            setError(language === 'zh_CN' ? '网络连接失败，请检查网络设置' : 'Network connection failed');
            break;
          case 'CORS_ERROR':
            setError(language === 'zh_CN' ? 'CORS错误，请联系管理员' : 'CORS error, please contact administrator');
            break;
          default:
            setError(parseErrorMessage(error.message || ''));
        }
      } else {
        setError(parseErrorMessage(error.message || ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setCountdown(0); // 🔥 重置倒计时
    // 完全清空表单数据
    setFormData({
      username: '',
      password: '',
      email: '',
      invite_code: '',
    });
  };

  // 添加重定向到 home 的函数
  const handleTitleClick = () => {
    navigate('/');
  };

  // 如果正在检查认证状态，显示加载状态
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-loading">
            <div className="loading-spinner"></div>
            <p>{language === 'zh_CN' ? '加载中...' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* 语言切换按钮 */}
        <button 
          className="login-language-toggle"
          onClick={toggleLanguage}
          title={language === 'zh_CN' ? 'Switch to English' : '切换到中文'}
        >
          {language === 'zh_CN' ? 'EN' : '中'}
        </button>

        <div className="login-header">
          <div className="login-logo">
            <img src="/iCU_Icon.png" alt="iCU Logo" />
            <h1 
              style={{ cursor: 'pointer' }} 
              onClick={handleTitleClick}
            >
              {t.title}
            </h1>
          </div>
          <p className="login-subtitle">{t.subtitle}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? t.loginTitle : t.registerTitle}</h2>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* 🔥 改进：显示更友好的成功消息和倒计时 */}
          {successMessage && (
            <div className="login-success">
              {successMessage}
              {countdown > 0 && (
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#059669' }}>
                  {language === 'zh_CN' 
                    ? `${countdown} 秒后自动跳转到登录页面...` 
                    : `Redirecting to login page in ${countdown} seconds...`}
                </div>
              )}
              {countdown > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCountdown(0);
                    setIsLogin(true);
                    setSuccessMessage('');
                  }}
                  style={{
                    marginTop: '8px',
                    background: 'none',
                    border: '1px solid #059669',
                    color: '#059669',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {language === 'zh_CN' ? '立即跳转' : 'Skip countdown'}
                </button>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">{t.email}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onPaste={handlePaste}
                required={!isLogin}
                placeholder={t.emailPlaceholder}
                disabled={isLoading || countdown > 0} // 🔥 倒计时期间禁用输入
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">{t.username}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onPaste={handlePaste}
              required
              placeholder={t.usernamePlaceholder}
              disabled={isLoading || countdown > 0} // 🔥 倒计时期间禁用输入
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onPaste={handlePaste}
                required
                placeholder={t.passwordPlaceholder}
                disabled={isLoading || countdown > 0} // 🔥 倒计时期间禁用输入
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={countdown > 0} // 🔥 倒计时期间禁用
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  color: countdown > 0 ? '#ccc' : '#666'
                }}
                title={showPassword ? 
                  (language === 'zh_CN' ? '隐藏密码' : 'Hide password') : 
                  (language === 'zh_CN' ? '显示密码' : 'Show password')
                }
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="invite_code">
                {t.inviteCode}
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeff4vP_5quWH0LFnPqidzbxhK21R0Hv8UPzHzWs2ywGCGSkg/viewform?usp=sharing&ouid=101088277057466154055" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="invite-tooltip"
                  title={language === 'zh_CN' ? '没有邀请码？加入等待列表' : 'No invite code? Join the waitlist'}
                >
                  ?
                </a>
              </label>
              <input
                type="text"
                id="invite_code"
                name="invite_code"
                value={formData.invite_code}
                onChange={handleInputChange}
                onPaste={handlePaste}
                required={!isLogin}
                placeholder={t.inviteCodePlaceholder}
                disabled={isLoading || countdown > 0}
              />
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={isLoading || countdown > 0} // 🔥 倒计时期间禁用提交
          >
            {isLoading ? t.processing : (isLogin ? t.loginButton : t.registerButton)}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="login-toggle"
            onClick={toggleMode}
            disabled={isLoading || countdown > 0} // 🔥 倒计时期间禁用切换
          >
            {isLogin ? t.switchToRegister : t.switchToLogin}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;