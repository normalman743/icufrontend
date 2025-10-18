# WhyICU Section 数据结构说明

## 📁 文件结构

```
/src/pages/WelcomePage/data/
├── aiModels.ts              # AI 模型配置
├── comparisonExamples.ts    # 对比问答数据
└── index.ts                 # 统一导出
```

## 🤖 AI 模型配置 (aiModels.ts)

### 当前配置的 10 个 AI：

**国际 AI (5个):**
1. **ChatGPT** - OpenAI (#10a37f)
2. **Claude** - Anthropic (#d97706)
3. **Gemini** - Google (#4285f4)
4. **Grok** - xAI (#1da1f2)
5. **Perplexity** - Perplexity AI (#8b5cf6)

**国产 AI (5个):**
6. **文心一言** - 百度 (#3385ff)
7. **通义千问** - 阿里 (#ff6a00)
8. **豆包** - 字节 (#00d4aa)
9. **智谱清言** - 智谱AI (#5b8ff9)
10. **Kimi** - 月之暗面 (#722ed1)

### 数据结构：

```typescript
interface AIModel {
  id: string;           // 唯一标识符
  name: string;         // 中文名称
  nameEn: string;       // 英文名称
  icon: string;         // emoji 图标（待替换为真实 SVG）
  category: 'international' | 'domestic';
  brandColor: string;   // 品牌色（十六进制）
}
```

## 📝 对比问答数据 (comparisonExamples.ts)

### 当前配置的 3 个示例：

1. **学术类 (Academic)** 📚
   - 问题：CSCI3100 这门课难不难？
   - 展示 ICU 对 CUHK 课程的深入了解

2. **生活类 (Life)** 🍜
   - 问题：崇基饭堂哪家最好吃？
   - 展示 ICU 对 CUHK 校园生活的熟悉

3. **行政类 (Admin)** 📋
   - 问题：drop MATH2050 影响 major 申请吗？
   - 展示 ICU 对 CUHK 学术政策的了解

### 数据结构：

```typescript
interface ComparisonExample {
  id: string;
  category: 'Academic' | 'Life' | 'Admin';
  categoryIcon: string;
  question: {
    zh_CN: string;
    en: string;
  };
  icuAnswer: {
    zh_CN: string;
    en: string;
  };
  otherAIAnswers: {
    [aiId: string]: {  // chatgpt, claude, gemini, etc.
      zh_CN: string;
      en: string;
    };
  };
}
```

## 🎯 数据完整性

### ✅ 已完成：
- 10 个 AI 模型全部配置完成
- 3 个对比示例全部创建
- 每个示例包含：
  - 问题（中英文）
  - ICU 回答（中英文）
  - 所有 10 个 AI 的回答（中英文）
- **总计：60 个回答** (3 问题 × 10 AI × 2 语言)

### ⏳ 待优化：
1. **替换 emoji 为真实 SVG logo**
   - 当前使用 emoji 占位符
   - 需要收集各 AI 的官方 logo

2. **收集真实 AI 回答**
   - 当前使用模拟回答
   - 可选：收集真实 AI 的实际回答

3. **扩展对比示例**
   - 可以添加更多问题类别
   - 如：求生类 (Survival)、社团类等

## 🔧 使用方式

### 在组件中使用：

```typescript
import { AI_MODELS, COMPARISON_EXAMPLES } from './data';

// WhyICUSection 组件
<WhyICUSection
  aiOptions={AI_MODELS}
  comparisonData={COMPARISON_EXAMPLES}
  currentLanguage={userLanguage as 'zh_CN' | 'en'}
/>
```

### 添加新的对比示例：

1. 打开 `comparisonExamples.ts`
2. 在 `COMPARISON_EXAMPLES` 数组中添加新对象
3. 确保包含所有 10 个 AI 的回答（中英文）

```typescript
{
  id: 'example-4-new',
  category: 'Academic',
  categoryIcon: '📚',
  question: {
    zh_CN: '你的新问题',
    en: 'Your new question'
  },
  icuAnswer: {
    zh_CN: 'ICU的回答',
    en: 'ICU answer'
  },
  otherAIAnswers: {
    chatgpt: { zh_CN: '...', en: '...' },
    claude: { zh_CN: '...', en: '...' },
    // ... 其他 8 个 AI
  }
}
```

## 🎨 品牌色参考

各 AI 的品牌色已配置在 `aiModels.ts` 中，可用于：
- AI 选择器的高亮
- 对比卡片的边框
- 图标/按钮的主题色

## 📊 数据流向

```
data/aiModels.ts ─┐
                  ├──> data/index.ts ──> index.tsx ──> WhyICUSection.tsx
data/comparisonExamples.ts ─┘
```

## 💡 注意事项

1. **语言一致性**：确保所有文本都有中英文版本
2. **AI ID 一致性**：`otherAIAnswers` 中的 key 必须与 `AI_MODELS` 中的 `id` 一致
3. **类型安全**：使用 TypeScript 类型确保数据结构正确
4. **答案质量**：ICU 的回答应体现对 CUHK 的深入了解，其他 AI 的回答应展示通用性/不了解 CUHK

## 🚀 下一步

1. **优化视觉效果**：
   - 添加动画效果
   - 替换真实 logo
   - 优化响应式设计

2. **扩展数据**：
   - 添加更多对比示例
   - 收集真实 AI 回答
   - 添加更多 AI 模型（如需要）

3. **完善其他 Section**：
   - ThreeSourcesSection
   - SmartAssistantSection
   - JoinUsSection
