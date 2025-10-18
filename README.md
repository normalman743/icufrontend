# Intelligent CU (iCU) - 前端项目

Intelligent CU 是一个基于AI的智能学习助手系统，为香港中文大学的学生提供个性化的学习支持。

## 功能特性

### 🔐 用户认证
- 用户注册和登录
- 邀请码系统
- JWT token认证
- 用户偏好设置

### 💬 智能聊天
- 与AI助手进行自然语言对话
- 支持文件上传和附件
- 流式响应显示
- RAG（检索增强生成）支持
- 聊天历史记录管理

### 📚 课程管理
- 课程创建、编辑和删除
- 按学期组织课程
- 文件上传和管理
- 课程资源分类（大纲、教程、讲座、作业、考试等）
- 课程专属聊天功能

### 📁 文件管理
- 支持多种文件格式（PDF、DOC、TXT、图片等）
- 文件上传到课程文件夹
- 文件预览和下载
- 全局文件管理

### ⚙️ 用户设置
- 主题切换（浅色/深色/系统）
- 语言设置（中文/英文）
- 用户信息管理
- 余额和消费记录查看

## 技术栈

- **前端框架**: React 18 + TypeScript
- **路由管理**: React Router v6
- **状态管理**: React Context API
- **样式**: CSS3 + 响应式设计
- **构建工具**: Create React App
- **API通信**: Fetch API

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Chat.tsx        # 聊天组件
│   ├── CourseChat.tsx  # 课程聊天组件
│   ├── Courses.tsx     # 课程组件
│   ├── Layout.tsx      # 布局组件
│   ├── Settings.tsx    # 设置组件
│   └── Sidebar.tsx     # 侧边栏组件
├── pages/              # 页面组件
│   ├── ChatPage.tsx    # 聊天页面
│   ├── CoursesPage.tsx # 课程页面
│   ├── SettingsPage.tsx # 设置页面
│   └── LoginPage.tsx   # 登录页面
├── contexts/           # React Context
│   └── AuthContext.tsx # 认证上下文
├── utils/              # 工具函数
│   └── api.ts          # API服务层
├── types/              # TypeScript类型定义
│   └── index.ts        # 类型定义文件
└── styles/             # 全局样式
    ├── globals.css     # 全局样式
    └── variables.css   # CSS变量
```

## API集成

### 认证API
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/auth/me` - 获取当前用户信息
- `PUT /api/v1/auth/me` - 更新用户信息

### 聊天API
- `GET /api/v1/chats` - 获取聊天列表
- `POST /api/v1/chats` - 创建新聊天
- `GET /api/v1/chats/{chat_id}` - 获取聊天详情
- `POST /api/v1/chats/{chat_id}/messages` - 发送消息
- `GET /api/v1/chats/{chat_id}/messages` - 获取聊天消息
- `DELETE /api/v1/chats/{chat_id}` - 删除聊天

### 课程API
- `GET /api/v1/courses` - 获取课程列表
- `POST /api/v1/courses` - 创建课程
- `PUT /api/v1/courses/{course_id}` - 更新课程
- `DELETE /api/v1/courses/{course_id}` - 删除课程

### 文件API
- `POST /api/v1/files/upload` - 上传文件
- `GET /api/v1/files` - 获取文件列表
- `GET /api/v1/files/{file_id}` - 获取文件详情
- `DELETE /api/v1/files/{file_id}` - 删除文件

### 文件夹API
- `GET /api/v1/folders` - 获取文件夹列表
- `POST /api/v1/folders` - 创建文件夹
- `GET /api/v1/folders/{folder_id}/files` - 获取文件夹中的文件

## 安装和运行

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

项目将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

## 环境变量

创建 `.env` 文件并配置以下变量：

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

## 使用说明

### 1. 用户注册/登录
- 访问应用首页，系统会自动跳转到登录页面
- 新用户需要邀请码进行注册
- 登录后可以访问所有功能

### 2. 开始聊天
- 点击"聊天"页面开始与AI助手对话
- 支持文本输入和文件上传
- 可以查看聊天历史和RAG来源

### 3. 管理课程
- 在"课程"页面创建和管理课程
- 按学期组织课程内容
- 上传课程相关文件到不同分类

### 4. 个性化设置
- 在"设置"页面调整主题和语言
- 查看账户余额和消费记录
- 管理个人信息

## 开发指南

### 添加新的API调用
1. 在 `src/types/index.ts` 中定义相关类型
2. 在 `src/utils/api.ts` 中添加API方法
3. 在组件中使用API方法

### 添加新的页面
1. 在 `src/pages/` 中创建页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/components/Sidebar.tsx` 中添加导航

### 样式开发
- 使用CSS模块或普通CSS
- 遵循响应式设计原则
- 使用CSS变量保持一致性

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者: [您的姓名]
- 邮箱: [您的邮箱]
- 项目链接: [项目GitHub链接]
