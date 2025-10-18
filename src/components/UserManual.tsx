import React, { useState, useEffect } from 'react';
import './UserManual.css';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
  language?: 'zh_CN' | 'en'; // 添加语言参数
}

// 完整的国际化文本
const i18nTexts = {
  'zh_CN': {
    title: '用户手册',
    navItems: {
      userManual: '📖 用户手册',
      contactSupport: '📧 联系支持',
      reportIssue: '🐛 报告问题'
    },
    quickStart: {
      title: '用户手册',
      subtitle1: '1. 快速开始',
      tableHeaders: {
        step: '步骤',
        operation: '操作',
        description: '说明'
      },
      steps: [
        {
          step: '① 打开 iCU',
          operation: '访问 https://icu.cuhk.edu.hk（校园网推荐）',
          description: '浏览器建议：Chrome/Edge/Firefox 最新版'
        },
        {
          step: '② 注册 / 登录',
          operation: '使用 CUHK 统一身份或邀请码注册，新用户需填写 学号、电邮、邀请码',
          description: '登录后系统会自动生成 JWT Token 以保持登录状态'
        },
        {
          step: '③ 创建聊天',
          operation: '点击侧边栏 "新建对话" 按钮',
          description: '问任何学习相关问题。普通聊天暂不支持 RAG，如需 RAG，请在课程管理中进入相应课程并创建"课程聊天"'
        },
        {
          step: '④ 上传文件',
          operation: '在 课程聊天 窗口点击 📎 或拖拽文件，可同时上传多份资料（用于 RAG 检索）',
          description: '支持 PDF、Word、图片、纯文本等'
        },
        {
          step: '⑤ 查看课程',
          operation: '侧边栏选择 "课程管理"',
          description: '可按学期查看/创建课程，上传讲义与作业'
        },
        {
          step: '⑥ 个性化设置',
          operation: '进入 设置 → 偏好设置',
          description: '支持浅/深色主题、语言切换与通知偏好'
        }
      ],
      subtitle2: '2. 功能详解',
      features: {
        smartChat: {
          title: '智能聊天',
          items: [
            '支持实时流式响应。RAG（检索增强生成）仅在 课程聊天 中开启，并在回答下方展示引用来源；普通聊天暂不支持。',
            '输入框 ⌘/Ctrl + Enter 快捷发送。',
            '↑/↓ 可浏览历史提问并再次编辑。'
          ]
        },
        courseManagement: {
          title: '课程管理',
          items: [
            '课程按学年/学期分组，可上传 大纲、讲座、作业 等文件。',
            '每门课程拥有独立「课程专属聊天」，可聚焦授课内容。',
            '删除课程会同步移除其文件与聊天记录，请谨慎操作。'
          ]
        },
        fileCenter: {
          title: '文件中心',
          items: [
            '全局文件浏览器可按上传时间、课程或标签筛选。',
            '图片与 PDF 内嵌预览，其他格式可下载到本地。'
          ]
        },
        billing: {
          title: '余额与计费',
          items: [
            '在 设置 → 账户 可查看当前额度与历史花费。',
            '消费单位：Token，每 1,000 Token 约 0.002 USD（示例）。',
            '支持校园支付或信用卡充值。'
          ]
        }
      },
      subtitle3: '3. 常见问题（FAQ）',
      faq: [
        {
          question: '为什么上传的 PDF 解析失败？',
          answer: '请确认文件小于 40 MB，且未加密。若仍失败，可在「报告问题」里附带文件上传。'
        },
        {
          question: '可以多人共享同一门课程吗？',
          answer: '可，将他人的 CUHK 邮箱添加到课程 → 成员管理，即可共享课程文件与聊天。'
        },
        {
          question: '如何导出聊天记录？',
          answer: '在聊天窗口右上角 … 菜单选择 导出 Markdown/PDF。'
        },
        {
          question: '如何重置密码？',
          answer: '登录页点击 忘记密码，邮件将发送至你的 CUHK 邮箱。'
        }
      ]
    },
    contact: {
      title: '联系支持',
      emailLabel: '邮件：'
    },
    report: {
      title: '报告问题',
      subtitle1: '1. 提交 Bug 的最佳实践',
      bestPractices: [
        '打开设置页 → 报告问题 → 点击 "创建工单"。',
        '填写表单：',
        '点击提交后，你将收到工单编号（#INC-xxxx）。',
        '可在「我的工单」查看处理进度与开发者回复。'
      ],
      formDetails: [
        '标题：一句话概括问题，如「上传 PDF 卡住在 99%」。',
        '描述：详细步骤（重现路径）、期望结果、实际结果。',
        '环境信息：操作系统、浏览器版本 / 移动端型号。',
        '附件：截图 / 屏录 / 出错文件。'
      ],
      subtitle2: '2. 问题分类',
      categories: [
        { type: '功能故障', example: '聊天无法加载、文件无法预览' },
        { type: '性能问题', example: '页面明显卡顿、响应慢' },
        { type: '兼容性问题', example: '在 Safari 14 输入框失焦' },
        { type: '安全问题', example: 'XSS、越权访问' },
        { type: '建议/新功能', example: '添加 Latex 渲染、支持批量导出' }
      ],
      subtitle3: '3. 处理 SLA（服务等级协议）',
      slaHeaders: {
        level: '严重级别',
        description: '描述',
        response: '首次响应',
        target: '目标修复'
      },
      slaData: [
        {
          level: 'P0 紧急',
          description: '影响全部用户核心功能（无法登录/聊天）',
          response: '2 小时',
          target: '24 小时内临时修复'
        },
        {
          level: 'P1 高',
          description: '影响部分用户或重要功能',
          response: '4 小时',
          target: '3 个工作日'
        },
        {
          level: 'P2 中',
          description: '一般错误或 UI 问题',
          response: '1 个工作日',
          target: '下次迭代'
        },
        {
          level: 'P3 低',
          description: '文案/样式问题，或功能建议',
          response: '2 个工作日',
          target: '计划排期'
        }
      ],
      updateHistory: '更新记录',
      updateHeaders: {
        version: '版本',
        date: '日期',
        description: '说明'
      },
      updateData: [
        {
          version: 'v1.0',
          date: '2025‑07‑05',
          description: '首版创建，涵盖用户手册、支持与问题报告'
        }
      ]
    }
  },
  'en': {
    title: 'User Manual',
    navItems: {
      userManual: '📖 User Manual',
      contactSupport: '📧 Contact Support',
      reportIssue: '🐛 Report Issue'
    },
    quickStart: {
      title: 'User Manual',
      subtitle1: '1. Quick Start',
      tableHeaders: {
        step: 'Step',
        operation: 'Operation',
        description: 'Description'
      },
      steps: [
        {
          step: '① Open iCU',
          operation: 'Visit https://icu.cuhk.edu.hk (Campus network recommended)',
          description: 'Recommended browsers: Latest Chrome/Edge/Firefox'
        },
        {
          step: '② Register / Login',
          operation: 'Use CUHK unified identity or invitation code to register. New users need to fill in student ID, email, invitation code',
          description: 'After login, the system will automatically generate JWT Token to maintain login status'
        },
        {
          step: '③ Create Chat',
          operation: 'Click "New Conversation" button in sidebar',
          description: 'Ask any learning-related questions. Regular chat does not support RAG. For RAG, please enter the corresponding course in course management and create "Course Chat"'
        },
        {
          step: '④ Upload Files',
          operation: 'Click 📎 in Course Chat window or drag files, can upload multiple materials simultaneously (for RAG retrieval)',
          description: 'Supports PDF, Word, images, plain text, etc.'
        },
        {
          step: '⑤ View Courses',
          operation: 'Select "Course Management" in sidebar',
          description: 'View/create courses by semester, upload lecture notes and assignments'
        },
        {
          step: '⑥ Personalization',
          operation: 'Go to Settings → Preferences',
          description: 'Supports light/dark theme, language switching and notification preferences'
        }
      ],
      subtitle2: '2. Feature Details',
      features: {
        smartChat: {
          title: 'Smart Chat',
          items: [
            'Supports real-time streaming responses. RAG (Retrieval Augmented Generation) is only enabled in Course Chat and shows reference sources below answers; regular chat does not support it.',
            'Input box ⌘/Ctrl + Enter for quick send.',
            '↑/↓ to browse history questions and edit again.'
          ]
        },
        courseManagement: {
          title: 'Course Management',
          items: [
            'Courses are grouped by academic year/semester, can upload syllabus, lectures, assignments and other files.',
            'Each course has independent "Course-specific Chat" to focus on course content.',
            'Deleting a course will simultaneously remove its files and chat records, please operate with caution.'
          ]
        },
        fileCenter: {
          title: 'File Center',
          items: [
            'Global file browser can filter by upload time, course or tags.',
            'Images and PDFs have embedded preview, other formats can be downloaded locally.'
          ]
        },
        billing: {
          title: 'Balance & Billing',
          items: [
            'View current quota and historical spending in Settings → Account.',
            'Consumption unit: Token, approximately 0.002 USD per 1,000 Tokens (example).',
            'Supports campus payment or credit card top-up.'
          ]
        }
      },
      subtitle3: '3. Frequently Asked Questions (FAQ)',
      faq: [
        {
          question: 'Why did PDF upload parsing fail?',
          answer: 'Please confirm the file is smaller than 40 MB and not encrypted. If it still fails, you can attach the file upload in "Report Issue".'
        },
        {
          question: 'Can multiple people share the same course?',
          answer: 'Yes, add others\' CUHK email to Course → Member Management to share course files and chats.'
        },
        {
          question: 'How to export chat records?',
          answer: 'Select Export Markdown/PDF in the ... menu at the top right of the chat window.'
        },
        {
          question: 'How to reset password?',
          answer: 'Click "Forgot Password" on the login page, and an email will be sent to your CUHK mailbox.'
        }
      ]
    },
    contact: {
      title: 'Contact Support',
      emailLabel: 'Email:'
    },
    report: {
      title: 'Report Issue',
      subtitle1: '1. Best Practices for Bug Submission',
      bestPractices: [
        'Open Settings → Report Issue → Click "Create Ticket".',
        'Fill out the form:',
        'After submission, you will receive a ticket number (#INC-xxxx).',
        'You can check processing progress and developer replies in "My Tickets".'
      ],
      formDetails: [
        'Title: Summarize the issue in one sentence, e.g., "PDF upload stuck at 99%".',
        'Description: Detailed steps (reproduction path), expected results, actual results.',
        'Environment Info: Operating system, browser version / mobile device model.',
        'Attachments: Screenshots / screen recordings / error files.'
      ],
      subtitle2: '2. Issue Categories',
      categories: [
        { type: 'Functional Failure', example: 'Chat cannot load, file cannot preview' },
        { type: 'Performance Issues', example: 'Page obviously lagging, slow response' },
        { type: 'Compatibility Issues', example: 'Input box loses focus in Safari 14' },
        { type: 'Security Issues', example: 'XSS, unauthorized access' },
        { type: 'Suggestions/New Features', example: 'Add Latex rendering, support batch export' }
      ],
      subtitle3: '3. Processing SLA (Service Level Agreement)',
      slaHeaders: {
        level: 'Severity Level',
        description: 'Description',
        response: 'First Response',
        target: 'Target Fix'
      },
      slaData: [
        {
          level: 'P0 Critical',
          description: 'Affects all users\' core functions (cannot login/chat)',
          response: '2 hours',
          target: 'Temporary fix within 24 hours'
        },
        {
          level: 'P1 High',
          description: 'Affects some users or important functions',
          response: '4 hours',
          target: '3 business days'
        },
        {
          level: 'P2 Medium',
          description: 'General errors or UI issues',
          response: '1 business day',
          target: 'Next iteration'
        },
        {
          level: 'P3 Low',
          description: 'Copy/style issues, or feature suggestions',
          response: '2 business days',
          target: 'Planned scheduling'
        }
      ],
      updateHistory: 'Update History',
      updateHeaders: {
        version: 'Version',
        date: 'Date',
        description: 'Description'
      },
      updateData: [
        {
          version: 'v1.0',
          date: '2025‑07‑05',
          description: 'First version created, covering user manual, support and issue reporting'
        }
      ]
    }
  }
};

