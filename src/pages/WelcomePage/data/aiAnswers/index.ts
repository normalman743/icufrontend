/**
 * AI Answers Data Exports
 * 统一导出所有 AI 的回答数据
 */

export { ICU_STAR_ANSWERS, type AIAnswer } from './icu_star';
export { GPT_ANSWERS } from './gpt';
export { GEMINI_ANSWERS } from './gemini';
export { DEEPSEEK_ANSWERS } from './deepseek';

/**
 * 获取指定 AI 的回答数据
 * @param aiId AI 的 ID (chatgpt, gemini, Deepseek, icu)
 */
export const getAIAnswers = (aiId: string) => {
  const { ICU_STAR_ANSWERS } = require('./icu_star');
  const { GPT_ANSWERS } = require('./gpt');
  const { GEMINI_ANSWERS } = require('./gemini');
  const { DEEPSEEK_ANSWERS } = require('./deepseek');
  
  switch (aiId.toLowerCase()) {
    case 'chatgpt':
    case 'gpt':
      return GPT_ANSWERS;
    case 'gemini':
      return GEMINI_ANSWERS;
    case 'deepseek':
      return DEEPSEEK_ANSWERS;
    case 'icu':
    case 'icu_star':
      return ICU_STAR_ANSWERS;
    default:
      return ICU_STAR_ANSWERS;
  }
};
