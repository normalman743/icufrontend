# AI Answers Data 

这个文件夹包含了各个 AI 对同样问题的回答数据，用于在 WhyICU Section 中进行对比展示。

## 文件结构

```
aiAnswers/
├── icu_star.ts      # ICU Star 的回答（基于 CUHK 树洞真实数据）
├── gpt.ts           # GPT-5 的回答（通用 AI，缺乏 CUHK 特定信息）
├── gemini.ts        # Gemini 的回答（通用 AI，缺乏 CUHK 特定信息）
├── deepseek.ts      # DeepSeek 的回答（通用 AI）
├── doubao.ts        # Doubao 的回答（通用 AI）⚠️ 需要补充真实数据
├── index.ts         # 统一导出接口
└── README.md        # 本文件
```

## 数据结构

每个 AI 的回答数据都遵循以下 TypeScript 接口：

```typescript
export interface AIAnswer {
  question: string;        // 问题文本
  answer: string;          // 回答内容
  reference?: string[];    // 参考来源（可选）
}
```

## 问题列表（共 8 个）

1. Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？
2. FINA2320的学习群在哪里？想加入一起讨论作业
3. 求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？
4. Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？
5. 想问直博 HKPFS 需要什么背景？GPA 要多高？
6. 我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？
7. 想用学校打印机，流程具体怎样？
8. MATH1013 完全跟不上进度，大家怎么学的？

## 使用方法

```typescript
import { getAIAnswers, ICU_STAR_ANSWERS, GPT_ANSWERS } from './aiAnswers';

// 方法 1: 直接导入
const icuAnswers = ICU_STAR_ANSWERS;

// 方法 2: 通过 AI ID 获取
const gptAnswers = getAIAnswers('chatgpt');
const geminiAnswers = getAIAnswers('gemini');
```

## TODO

- [ ] 补充 Doubao 的真实回答数据
- [ ] 修复 gpt.ts 中的 TypeScript 编译错误（中文引号问题）
- [ ] 添加更多问题类别

## 注意事项

1. **ICU Star 的回答**基于 CUHK 树洞的真实讨论内容整理，具有很强的针对性和实用性
2. **其他 AI 的回答**来自实际测试，展示了通用 AI 在缺乏特定学校信息时的表现
3. 所有数据都应该保持真实性，不要过度编造