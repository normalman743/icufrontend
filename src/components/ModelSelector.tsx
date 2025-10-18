import React, { useState, useRef, useEffect } from 'react';
import { AIModel } from '../types';
import './ModelSelector.css';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
  language?: 'zh_CN' | 'en';
}

// 模型配置信息
const MODEL_CONFIG = {
  [AIModel.STAR]: {
    name: 'Star',
    description: {
      zh_CN: '适用于多数任务',
      en: 'Suitable for most tasks'
    },
    icon: '⭐'
  },
  [AIModel.STAR_PLUS]: {
    name: 'StarPlus',
    description: {
      zh_CN: '顶级长推理',
      en: 'Premium long reasoning'
    },
    icon: '🌟'
  },
  [AIModel.STAR_CODE]: {
    name: 'StarCode',
    description: {
      zh_CN: '优化编程和现实任务',
      en: 'Optimized for coding and practical tasks'
    },
    icon: '💻'
  }
};

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  language = 'zh_CN'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelSelect = (model: AIModel) => {
    onModelChange(model);
    setIsOpen(false);
  };

  const currentModel = MODEL_CONFIG[selectedModel];

  return (
    <div className={`model-selector ${disabled ? 'model-selector--disabled' : ''}`} ref={dropdownRef}>
      <button
        className={`model-selector__trigger ${isOpen ? 'model-selector__trigger--active' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="选择AI模型"
      >
        <div className="model-selector__current">
          <span className="model-selector__icon">{currentModel.icon}</span>
          <div className="model-selector__info">
            <div className="model-selector__name">{currentModel.name}</div>
            <div className="model-selector__description">
              {currentModel.description[language]}
            </div>
          </div>
        </div>
        <svg 
          className={`model-selector__arrow ${isOpen ? 'model-selector__arrow--rotated' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16"
        >
          <path 
            fill="currentColor" 
            d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .708-.708L8.354 4.93a.5.5 0 0 0-.708 0L3.72 8.865a.5.5 0 1 0 .708.708z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="model-selector__dropdown">
          {Object.values(AIModel).map((model) => {
            const modelConfig = MODEL_CONFIG[model];
            const isSelected = model === selectedModel;
            
            return (
              <button
                key={model}
                className={`model-selector__option ${isSelected ? 'model-selector__option--selected' : ''}`}
                onClick={() => handleModelSelect(model)}
              >
                <div className="model-selector__option-content">
                  <span className="model-selector__option-icon">{modelConfig.icon}</span>
                  <div className="model-selector__option-info">
                    <div className="model-selector__option-name">{modelConfig.name}</div>
                    <div className="model-selector__option-description">
                      {modelConfig.description[language]}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <svg className="model-selector__check" width="16" height="16" viewBox="0 0 16 16">
                    <path 
                      fill="currentColor" 
                      d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;