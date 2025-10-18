/**
 * DeepSeek 的回答数据
 * 通用 AI 的回答，缺乏 CUHK 特定信息
 */

import { AIAnswer } from './icu_star';

export const DEEPSEEK_ANSWERS: AIAnswer[] = [
  {
    question: "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？",
    answer: "根据往届学生反馈，Sunny HA的期中考试选择题通常基于课程重点内容，难度适中但需要认真准备。建议重点复习讲义和作业题，不太会出现特别刁钻的题目。",
    reference: ["过往课程评价和学长学姐经验分享"]
  },
  {
    question: "FINA2320的学习群在哪里？想加入一起讨论作业",
    answer: "FINA2320的学习群通常通过以下途径找到：\n1) 课程Canvas系统的讨论区\n2) 学生自发组织的WhatsApp/Telegram群（可通过同学邀请加入）\n3) 各大学生社团的学术群组\n\n建议直接询问同班同学或助教获取最新群组信息。",
    reference: ["学校常用学习交流平台"]
  },
  {
    question: "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？",
    answer: "Dr. CHAN Man Long教学认真负责，评分标准明确。给分方面：按时完成作业、积极参与课堂讨论的学生通常能获得不错成绩。确实要求较高，但能有效提升英语表达能力。",
    reference: ["课程评估系统和学生反馈平台"]
  },
  {
    question: "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？",
    answer: "FINA2010作为金融学基础课程，Prof. YUNG的授课系统性强，难度属于中等。需要掌握基本数学计算和金融概念，定期复习和完成练习题是关键。",
    reference: ["课程大纲和往届学生评价"]
  },
  {
    question: "想问直博 HKPFS 需要什么背景？GPA 要多高？",
    answer: "HKPFS（香港博士研究生奖学金计划）竞争激烈，通常要求：\n\n1) 本科/硕士GPA 3.5/4.0以上\n2) 强有力的研究背景（论文发表、科研经历）\n3) 出色的推荐信和研究计划\n4) 相关领域突出表现\n\n具体标准因专业而异。",
    reference: ["HKPFS官方申请指南和成功案例统计"]
  },
  {
    question: "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？",
    answer: "这个组合workload较重：ECON3021和ECON3320涉及较多数学推导，ECON2901需要编程实践。建议搭配1门通识课，或替换1门经济课为负荷较轻的课程。具体取决于你的数学基础和时间管理能力。",
    reference: ["课程工作量评估和学术顾问建议"]
  },
  {
    question: "想用学校打印机，流程具体怎样？",
    answer: "学校打印机使用流程：\n\n1) 在计算机房登录校园账户\n2) 上传文件至Print@CUHK系统或直接发送打印命令\n3) 在打印机上刷卡（学生证）或输入账号密码\n4) 选择打印任务并确认\n\n打印配额可通过ITSC网站查询。",
    reference: ["ITSC官方操作指南"]
  },
  {
    question: "MATH1013 完全跟不上进度，大家怎么学的？",
    answer: "MATH1013学习建议：\n\n1) 定期参加教授和助教的答疑时间\n2) 组成学习小组共同解题\n3) 利用数学辅导中心的免费辅导服务\n4) 多做Past Paper和教科书习题\n5) 从基础概念开始逐步建立知识体系",
    reference: ["数学系学习支持资源和学生成功经验"]
  }
];
