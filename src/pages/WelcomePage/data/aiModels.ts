/**
 * AI Models Configuration
 * 所有支持对比的 AI 模型配置
 */

export interface AIModel {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  iconType?: 'emoji' | 'image';  // 新增：指定图标类型
  category: 'international' | 'domestic';
  brandColor?: string;
}

export const AI_MODELS: AIModel[] = [
  // 国际 AI
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    nameEn: 'ChatGPT',
    icon: '/gpt.png',
    iconType: 'image',
    category: 'international',
    brandColor: '#10a37f'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    nameEn: 'Gemini',
    icon: '/gemini.jpeg',
    iconType: 'image',
    category: 'international',
    brandColor: '#4285f4'
  },
  {
    id: 'Deepseek',
    name: 'Deepseek',
    nameEn: 'Deepseek',
    icon: '/ds.jpeg',
    iconType: 'image',
    category: 'domestic',
    brandColor: '#722ed1'
  }
];
