import React, { useState, useEffect, useRef } from 'react';
import { WORKFLOW_MODELS, getExamplesByModel, type WorkflowExample, type ModelType } from '../data';
import './WorkflowSection.css';

interface WorkflowSectionProps {
  id: string;
  title: string;
  description: string;
  currentLanguage?: 'zh_CN' | 'en';
}

type AnimationStep = 
  | "idle"
  | "searching" 
  | "user-input" 
  | "question-tag" 
  | "ai-response" 
  | "complete";

const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  id,
  title,
  description,
  currentLanguage = 'zh_CN',
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('star');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [animationStep, setAnimationStep] = useState<AnimationStep>('idle');
  const [visibleSearchSteps, setVisibleSearchSteps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lang = currentLanguage;

  // 自动滚动到最新内容
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
      
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };
    
    // 使用多重 requestAnimationFrame 确保 DOM 完全渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 50);
      });
    });
  }, [animationStep, visibleSearchSteps]);

  // 获取当前模型的所有场景
  const currentScenarios = getExamplesByModel(selectedModel);
  const currentExample = currentScenarios[selectedScenarioIndex];

  // 重置动画
  const resetAnimation = () => {
    setAnimationStep('idle');
    setVisibleSearchSteps([]);
    setIsPlaying(false);
  };

  // 选择模型
  const handleModelSelect = (modelId: ModelType) => {
    setSelectedModel(modelId);
    setSelectedScenarioIndex(0);
    resetAnimation();
    setShowModelMenu(false);
  };

  // 切换场景
  const handleScenarioChange = (index: number) => {
    setSelectedScenarioIndex(index);
    resetAnimation();
  };

  // 循环切换场景（♻️ 按钮）
  const handleToggleScenario = () => {
    const nextIndex = (selectedScenarioIndex + 1) % currentScenarios.length;
    setSelectedScenarioIndex(nextIndex);
    resetAnimation();
  };

  // 上传文件（➕ 按钮 - 暂时无效果）
  const handleUploadFile = () => {
    // 暂时无效果
    console.log('上传文件功能待实现');
  };

  // 发送消息（播放动画）
  const handleSendMessage = () => {
    if (isPlaying || !currentExample) return;
    playAnimation(currentExample);
  };

  // 播放动画
  const playAnimation = async (example: WorkflowExample) => {
    setIsPlaying(true);

    // Step 1: 显示用户输入
    setAnimationStep('user-input');
    await delay(1500);

    // Step 2: 显示问题类型标记
    setAnimationStep('question-tag');
    await delay(1000);

    // Step 3: 显示搜索过程
    setAnimationStep('searching');
    
    // 逐步显示搜索结果
    for (let i = 0; i < example.searchingSteps.length; i++) {
      await delay(example.searchingSteps[i].delay * 1000);
      setVisibleSearchSteps(prev => [...prev, i]);
    }

    await delay(800);

    // Step 4: 显示AI回复
    setAnimationStep('ai-response');
    await delay(1500);

    // Step 5: 完成
    setAnimationStep('complete');
    setIsPlaying(false);
  };

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 获取文件图标
  const getFileIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      pdf: '📄',
      docx: '📝',
      png: '🖼️',
      jpg: '🖼️',
      py: '🐍',
      cpp: '💻',
      c: '💻',
      ipynb: '📓'
    };
    return icons[type] || '📎';
  };

  // 渲染模型图标
  const renderModelIcon = (icon: string, iconType?: 'emoji' | 'image', className?: string) => {
    if (iconType === 'image') {
      return <img src={icon} alt="model icon" className={className || 'model-icon-img'} />;
    }
    return <span className={className}>{icon}</span>;
  };

  const currentModelInfo = WORKFLOW_MODELS.find(m => m.id === selectedModel);

  return (
    <section id={id} className="workflow-section">
      {/* 聊天界面容器 */}
      <div className="chat-interface">
          {/* 顶部标题区 */}
          <div className="chat-header">
            <div className="workflow-intro">
              <h3 className="intro-title">
                {lang === 'zh_CN' ? 'ICU Demo 演示' : 'ICU Demo'}
              </h3>
              <p className="intro-description">
                {lang === 'zh_CN' ? '演示ICU如何处理你的问题' : 'See how ICU processes your questions'}
              </p>
            </div>
          </div>

          {/* 聊天消息区域 */}
          <div className="chat-messages-container" ref={messagesContainerRef}>
            {animationStep === 'idle' ? (
              // 未开始时显示提示
              <div className="chat-welcome">
                <div className="welcome-icon">
                  {renderModelIcon(currentModelInfo?.icon || '', currentModelInfo?.iconType, 'welcome-icon-content')}
                </div>
                <h3 className="welcome-title">
                  {lang === 'zh_CN' ? `体验 ${currentModelInfo?.name} 的演示` : `Experience ${currentModelInfo?.nameEn || currentModelInfo?.name} Demo`}
                </h3>
                <p className="welcome-text">
                  {lang === 'zh_CN' 
                    ? '点击下方"发送"按钮，查看AI如何智能处理你的问题'
                    : 'Click "Send" below to see how AI intelligently processes your question'
                  }
                </p>
              </div>
            ) : (
              <div className="chat-messages">
                {/* 用户消息 */}
                <div className="chat-message user-message slide-in-right">
                  <div className="message-avatar user-avatar">
                    <span>U</span>
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {/* 附件文件 */}
                      {currentExample.userMessage.attachedFile && (
                        <div className="message-attachment">
                          <span className="attachment-icon-small">
                            {getFileIcon(currentExample.userMessage.attachedFile.type)}
                          </span>
                          <div className="attachment-details">
                            <span className="attachment-name-small">{currentExample.userMessage.attachedFile.name}</span>
                            <span className="attachment-size-small">{currentExample.userMessage.attachedFile.size}</span>
                          </div>
                        </div>
                      )}
                      <p className="message-text">{currentExample.userMessage.text[lang]}</p>
                    </div>
                    <span className="message-time">{currentExample.userMessage.timestamp}</span>
                  </div>
                </div>

                {/* 问题类型标记 */}
                {['question-tag', 'searching', 'ai-response', 'complete'].includes(animationStep) && (
                  <div className="question-type-indicator fade-in">
                    <span className="type-icon">{currentExample.questionType.icon}</span>
                    <span className="type-label">{currentExample.questionType.label[lang]}</span>
                  </div>
                )}

                {/* AI搜索中 */}
                {['searching', 'ai-response', 'complete'].includes(animationStep) && (
                  <div className="ai-searching-container fade-in">
                    <div className="searching-header">
                      <div className="ai-avatar">
                        {renderModelIcon(currentModelInfo?.icon || '', currentModelInfo?.iconType, 'ai-avatar-content')}
                      </div>
                      <div className="searching-text">
                        <span className="searching-label">
                          {lang === 'zh_CN' ? 'AI正在为你寻找答案...' : 'AI is searching for answers...'}
                        </span>
                        {isPlaying && (
                          <span className="searching-dots">
                            <span>.</span><span>.</span><span>.</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 搜索步骤 */}
                    <div className="search-steps">
                      {currentExample.searchingSteps.map((step, index) => (
                        visibleSearchSteps.includes(index) && (
                          <div key={index} className="search-step slide-in-left">
                            <div className="step-header">
                              <span className="source-icon">{step.icon}</span>
                              <span className="source-name">{step.sourceName[lang]}</span>
                              <span className="status-badge">
                                {step.status === 'found' ? '✓ ' : '⏳ '}
                                {step.status === 'found' 
                                  ? (lang === 'zh_CN' ? '找到' : 'Found')
                                  : (lang === 'zh_CN' ? '搜索中' : 'Searching')
                                }
                              </span>
                            </div>
                            {step.status === 'found' && (
                              <div className="found-items">
                                {step.foundItems.map((item, idx) => (
                                  <div key={idx} className="found-item">
                                    <span className="item-icon">
                                      {item.icon || (item.type === 'website' ? '🌐' : '📄')}
                                    </span>
                                    <div className="item-content">
                                      <span className="item-name">{item.name}</span>
                                      <span className="item-preview">{item.preview[lang]}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* AI回复 */}
                {['ai-response', 'complete'].includes(animationStep) && (
                  <div className="chat-message ai-message ai-response-fade-in">
                    <div className="message-avatar ai-avatar-small">
                      {renderModelIcon(currentModelInfo?.icon || '', currentModelInfo?.iconType, 'avatar-icon')}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">
                        <div className="ai-response-header">
                          <span className="ai-name">{currentModelInfo?.name}</span>
                        </div>
                        <p className="message-text">{currentExample.aiResponse.text[lang]}</p>
                        <div className="sources-used">
                          <span className="sources-label">
                            {lang === 'zh_CN' ? '📚 参考来源：' : '📚 Sources: '}
                          </span>
                          {currentExample.aiResponse.sourcesUsed[lang].map((source, idx) => (
                            <span key={idx} className="source-tag">{source}</span>
                          ))}
                        </div>
                      </div>
                      <span className="message-time">{currentExample.aiResponse.timestamp}</span>
                    </div>
                  </div>
                )}
                
                {/* 滚动锚点 - 放在消息列表最后 */}
                <div ref={messagesEndRef} style={{ height: '1px', marginTop: '20px' }} />
              </div>
            )}
          </div>

          {/* 底部输入区域 */}
          <div className="chat-input-area">
            {/* 附件预览（如果有） */}
            {currentExample.userMessage.attachedFile && animationStep === 'idle' && (
              <div className="attachment-preview">
                <div className="attachment-item">
                  <span className="attachment-icon">
                    {getFileIcon(currentExample.userMessage.attachedFile.type)}
                  </span>
                  <div className="attachment-info">
                    <span className="attachment-name">{currentExample.userMessage.attachedFile.name}</span>
                    <span className="attachment-size">{currentExample.userMessage.attachedFile.size}</span>
                  </div>
                  <button className="attachment-remove">×</button>
                </div>
              </div>
            )}

            {/* 输入框和按钮 */}
            <div className="input-controls">
              {/* 上传文件按钮 */}
              <button 
                className="upload-button"
                onClick={handleUploadFile}
                title={lang === 'zh_CN' ? '上传文件' : 'Upload File'}
              >
                ➕
              </button>

              <div className="input-wrapper">
                <input
                  type="text"
                  className="message-input"
                  value={currentExample.userMessage.text[lang]}
                  readOnly
                  placeholder={lang === 'zh_CN' ? '输入消息...' : 'Type a message...'}
                />
              </div>

              {/* 切换场景按钮 */}
              <button
                className="toggle-button"
                onClick={handleToggleScenario}
                title={lang === 'zh_CN' ? '切换问题' : 'Toggle Question'}
              >
                ♻️
              </button>

              {/* 发送按钮 */}
              <button
                className={`send-button ${isPlaying ? 'disabled' : ''}`}
                onClick={handleSendMessage}
                disabled={isPlaying}
              >
                {animationStep === 'complete' ? (
                  <>
                    <span>🔄</span>
                    {lang === 'zh_CN' ? '重播' : 'Replay'}
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    {lang === 'zh_CN' ? '发送' : 'Send'}
                  </>
                )}
              </button>

              {/* 模型选择器 */}
              <div className="model-selector">
                <button
                  className="model-selector-button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                >
                  {renderModelIcon(currentModelInfo?.icon || '', currentModelInfo?.iconType, 'model-icon')}
                  <span className="model-name">{currentModelInfo?.name}</span>
                  <span className="dropdown-arrow">{showModelMenu ? '▲' : '▼'}</span>
                </button>

                {/* 模型菜单 */}
                {showModelMenu && (
                  <div className="model-menu">
                    {WORKFLOW_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className={`model-menu-item ${selectedModel === model.id ? 'active' : ''}`}
                        onClick={() => handleModelSelect(model.id)}
                      >
                        {renderModelIcon(model.icon, model.iconType, 'model-icon')}
                        <div className="model-info">
                          <span className="model-name">{model.name}</span>
                          <span className="model-desc">{model.description[lang]}</span>
                        </div>
                        {selectedModel === model.id && <span className="check-mark">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};

export default WorkflowSection;