const UserManual: React.FC<UserManualProps> = ({ 
  isOpen, 
  onClose, 
  initialSection = 'quick-start',
  language = 'zh_CN' // 默认语言
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);

  // 当弹窗打开时，根据initialSection设置激活的章节
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  // 获取当前语言的文本
  const t = i18nTexts[language] || i18nTexts['zh_CN'];

  return (
    <div className="user-manual-overlay" onClick={onClose}>
      <div className="user-manual-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-manual-header">
          <h2>{t.title}</h2>
          <button className="user-manual-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="user-manual-content">
          <div className="user-manual-sidebar">
            <nav className="user-manual-nav">
              <button 
                className={`user-manual-nav-item ${activeSection === 'quick-start' ? 'active' : ''}`}
                onClick={() => setActiveSection('quick-start')}
              >
                {t.navItems.userManual}
              </button>
              <button 
                className={`user-manual-nav-item ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveSection('contact')}
              >
                {t.navItems.contactSupport}
              </button>
              <button 
                className={`user-manual-nav-item ${activeSection === 'report' ? 'active' : ''}`}
                onClick={() => setActiveSection('report')}
              >
                {t.navItems.reportIssue}
              </button>
            </nav>
          </div>
          
          <div className="user-manual-main">
            {activeSection === 'quick-start' && (
              <div className="user-manual-section">
                <h3>{t.quickStart.title}</h3>
                
                <h4>{t.quickStart.subtitle1}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t.quickStart.tableHeaders.step}</th>
                        <th>{t.quickStart.tableHeaders.operation}</th>
                        <th>{t.quickStart.tableHeaders.description}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.quickStart.steps.map((step, index) => (
                        <tr key={index}>
                          <td>{step.step}</td>
                          <td>{step.operation}</td>
                          <td>{step.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4>{t.quickStart.subtitle2}</h4>
                <div className="user-manual-feature">
                  <h5>{t.quickStart.features.smartChat.title}</h5>
                  <ul>
                    {t.quickStart.features.smartChat.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="user-manual-feature">
                  <h5>{t.quickStart.features.courseManagement.title}</h5>
                  <ul>
                    {t.quickStart.features.courseManagement.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="user-manual-feature">
                  <h5>{t.quickStart.features.fileCenter.title}</h5>
                  <ul>
                    {t.quickStart.features.fileCenter.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="user-manual-feature">
                  <h5>{t.quickStart.features.billing.title}</h5>
                  <ul>
                    {t.quickStart.features.billing.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <h4>{t.quickStart.subtitle3}</h4>
                <div className="user-manual-faq">
                  {t.quickStart.faq.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h6>{faq.question}</h6>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="user-manual-section">
                <h3>{t.contact.title}</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-label">{t.contact.emailLabel}</span>
                    <a href="mailto:cuhk.fyp.llm@outlook.com" className="contact-link">
                      cuhk.fyp.llm@outlook.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'report' && (
              <div className="user-manual-section">
                <h3>{t.report.title}</h3>
                
                <h4>{t.report.subtitle1}</h4>
                <ol>
                  {t.report.bestPractices.map((practice, index) => (
                    <li key={index}>
                      {practice}
                      {index === 1 && (
                        <ul>
                          {t.report.formDetails.map((detail, detailIndex) => (
                            <li key={detailIndex}>
                              <strong>{detail.split('：')[0]}：</strong>
                              {detail.split('：')[1]}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>

                <h4>{t.report.subtitle2}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{language === 'zh_CN' ? '分类' : 'Category'}</th>
                        <th>{language === 'zh_CN' ? '示例' : 'Example'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.report.categories.map((category, index) => (
                        <tr key={index}>
                          <td>{category.type}</td>
                          <td>{category.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4>{t.report.subtitle3}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t.report.slaHeaders.level}</th>
                        <th>{t.report.slaHeaders.description}</th>
                        <th>{t.report.slaHeaders.response}</th>
                        <th>{t.report.slaHeaders.target}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.report.slaData.map((sla, index) => (
                        <tr key={index}>
                          <td>{sla.level}</td>
                          <td>{sla.description}</td>
                          <td>{sla.response}</td>
                          <td>{sla.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4>{t.report.updateHistory}</h4>
                <div className="user-manual-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{t.report.updateHeaders.version}</th>
                        <th>{t.report.updateHeaders.date}</th>
                        <th>{t.report.updateHeaders.description}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.report.updateData.map((update, index) => (
                        <tr key={index}>
                          <td>{update.version}</td>
                          <td>{update.date}</td>
                          <td>{update.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;