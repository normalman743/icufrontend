/**
 * Workflow Examples Data
 * 工作流程演示数据 - 9个预定义的交互式例子
 */

// ============================================================================
// 类型定义
// ============================================================================

export type ModelType = 'star' | 'star-plus' | 'star-code';
export type QuestionSourceType = 'search' | 'course' | 'cuhk';
export type FileType = 'pdf' | 'docx' | 'png' | 'jpg' | 'py' | 'cpp' | 'c' | 'ipynb';
export type SearchSourceType = 'internet' | 'personal-library' | 'cuhk-knowledge';

/**
 * 模型信息
 */
export interface ModelInfo {
  id: ModelType;
  name: string;
  nameEn: string;
  icon: string; // 可以是emoji或图片路径
  iconType?: 'emoji' | 'image'; // 图标类型
  description: {
    zh_CN: string;
    en: string;
  };
  features: {
    zh_CN: string[];
    en: string[];
  };
  color: string;
}

/**
 * 附件信息
 */
export interface AttachedFile {
  name: string;
  size: string;
  type: FileType;
  icon: string;
}

/**
 * 用户消息
 */
export interface UserMessage {
  text: {
    zh_CN: string;
    en: string;
  };
  timestamp: string;
  attachedFile?: AttachedFile;
}

/**
 * 问题类型标记
 */
export interface QuestionTypeTag {
  type: QuestionSourceType;
  label: {
    zh_CN: string;
    en: string;
  };
  icon: string;
  color: string;
}

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  type: 'website' | 'pdf' | 'docx' | 'discussion' | 'code';
  name: string;
  preview: {
    zh_CN: string;
    en: string;
  };
  icon?: string;
}

/**
 * 搜索步骤
 */
export interface SearchStep {
  source: SearchSourceType;
  sourceName: {
    zh_CN: string;
    en: string;
  };
  icon: string;
  delay: number; // 延迟秒数
  status: 'searching' | 'found' | 'not-found';
  foundItems: SearchResultItem[];
}

/**
 * AI回复
 */
export interface AIResponse {
  text: {
    zh_CN: string;
    en: string;
  };
  timestamp: string;
  sourcesUsed: {
    zh_CN: string[];
    en: string[];
  };
}

/**
 * 完整的工作流例子
 */
export interface WorkflowExample {
  id: string;
  modelId: ModelType;
  userMessage: UserMessage;
  questionType: QuestionTypeTag;
  searchingSteps: SearchStep[];
  aiResponse: AIResponse;
}

// ============================================================================
// 模型数据
// ============================================================================

export const WORKFLOW_MODELS: ModelInfo[] = [
  {
    id: 'star',
    name: 'Star',
    nameEn: 'Star',
    icon: '/Star.png',
    iconType: 'image',
    description: {
      zh_CN: '适合日常问答，快速响应一般问题',
      en: 'Suitable for daily Q&A, quick response to general questions'
    },
    features: {
      zh_CN: ['快速响应', '日常问答', '基础任务', '高性价比'],
      en: ['Fast Response', 'Daily Q&A', 'Basic Tasks', 'Cost-Effective']
    },
    color: '#fbbf24'
  },
  {
    id: 'star-plus',
    name: 'Star Plus',
    nameEn: 'Star Plus',
    icon: '/StarPlus.png',
    iconType: 'image',
    description: {
      zh_CN: '处理复杂问题，深度分析和推理能力强',
      en: 'Handle complex problems with strong analytical and reasoning abilities'
    },
    features: {
      zh_CN: ['深度分析', '复杂推理', '多维对比', '综合判断'],
      en: ['Deep Analysis', 'Complex Reasoning', 'Multi-Comparison', 'Comprehensive Judgment']
    },
    color: '#a78bfa'
  },
  {
    id: 'star-code',
    name: 'Star Code',
    nameEn: 'Star Code',
    icon: '/StarCode.png',
    iconType: 'image',
    description: {
      zh_CN: '专业的编程助手，代码生成和调试专家',
      en: 'Professional coding assistant, expert in code generation and debugging'
    },
    features: {
      zh_CN: ['代码生成', '错误调试', '算法优化', '多语言支持'],
      en: ['Code Generation', 'Bug Debugging', 'Algorithm Optimization', 'Multi-Language Support']
    },
    color: '#10b981'
  }
];

