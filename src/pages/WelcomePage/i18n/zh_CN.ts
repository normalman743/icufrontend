/**
 * 中文翻译文件
 * Chinese (Simplified) translations
 */

export default {
  // 导航项
  nav: {
    home: '首页',
    whyIcu: '为什么选ICU',
    knowledgeSources: '知识库',
    workflow: 'demo演示',
    smartAssistant: '未来规划',
    aboutUs: '关于我们',
  },

  // 主页 Hero Section
  hero: {
    title: 'ICU',
    subtitle: 'Intelligence CU | The AI for U',
    description: '专门化的AI助手，为您提供个性化的学习体验',
    cta: '开始体验',
    ctaSecondary: '了解更多',
    welcome: '欢迎回来',
    userWelcome: '欢迎来到ICU',
  },

  // Why ICU 板块
  whyIcu: {
    title: '为什么选择 ICU？',
    subtitle: 'Star 基于其他大语言模型 但是更懂 CUHK',
    description: '我们不是要比其他 AI 更强大，而是更懂 CUHK',
    statsLabel: '我们的成果',
    stats: {
      courses: '40+',
      discussions: '600+',
      students: '25+',
    },
    // AI 选择
    selectAI: '选择你常用的 AI 助手',
    moreModels: '更多模型...',
    // 分类导航
    categories: {
      academic: '学术问题',
      life: '生活求助',
    },
    // 子分类
    subCategories: {
      courseDifficulty: '课程难度',
      professorReview: '教授测评',
      campusFacility: '校园设施',
      studyStruggle: '学习困惑',
    },
    // 更多模型弹窗
    moreModelsModal: {
      title: '想看更多 AI 模型？',
      description: 'Star 是基于强大的大语言模型，并结合 CUHK 专属知识库打造的智能助手。如果使用我们服务的同学越来越多，我们会考虑支持更多底层模型。',
      suggestion: '你希望我们支持哪个 AI 模型？发邮件告诉我们：',
      email: 'support@icu.584743.xyz',
      close: '关闭',
    },
    // 答案折叠
    answerCollapse: {
      expand: '展开查看完整回答 ▼',
      collapse: '收起 ▲',
    },
  },

  // 三重知识来源板块
  threeSources: {
    title: '知识库',
    description: 'CUHK专属 + 互联网 + 你的私人库，三源合一的智能助手',
    placeholder: '三重知识来源内容区域',
    sources: [
      {
        icon: '🏛️',
        title: 'CUHK专属',
        subtitle: 'ICU独有优势',
        description: '整合CUHK本地化资源，这是其他AI无法提供的',
        features: ['校园树洞实时讨论', '课程真实评价', 'CUHK求生指南', '学长学姐经验分享']
      },
      {
        icon: '🌐',
        title: '互联网知识',
        subtitle: '实时更新',
        description: '实时搜索互联网最新信息，确保答案时效性',
        features: ['实时搜索引擎', '最新资讯获取', '多源信息整合', '准确性验证']
      },
      {
        icon: '📚',
        title: '你的私人知识库',
        subtitle: '个性化定制',
        description: '按学期→课程→文件夹层级管理你的学习资料',
        features: ['Semester分学期管理', 'Course课程分类', 'Lecture/Tutorial/Lab', 'Assignment/Exam资料']
      }
    ],
    tempUpload: {
      icon: '📎',
      title: '临时文件上传',
      description: '支持 PDF | DOCX | 代码文件 | 图片',
      features: ['即时上传分析', '多格式支持', '智能内容识别']
    }
  },

  // 未来规划板块
  smartAssistant: {
    title: '未来规划',
    description: '我们正在开发更多功能，让 ICU 变得更强大',
    placeholder: '未来规划内容区域',
    models: [
      {
        icon: '🤖',
        title: '多模型支持',
        subtitle: '更多选择',
        description: '支持更多大家习惯使用的AI模型和提供商',
        features: ['Google Gemini', 'xAI Grok', 'DeepSeek', 'Anthropic Claude', 'OpenAI GPT', 'Alibaba Qwen', '更多模型持续增加...']
      },
      {
        icon: '🎯',
        title: '智能校园助手',
        subtitle: 'CUHK专属',
        description: '为CUHK学生量身打造的智能功能',
        features: ['🗓️ 智能排课助手', '🧭 校园导航系统', '🍽️ 饭堂推荐', '📍 活动推荐', '🏃 健身房预约提醒']
      },
      {
        icon: '⏰',
        title: '智能提醒系统',
        subtitle: '不再错过',
        description: '全方位的学习和生活提醒服务',
        features: ['📝 作业DDL提醒', '📚 考试复习计划', '🤝 Meeting日程管理', '📖 课程提醒', '🔔 自定义提醒']
      }
    ],
    comingSoon: {
      title: '💡 只要你敢想，我们就敢做',
      features: [
        '🎓 学业规划助手',
        '� 学习小组匹配',
        '📊 成绩趋势分析',
        '🗣️ 语音对话功能',
        '� 移动端App',
        '🌏 更多语言支持',
        '✨ 你的创意想法...'
      ]
    }
  },

  // 工作原理板块
  how: {
    title: 'ICU 工作demo',
    description: '演示ICU如何整合三重知识来源、理解用户意图并生成个性化、可验证的答案。',
    placeholder: '工作原理演示：实时检索 → 知识融合 → 上下文理解 → 智能回复'
  },

  // 加入我们板块
  join: {
    title: '支持我们 / 加入我们',
    description: '帮助ICU变得更好，一起服务CUHK学生',
    placeholder: '支持我们内容区域',
    funding: {
      title: '资金支持',
      description: 'ICU 的运营需要服务器、AI API 等成本支持。您的每一份支持都将用于改进产品、提升服务质量，让更多 CUHK 学生受益。',
      cta: '💰 支持我们'
    },
    joinUs: {
      title: '加入我们',
      description: '无论你是技术大牛还是创意达人，我们都欢迎你的加入！让我们一起打造最懂 CUHK 的 AI 助手。',
      roles: ['前端开发', '后端工程师', 'AI/ML工程师', '产品设计', 'UI/UX设计师', '内容运营', '数据标注', '市场推广'],
      cta: '🤝 加入团队'
    },
    stats: {
      users: '已帮助 25+ 位 CUHK 学生',
      questions: '累计回答 600+ 个问题',
      satisfaction: '覆盖 40+ 门课程'
    }
  },

  // Footer 组件翻译
  footer: {
    text: 'CUHK智能学习助手ICU © 2025',
    privacyPolicy: '隐私政策',
    termsOfService: '使用条款',
    aboutUs: '关于我们',
    copyright: '版权所有',
    close: '×',
    privacy: {
      title: '隐私政策',
      section1: { 
        title: '1. 信息收集', 
        content: '我们收集您主动提供的信息，包括但不限于用户名、邮箱等注册信息。' 
      },
      section2: { 
        title: '2. 信息使用', 
        content: '我们使用收集的信息来提供、维护和改进我们的服务。' 
      },
      section3: { 
        title: '3. 信息保护', 
        content: '我们采用行业标准的安全措施来保护您的个人信息。' 
      },
      section4: { 
        title: '4. Cookie使用', 
        content: '我们使用Cookie来改善用户体验和分析网站使用情况。' 
      },
      section5: { 
        title: '5. 第三方服务', 
        content: '我们可能使用第三方服务提供商来协助运营我们的服务。' 
      },
      section6: { 
        title: '6. 信息披露', 
        content: '除法律要求外，我们不会向第三方披露您的个人信息。' 
      }
    },
    terms: {
      title: '使用条款',
      section1: { 
        title: '1. 服务使用', 
        content: '您同意按照本条款和所有适用的法律法规使用我们的服务。' 
      },
      section2: { 
        title: '2. 用户责任', 
        content: '您对通过本服务发布的内容负全部责任。' 
      },
      section3: { 
        title: '3. 禁止行为', 
        content: '禁止发布违法、有害、威胁、辱骂、骚扰或侵犯他人权利的内容。' 
      },
      section4: { 
        title: '4. 知识产权', 
        content: '本服务的所有内容和功能均受知识产权法保护。' 
      },
      section5: { 
        title: '5. 服务变更', 
        content: '我们保留随时修改或终止服务的权利。' 
      },
      section6: { 
        title: '6. 免责声明', 
        content: '本服务按"现状"提供，不提供任何明示或暗示的保证。' 
      }
    }
  },

  // Navbar 组件翻译
  navbar: {
    language: {
      chinese: '中',
      english: 'En'
    }
  }
};
