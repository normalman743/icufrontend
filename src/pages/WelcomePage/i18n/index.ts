/**
 * 国际化统一导出文件
 * Centralized i18n exports
 */

import zh_CN from './zh_CN';
import en from './en';

export type LanguageKey = 'zh_CN' | 'en';

export const translations = {
  zh_CN,
  en
};

/**
 * 获取翻译文本的 Hook 函数
 * @param language 当前语言
 * @returns 翻译对象
 */
export const useTranslation = (language: LanguageKey = 'zh_CN') => {
  return translations[language] || translations.zh_CN;
};

export default translations;