// ============================================================================
// 9个工作流例子
// ============================================================================

export const WORKFLOW_EXAMPLES: WorkflowExample[] = [
  // ========== Star 模型 (3个例子) ==========
  {
    id: 'star-search',
    modelId: 'star',
    userMessage: {
      text: {
        zh_CN: '香港最近天气怎么样？',
        en: 'How is the weather in Hong Kong recently?'
      },
      timestamp: '14:23'
    },
    questionType: {
      type: 'search',
      label: {
        zh_CN: '互联网搜索',
        en: 'Internet Search'
      },
      icon: '🔍',
      color: '#3b82f6'
    },
    searchingSteps: [
      {
        source: 'internet',
        sourceName: {
          zh_CN: '互联网搜索',
          en: 'Internet Search'
        },
        icon: '🌐',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'website',
            name: 'HKO - 香港天文台',
            preview: {
              zh_CN: '本周天气：多云，气温22-28°C，湿度70-85%',
              en: 'Weekly weather: Cloudy, 22-28°C, humidity 70-85%'
            }
          },
          {
            type: 'website',
            name: 'Weather.com',
            preview: {
              zh_CN: '未来三天有阵雨可能，建议携带雨具',
              en: 'Possible showers in the next 3 days, bring an umbrella'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '根据香港天文台最新数据，本周香港天气以多云为主，气温在22-28°C之间，湿度较高（70-85%）。未来三天有阵雨可能，建议出门携带雨具。早晚温差较大，注意适时增减衣物。',
        en: 'According to the latest HKO data, this week Hong Kong will be mostly cloudy with temperatures between 22-28°C and high humidity (70-85%). Showers are possible in the next 3 days, so bring an umbrella. Temperature difference between morning and evening is significant.'
      },
      timestamp: '14:24',
      sourcesUsed: {
        zh_CN: ['香港天文台', 'Weather.com'],
        en: ['HKO', 'Weather.com']
      }
    }
  },
  {
    id: 'star-course',
    modelId: 'star',
    userMessage: {
      text: {
        zh_CN: 'CSCI3100这门课难不难？',
        en: 'Is CSCI3100 difficult?'
      },
      timestamp: '15:10',
      attachedFile: {
        name: 'syllabus.pdf',
        size: '1.2 MB',
        type: 'pdf',
        icon: '📄'
      }
    },
    questionType: {
      type: 'course',
      label: {
        zh_CN: '课程相关',
        en: 'Course Related'
      },
      icon: '📚',
      color: '#8b5cf6'
    },
    searchingSteps: [
      {
        source: 'cuhk-knowledge',
        sourceName: {
          zh_CN: 'CUHK知识库',
          en: 'CUHK Knowledge Base'
        },
        icon: '🏛️',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'discussion',
            name: '树洞讨论 #2847',
            preview: {
              zh_CN: 'CSCI3100 workload适中，project很有趣，推荐！',
              en: 'CSCI3100 moderate workload, interesting project, recommended!'
            },
            icon: '💬'
          },
          {
            type: 'docx',
            name: '选课.docx',
            preview: {
              zh_CN: 'CSCI3100 软件工程 推荐指数 ⭐⭐⭐⭐',
              en: 'CSCI3100 Software Engineering Rating ⭐⭐⭐⭐'
            }
          }
        ]
      },
      {
        source: 'personal-library',
        sourceName: {
          zh_CN: '个人知识库',
          en: 'Personal Library'
        },
        icon: '📚',
        delay: 2,
        status: 'found',
        foundItems: [
          {
            type: 'pdf',
            name: '2024Fall/CSCI3100/syllabus.pdf',
            preview: {
              zh_CN: '课程包含：软件开发、团队协作、敏捷开发...',
              en: 'Course includes: Software development, teamwork, agile...'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '根据CUHK学生反馈和你上传的课程大纲，CSCI3100（软件工程）难度适中。主要挑战在于小组项目需要团队协作，但课程内容实用且有趣。建议提前了解Git和敏捷开发方法。整体推荐指数⭐⭐⭐⭐。',
        en: 'Based on CUHK student feedback and your syllabus, CSCI3100 (Software Engineering) has moderate difficulty. The main challenge is team collaboration in group projects, but the content is practical and interesting. Recommend learning Git and Agile development in advance. Overall rating ⭐⭐⭐⭐.'
      },
      timestamp: '15:11',
      sourcesUsed: {
        zh_CN: ['CUHK知识库', '个人知识库'],
        en: ['CUHK Knowledge Base', 'Personal Library']
      }
    }
  },
  {
    id: 'star-cuhk',
    modelId: 'star',
    userMessage: {
      text: {
        zh_CN: 'NA体育馆在哪里？开放时间是什么？',
        en: 'Where is the NA Sports Complex? What are the opening hours?'
      },
      timestamp: '16:35'
    },
    questionType: {
      type: 'cuhk',
      label: {
        zh_CN: 'CUHK知识',
        en: 'CUHK Knowledge'
      },
      icon: '🏛️',
      color: '#f59e0b'
    },
    searchingSteps: [
      {
        source: 'cuhk-knowledge',
        sourceName: {
          zh_CN: 'CUHK知识库',
          en: 'CUHK Knowledge Base'
        },
        icon: '🏛️',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'docx',
            name: '校内设施开放时间.docx',
            preview: {
              zh_CN: 'NA体育馆：周一至周日 07:00-23:00',
              en: 'NA Sports Complex: Mon-Sun 07:00-23:00'
            }
          },
          {
            type: 'docx',
            name: 'CU生存指南.docx',
            preview: {
              zh_CN: 'NA体育馆位置：新亚书院，近新亚圆形广场',
              en: 'NA Sports Complex Location: Near New Asia College Circle'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: 'NA体育馆位于新亚书院，靠近新亚圆形广场。开放时间为每天 07:00-23:00。馆内设施包括篮球场、羽毛球场、健身房等。建议避开高峰时段（18:00-21:00）前往，人会比较少。',
        en: 'NA Sports Complex is located at New Asia College, near the New Asia Circle. Opening hours: 07:00-23:00 daily. Facilities include basketball courts, badminton courts, gym, etc. Recommend avoiding peak hours (18:00-21:00) for a less crowded experience.'
      },
      timestamp: '16:36',
      sourcesUsed: {
        zh_CN: ['校内设施开放时间', 'CU生存指南'],
        en: ['Campus Facilities Schedule', 'CU Survival Guide']
      }
    }
  },

  // ========== Star Plus 模型 (3个例子) ==========
  {
    id: 'star-plus-search',
    modelId: 'star-plus',
    userMessage: {
      text: {
        zh_CN: '深度学习领域最近有什么重大突破？',
        en: 'What are the recent major breakthroughs in deep learning?'
      },
      timestamp: '10:20'
    },
    questionType: {
      type: 'search',
      label: {
        zh_CN: '互联网搜索',
        en: 'Internet Search'
      },
      icon: '🔍',
      color: '#3b82f6'
    },
    searchingSteps: [
      {
        source: 'internet',
        sourceName: {
          zh_CN: '互联网搜索',
          en: 'Internet Search'
        },
        icon: '🌐',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'website',
            name: 'arXiv.org - Recent Papers',
            preview: {
              zh_CN: 'Transformer架构优化、多模态大模型进展...',
              en: 'Transformer optimization, multimodal LLM advances...'
            }
          },
          {
            type: 'website',
            name: 'Nature - AI Research',
            preview: {
              zh_CN: 'AI在蛋白质折叠预测领域取得重大突破',
              en: 'AI achieves breakthrough in protein folding prediction'
            }
          },
          {
            type: 'website',
            name: 'OpenAI Blog',
            preview: {
              zh_CN: 'GPT-5架构改进，推理能力显著提升',
              en: 'GPT-5 architecture improvements, reasoning enhanced'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '近期深度学习领域有多项重大突破：\n\n1. **多模态大模型**：GPT-5等新一代模型在文本、图像、音频的理解和生成能力上有显著提升\n\n2. **蛋白质折叠预测**：AlphaFold 3在蛋白质结构预测准确率上达到新高度\n\n3. **Transformer优化**：更高效的注意力机制降低了计算成本\n\n4. **推理能力**：新架构大幅提升了AI的逻辑推理和规划能力\n\n这些突破正在推动AI向更通用、更智能的方向发展。',
        en: 'Recent major breakthroughs in deep learning:\n\n1. **Multimodal LLMs**: GPT-5 and next-gen models show significant improvements in understanding and generating text, images, and audio\n\n2. **Protein Folding**: AlphaFold 3 achieves new heights in prediction accuracy\n\n3. **Transformer Optimization**: More efficient attention mechanisms reduce computational costs\n\n4. **Reasoning Abilities**: New architectures dramatically improve logical reasoning and planning\n\nThese breakthroughs are driving AI toward more general and intelligent systems.'
      },
      timestamp: '10:22',
      sourcesUsed: {
        zh_CN: ['arXiv论文库', 'Nature AI研究', 'OpenAI博客'],
        en: ['arXiv Papers', 'Nature AI Research', 'OpenAI Blog']
      }
    }
  },
  {
    id: 'star-plus-course',
    modelId: 'star-plus',
    userMessage: {
      text: {
        zh_CN: '比较一下CSCI3100和CSCI3160，应该选哪个？',
        en: 'Compare CSCI3100 and CSCI3160, which should I choose?'
      },
      timestamp: '13:45',
      attachedFile: {
        name: 'my_transcript.pdf',
        size: '856 KB',
        type: 'pdf',
        icon: '📄'
      }
    },
    questionType: {
      type: 'course',
      label: {
        zh_CN: '课程相关',
        en: 'Course Related'
      },
      icon: '📚',
      color: '#8b5cf6'
    },
    searchingSteps: [
      {
        source: 'cuhk-knowledge',
        sourceName: {
          zh_CN: 'CUHK知识库',
          en: 'CUHK Knowledge Base'
        },
        icon: '🏛️',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'docx',
            name: '选课.docx',
            preview: {
              zh_CN: 'CSCI3100: 软件工程，偏实践；CSCI3160: 算法设计，偏理论',
              en: 'CSCI3100: Software Engineering (practical); CSCI3160: Algorithm Design (theoretical)'
            }
          },
          {
            type: 'discussion',
            name: '树洞 #3521',
            preview: {
              zh_CN: '3100项目多，3160数学要求高，看个人兴趣',
              en: '3100 has more projects, 3160 requires strong math, depends on interest'
            },
            icon: '💬'
          }
        ]
      },
      {
        source: 'personal-library',
        sourceName: {
          zh_CN: '个人知识库',
          en: 'Personal Library'
        },
        icon: '📚',
        delay: 2,
        status: 'found',
        foundItems: [
          {
            type: 'pdf',
            name: '2024Fall/Transcript.pdf',
            preview: {
              zh_CN: 'MATH2010: A, CSCI2100: A-，数学基础扎实',
              en: 'MATH2010: A, CSCI2100: A-, strong math foundation'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '根据你的成绩单和课程特点，给你详细分析：\n\n**CSCI3100 软件工程**\n• 侧重：团队项目、软件开发实践\n• 工作量：中等，小组项目占比大\n• 适合：想提升实战能力的同学\n\n**CSCI3160 算法设计**\n• 侧重：算法分析、理论证明\n• 工作量：较大，数学要求高\n• 适合：数学基础好、追求深度的同学\n\n**建议**：看你的MATH2010和CSCI2100成绩都很优秀，数学基础扎实，**推荐选CSCI3160**。这门课能让你在算法理论上有更深入的理解，对未来深造和技术面试都很有帮助。如果更看重实践经验，可以选3100。',
        en: 'Based on your transcript and course characteristics:\n\n**CSCI3100 Software Engineering**\n• Focus: Team projects, software development practice\n• Workload: Moderate, heavy on group projects\n• Good for: Students wanting practical skills\n\n**CSCI3160 Algorithm Design**\n• Focus: Algorithm analysis, theoretical proofs\n• Workload: Heavy, high math requirements\n• Good for: Strong math background, seeking depth\n\n**Recommendation**: Given your excellent grades in MATH2010 and CSCI2100, you have a solid math foundation. **Recommend CSCI3160**. This course will deepen your understanding of algorithm theory, beneficial for graduate studies and technical interviews. Choose 3100 if you prefer hands-on experience.'
      },
      timestamp: '13:47',
      sourcesUsed: {
        zh_CN: ['选课指南', '树洞讨论', '个人成绩单'],
        en: ['Course Guide', 'Campus Discussion', 'Personal Transcript']
      }
    }
  },
  {
    id: 'star-plus-cuhk',
    modelId: 'star-plus',
    userMessage: {
      text: {
        zh_CN: '如何规划计算机专业的选课路径？',
        en: 'How to plan the course path for Computer Science major?'
      },
      timestamp: '11:15'
    },
    questionType: {
      type: 'cuhk',
      label: {
        zh_CN: 'CUHK知识',
        en: 'CUHK Knowledge'
      },
      icon: '🏛️',
      color: '#f59e0b'
    },
    searchingSteps: [
      {
        source: 'cuhk-knowledge',
        sourceName: {
          zh_CN: 'CUHK知识库',
          en: 'CUHK Knowledge Base'
        },
        icon: '🏛️',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'docx',
            name: '选课.docx',
            preview: {
              zh_CN: '计算机专业必修课程树、推荐选修路径...',
              en: 'CS major required courses tree, recommended elective paths...'
            }
          },
          {
            type: 'docx',
            name: 'TripleU.pdf',
            preview: {
              zh_CN: 'Year 1-4选课建议，课程难度分析...',
              en: 'Year 1-4 course recommendations, difficulty analysis...'
            }
          },
          {
            type: 'discussion',
            name: '学长学姐经验分享',
            preview: {
              zh_CN: '打好基础很重要，CSCI2100/2040/3130是核心',
              en: 'Foundation is key, CSCI2100/2040/3130 are core courses'
            },
            icon: '💬'
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '为你规划CUHK计算机专业选课路径：\n\n**Year 1（打基础）**\n• CSCI1130/1030: 编程入门\n• MATH1010/2010: 数学基础\n• ENGG1110: 工程学导论\n\n**Year 2（核心课程）**\n• CSCI2100: 数据结构\n• CSCI2040: Python与数据科学\n• CSCI2110: 计算机架构\n• CSCI3130: 形式语言与自动机\n\n**Year 3-4（专业分支）**\n根据兴趣选择：\n• **AI/ML方向**: CSCI3320, 4180, 4190\n• **系统方向**: CSCI3150, 4430\n• **理论方向**: CSCI3160, 4120\n\n**关键建议**：\n1. Year 2的核心课必须学扎实\n2. 提早确定兴趣方向\n3. 平衡理论与实践\n4. 关注先修课程要求',
        en: 'CUHK CS major course planning:\n\n**Year 1 (Foundation)**\n• CSCI1130/1030: Programming Intro\n• MATH1010/2010: Math Foundation\n• ENGG1110: Engineering Intro\n\n**Year 2 (Core Courses)**\n• CSCI2100: Data Structures\n• CSCI2040: Python & Data Science\n• CSCI2110: Computer Architecture\n• CSCI3130: Formal Languages\n\n**Year 3-4 (Specialization)**\nChoose based on interest:\n• **AI/ML Track**: CSCI3320, 4180, 4190\n• **Systems Track**: CSCI3150, 4430\n• **Theory Track**: CSCI3160, 4120\n\n**Key Tips**:\n1. Master Year 2 core courses\n2. Identify interests early\n3. Balance theory & practice\n4. Mind prerequisites'
      },
      timestamp: '11:17',
      sourcesUsed: {
        zh_CN: ['选课指南', 'TripleU', '学长学姐经验'],
        en: ['Course Guide', 'TripleU', 'Senior Experience']
      }
    }
  },

  // ========== Star Code 模型 (3个例子) ==========
  {
    id: 'star-code-search',
    modelId: 'star-code',
    userMessage: {
      text: {
        zh_CN: 'Python快速排序算法怎么实现？',
        en: 'How to implement quicksort algorithm in Python?'
      },
      timestamp: '09:30'
    },
    questionType: {
      type: 'search',
      label: {
        zh_CN: '互联网搜索',
        en: 'Internet Search'
      },
      icon: '🔍',
      color: '#3b82f6'
    },
    searchingSteps: [
      {
        source: 'internet',
        sourceName: {
          zh_CN: '互联网搜索',
          en: 'Internet Search'
        },
        icon: '🌐',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'website',
            name: 'GeeksforGeeks - Quicksort',
            preview: {
              zh_CN: '经典快速排序实现，时间复杂度O(nlogn)...',
              en: 'Classic quicksort implementation, O(nlogn) time complexity...'
            }
          },
          {
            type: 'code',
            name: 'GitHub - Python Algorithms',
            preview: {
              zh_CN: '多种排序算法的Python实现和性能对比',
              en: 'Python implementations and performance comparison of sorting algorithms'
            },
            icon: '💻'
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '这是Python快速排序的实现：\n\n```python\ndef quicksort(arr):\n    # 基本情况：数组为空或只有一个元素\n    if len(arr) <= 1:\n        return arr\n    \n    # 选择基准值（这里选择中间元素）\n    pivot = arr[len(arr) // 2]\n    \n    # 分区\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    # 递归排序并合并\n    return quicksort(left) + middle + quicksort(right)\n\n# 使用示例\narr = [3, 6, 8, 10, 1, 2, 1]\nprint(quicksort(arr))  # [1, 1, 2, 3, 6, 8, 10]\n```\n\n**算法解析**：\n• 时间复杂度：平均O(nlogn)，最坏O(n²)\n• 空间复杂度：O(n)\n• 采用分治法，选择基准值后分为三部分递归处理',
        en: 'Here\'s a Python quicksort implementation:\n\n```python\ndef quicksort(arr):\n    # Base case: empty or single element\n    if len(arr) <= 1:\n        return arr\n    \n    # Choose pivot (middle element)\n    pivot = arr[len(arr) // 2]\n    \n    # Partition\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    # Recursively sort and merge\n    return quicksort(left) + middle + quicksort(right)\n\n# Usage\narr = [3, 6, 8, 10, 1, 2, 1]\nprint(quicksort(arr))  # [1, 1, 2, 3, 6, 8, 10]\n```\n\n**Algorithm Analysis**:\n• Time: Average O(nlogn), Worst O(n²)\n• Space: O(n)\n• Uses divide-and-conquer with pivot partitioning'
      },
      timestamp: '09:31',
      sourcesUsed: {
        zh_CN: ['GeeksforGeeks', 'GitHub算法库'],
        en: ['GeeksforGeeks', 'GitHub Algorithms']
      }
    }
  },
  {
    id: 'star-code-course',
    modelId: 'star-code',
    userMessage: {
      text: {
        zh_CN: '我的C++作业编译报错，帮我看看哪里错了',
        en: 'My C++ assignment has compile errors, help me find the bugs'
      },
      timestamp: '20:15',
      attachedFile: {
        name: 'assignment2.cpp',
        size: '3.4 KB',
        type: 'cpp',
        icon: '💻'
      }
    },
    questionType: {
      type: 'course',
      label: {
        zh_CN: '课程相关',
        en: 'Course Related'
      },
      icon: '📚',
      color: '#8b5cf6'
    },
    searchingSteps: [
      {
        source: 'personal-library',
        sourceName: {
          zh_CN: '个人知识库',
          en: 'Personal Library'
        },
        icon: '📚',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'code',
            name: '2024Fall/CSCI2100/assignment2.cpp',
            preview: {
              zh_CN: '代码文件：链表实现，发现3个编译错误',
              en: 'Code file: Linked list implementation, found 3 compile errors'
            },
            icon: '💻'
          }
        ]
      },
      {
        source: 'cuhk-knowledge',
        sourceName: {
          zh_CN: 'CUHK知识库',
          en: 'CUHK Knowledge Base'
        },
        icon: '🏛️',
        delay: 2,
        status: 'found',
        foundItems: [
          {
            type: 'pdf',
            name: 'CSCI2100/Lecture5-LinkedList.pdf',
            preview: {
              zh_CN: '链表操作的正确写法和常见错误',
              en: 'Correct linked list operations and common mistakes'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: '分析了你的代码，发现了3个问题：\n\n**错误1：头文件缺失**\n```cpp\n// 缺少：\n#include <iostream>\n#include <cstddef>  // for NULL\n```\n\n**错误2：insert函数指针使用错误**\n```cpp\n// 错误写法：\nvoid insert(Node* head, int value) {\n    // head是值传递，无法修改原指针\n}\n\n// 正确写法：\nvoid insert(Node*& head, int value) {\n    // 使用引用传递\n}\n```\n\n**错误3：内存泄漏**\n```cpp\n// 删除节点后忘记释放内存\nNode* temp = current->next;\ncurrent->next = temp->next;\ndelete temp;  // 添加这行\n```\n\n**修改后的完整代码已优化**，主要是指针传递和内存管理的问题。参考Lecture5的链表操作规范。',
        en: 'Analyzed your code, found 3 issues:\n\n**Error 1: Missing headers**\n```cpp\n// Missing:\n#include <iostream>\n#include <cstddef>  // for NULL\n```\n\n**Error 2: Incorrect pointer usage in insert**\n```cpp\n// Wrong:\nvoid insert(Node* head, int value) {\n    // head is passed by value\n}\n\n// Correct:\nvoid insert(Node*& head, int value) {\n    // Use reference\n}\n```\n\n**Error 3: Memory leak**\n```cpp\n// Forgot to free memory after deletion\nNode* temp = current->next;\ncurrent->next = temp->next;\ndelete temp;  // Add this\n```\n\n**Fixed code optimized**, mainly pointer passing and memory management issues. Refer to Lecture5 linked list operations.'
      },
      timestamp: '20:17',
      sourcesUsed: {
        zh_CN: ['你的代码文件', 'CSCI2100课程资料'],
        en: ['Your code file', 'CSCI2100 materials']
      }
    }
  },
  {
    id: 'star-code-cuhk',
    modelId: 'star-code',
    userMessage: {
      text: {
        zh_CN: 'CUHK的CSCI课程主要用什么编程语言？',
        en: 'What programming languages are mainly used in CUHK CSCI courses?'
      },
      timestamp: '14:50'
    },
    questionType: {
      type: 'cuhk',
      label: {
        zh_CN: 'CUHK知识',
        en: 'CUHK Knowledge'
      },
      icon: '🏛️',
      color: '#f59e0b'
    },
    searchingSteps: [
      {
        source: 'cuhk-knowledge',
        sourceName: {
          zh_CN: 'CUHK知识库',
          en: 'CUHK Knowledge Base'
        },
        icon: '🏛️',
        delay: 1,
        status: 'found',
        foundItems: [
          {
            type: 'docx',
            name: '选课.docx',
            preview: {
              zh_CN: '各年级课程编程语言分布：Python、C++、Java...',
              en: 'Programming languages by year: Python, C++, Java...'
            }
          },
          {
            type: 'docx',
            name: 'TripleU.pdf',
            preview: {
              zh_CN: 'CSCI课程语言要求和预修建议',
              en: 'CSCI course language requirements and prerequisites'
            }
          }
        ]
      }
    ],
    aiResponse: {
      text: {
        zh_CN: 'CUHK计算机系课程使用的编程语言分布：\n\n**基础课程（Year 1-2）**\n• CSCI1130/1030: **Python** - 编程入门\n• CSCI2100: **C/C++** - 数据结构\n• CSCI2040: **Python** - 数据科学\n• CSCI2110: **C** - 计算机架构\n\n**高年级课程（Year 3-4）**\n• CSCI3150: **C** - 操作系统\n• CSCI3100: **Java/JavaScript** - 软件工程\n• CSCI4430: **Go/Rust** - 分布式系统\n• CSCI3320/4180: **Python** - 机器学习\n\n**总结**：\n• **必须掌握**：Python（最常用）、C/C++（系统底层）\n• **推荐学习**：Java（工程项目）、JavaScript（Web开发）\n• **进阶选择**：Go、Rust（新兴语言）\n\n建议Year 1打好Python和C++基础，其他语言可以根据选课需要学习。',
        en: 'Programming languages used in CUHK CS courses:\n\n**Foundation Courses (Year 1-2)**\n• CSCI1130/1030: **Python** - Programming Intro\n• CSCI2100: **C/C++** - Data Structures\n• CSCI2040: **Python** - Data Science\n• CSCI2110: **C** - Computer Architecture\n\n**Advanced Courses (Year 3-4)**\n• CSCI3150: **C** - Operating Systems\n• CSCI3100: **Java/JavaScript** - Software Engineering\n• CSCI4430: **Go/Rust** - Distributed Systems\n• CSCI3320/4180: **Python** - Machine Learning\n\n**Summary**:\n• **Must Learn**: Python (most common), C/C++ (systems)\n• **Recommended**: Java (projects), JavaScript (web)\n• **Advanced**: Go, Rust (emerging)\n\nBuild strong Python and C++ foundation in Year 1, learn others as needed.'
      },
      timestamp: '14:51',
      sourcesUsed: {
        zh_CN: ['选课指南', 'TripleU'],
        en: ['Course Guide', 'TripleU']
      }
    }
  }
];

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 根据模型ID获取该模型的所有例子
 */
export function getExamplesByModel(modelId: ModelType): WorkflowExample[] {
  return WORKFLOW_EXAMPLES.filter(example => example.modelId === modelId);
}

/**
 * 根据问题类型获取所有例子
 */
export function getExamplesByQuestionType(type: QuestionSourceType): WorkflowExample[] {
  return WORKFLOW_EXAMPLES.filter(example => example.questionType.type === type);
}

/**
 * 获取某个模型的信息
 */
export function getModelInfo(modelId: ModelType): ModelInfo | undefined {
  return WORKFLOW_MODELS.find(model => model.id === modelId);
}

/**
 * 根据ID获取例子
 */
export function getExampleById(id: string): WorkflowExample | undefined {
  return WORKFLOW_EXAMPLES.find(example => example.id === id);
}
