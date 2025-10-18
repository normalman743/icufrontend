/**
 * Cluster Examples - ICU 可以很好解决的问题聚类
 * 用于"为什么选择 ICU"页面
 */

export type ClusterType = 
  | 'business-courses' 
  | 'professor-reviews' 
  | 'academic-planning' 
  | 'learning-confusion';

export interface ExampleQuestion {
  text: {
    zh_CN: string;
    en: string;
  };
  icuCanHelp?: boolean;
}

export interface Cluster {
  id: string;
  clusterType: ClusterType;
  title: {
    zh_CN: string;
    en: string;
  };
  description: {
    zh_CN: string;
    en: string;
  };
  features: {
    zh_CN: string;
    en: string;
  };
  problemCount: number;
  exampleQuestions: ExampleQuestion[];
  icon: string;
  color?: string;
}

export const CLUSTER_EXAMPLES: Cluster[] = [
  // 聚类 1: 商科课程学习交流
  {
    id: 'cluster-1-business',
    clusterType: 'business-courses',
    title: {
      zh_CN: '商科课程学习交流',
      en: 'Business Course Discussion'
    },
    description: {
      zh_CN: 'CUHK 商科学生最关注的课程讨论和学习经验分享',
      en: 'Most discussed business courses and learning experiences from CUHK students'
    },
    features: {
      zh_CN: '高频词: "难度(28) 作业(15) 考试(12) 教授(8)"，专注 ECON/FINA/ACCT 课程',
      en: 'High frequency words: "difficulty(28) assignments(15) exam(12) professor(8)", focus on ECON/FINA/ACCT'
    },
    problemCount: 681,
    exampleQuestions: [
      {
        text: {
          zh_CN: '请问 ECON1220 这学期的 midterm 大概什么难度？有什么复习重点？',
          en: 'What\'s the difficulty level of ECON1220 midterm this semester? Any key review topics?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: '有没有 FINA2320 的学习群可以加入讨论作业？',
          en: 'Is there a study group for FINA2320 to discuss assignments?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: 'Prof. CHAN 的 ACCT1210 给分怎么样？听说是严格出名的？',
          en: 'How is Prof. CHAN\'s grading in ACCT1210? Heard he\'s known for being strict?'
        },
        icuCanHelp: true
      }
    ],
    icon: '💼',
    color: '#3B82F6'
  },

  // 聚类 2: 教授课程测评咨询
  {
    id: 'cluster-2-professor-reviews',
    clusterType: 'professor-reviews',
    title: {
      zh_CN: '教授课程测评咨询',
      en: 'Professor & Course Reviews'
    },
    description: {
      zh_CN: '学生对教授教学和课程质量的评价汇集',
      en: 'Student reviews and feedback on professors and course quality'
    },
    features: {
      zh_CN: '课程评价 45%，高频词: "求(58) 测评(40) prof(11) 给分(9)"，专门评价教授',
      en: 'Course reviews 45%, high frequency words: "looking for(58) review(40) prof(11) grading(9)"'
    },
    problemCount: 642,
    exampleQuestions: [
      {
        text: {
          zh_CN: '求测评 Dr. CHAN Man Long 的 ELTU2012，他给分怎么样？课程是什么感觉？',
          en: 'Can you review Dr. CHAN Man Long\'s ELTU2012? How\'s his grading? What\'s the course like?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: '有学长姐上过 Prof. YUNG Hei Ming 的 FINA2010 吗？课程难度如何？',
          en: 'Anyone taken Prof. YUNG Hei Ming\'s FINA2010? What\'s the difficulty?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: 'Prof. LAI 教过哪些课？听说他讲课很有意思？',
          en: 'What courses does Prof. LAI teach? Heard his lectures are interesting?'
        },
        icuCanHelp: true
      }
    ],
    icon: '⭐',
    color: '#F59E0B'
  },

  // 聚类 3: 学术规划与杂项咨询
  {
    id: 'cluster-3-academic-planning',
    clusterType: 'academic-planning',
    title: {
      zh_CN: '学术规划与杂项咨询',
      en: 'Academic Planning & Advisory'
    },
    description: {
      zh_CN: '涵盖专业选择、课程规划、学位要求等学术指导内容',
      en: 'Major selection, course planning, degree requirements and academic guidance'
    },
    features: {
      zh_CN: '其他类 43%，高频词: "求(25) 规划(18) workload(14) major(12)"，涉及学术规划',
      en: 'Other topics 43%, high frequency: "looking for(25) planning(18) workload(14) major(12)"'
    },
    problemCount: 585,
    exampleQuestions: [
      {
        text: {
          zh_CN: '请问 ECON1111 + ECON3021 + ECON2901 + ECON3320 加上通识课一学期 workload 会不会太大？',
          en: 'Will taking ECON1111 + ECON3021 + ECON2901 + ECON3320 plus GE courses in one semester be too heavy?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: '想申请 STAT major，需要先修什么课程？MATH2050 还是 MATH2010？',
          en: 'Want to apply for STAT major. What prerequisites are needed? MATH2050 or MATH2010?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: '有没有同学了解暑期交换项目的申请流程和要求？',
          en: 'Anyone know about summer exchange program application process and requirements?'
        },
        icuCanHelp: true
      }
    ],
    icon: '🗺️',
    color: '#10B981'
  },

  // 聚类 4: 学习困惑与生活求助
  {
    id: 'cluster-4-learning-confusion',
    clusterType: 'learning-confusion',
    title: {
      zh_CN: '学习困惑与生活求助',
      en: 'Learning Struggles & Life Advice'
    },
    description: {
      zh_CN: '学生在学习、生活中遇到的困难和寻求帮助的内容',
      en: 'Student struggles with learning, life balance and seeking support'
    },
    features: {
      zh_CN: '其他类 44%，高频词: "求(43) 困惑(12) 压力(8) 技巧(7)"，个人困惑较多',
      en: 'Other topics 44%, high frequency: "help(43) confused(12) stress(8) tips(7)"'
    },
    problemCount: 568,
    exampleQuestions: [
      {
        text: {
          zh_CN: '大家 MATH1013 都是怎么学的？感觉完全跟不上进度😭',
          en: 'How do everyone study MATH1013? I feel completely behind 😭'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: '请问有没有学长姐可以分享一下如何平衡学习和生活压力？',
          en: 'Anyone can share tips on balancing academic and life stress?'
        },
        icuCanHelp: true
      },
      {
        text: {
          zh_CN: '第一年不知道选什么课，怎么样才能更好地规划学业？',
          en: 'Not sure what courses to take in year 1. How to better plan my studies?'
        },
        icuCanHelp: true
      }
    ],
    icon: '💭',
    color: '#8B5CF6'
  }
];
