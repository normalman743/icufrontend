import React, { useState } from 'react';
import './WhyICUSection.css';
import { ComparisonExample, SUB_CATEGORY_LABELS, CATEGORY_LABELS } from '../data';

interface AIOption {
  id: string;
  name: string;
  nameEn?: string;
  icon: string;
  iconType?: 'emoji' | 'image';
  category: 'international' | 'domestic';
  brandColor?: string;
}

interface WhyICUSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  selectAILabel: string;
  moreModelsLabel: string;
  aiOptions: AIOption[];
  comparisonData: ComparisonExample[];
  currentLanguage: 'zh_CN' | 'en';
  statsLabel?: string;
  stats?: {
    courses: string;
    discussions: string;
    students: string;
  };
  moreModelsModal: {
    title: string;
    description: string;
    suggestion: string;
    email: string;
    close: string;
  };
}

const WhyICUSection: React.FC<WhyICUSectionProps> = ({
  id,
  title,
  subtitle,
  description,
  selectAILabel,
  moreModelsLabel,
  aiOptions,
  comparisonData,
  currentLanguage,
  statsLabel,
  stats,
  moreModelsModal,
}) => {
  const [selectedAI, setSelectedAI] = useState<string>('');
  const [activeExample, setActiveExample] = useState(0);
  const [showMoreModelsModal, setShowMoreModelsModal] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [icuAnswerExpanded, setIcuAnswerExpanded] = useState(false);
  const [otherAIAnswerExpanded, setOtherAIAnswerExpanded] = useState(false);
  const aiSelectorRef = React.useRef<HTMLDivElement>(null);

  const selectedAIData = aiOptions.find(ai => ai.id === selectedAI);
  const currentExampleData = comparisonData[activeExample];
  
  // 动态获取当前示例的数据
  const currentQuestion = currentExampleData?.question[currentLanguage] || '';
  const currentICUAnswer = currentExampleData?.icuAnswer[currentLanguage] || '';
  const currentOtherAIAnswer = currentExampleData?.otherAIAnswers[selectedAI]?.[currentLanguage] || 
    (currentLanguage === 'zh_CN' ? '暂无此 AI 的回答数据' : 'No answer data available for this AI');
  
  // 检查答案是否超过8行
  const icuAnswerLines = currentICUAnswer.split('\n');
  const otherAnswerLines = currentOtherAIAnswer.split('\n');
  const shouldCollapseICU = icuAnswerLines.length > 8;
  const shouldCollapseOther = otherAnswerLines.length > 8;
  
  // 获取前8行和剩余行
  const icuAnswerPreview = shouldCollapseICU ? icuAnswerLines.slice(0, 8).join('\n') : currentICUAnswer;
  const icuAnswerRest = shouldCollapseICU ? icuAnswerLines.slice(8).join('\n') : '';
  const otherAnswerPreview = shouldCollapseOther ? otherAnswerLines.slice(0, 8).join('\n') : currentOtherAIAnswer;
  const otherAnswerRest = shouldCollapseOther ? otherAnswerLines.slice(8).join('\n') : '';
  
  // 当切换示例时，根据行数自动设置折叠状态
  React.useEffect(() => {
    setIcuAnswerExpanded(false);
    setOtherAIAnswerExpanded(false);
  }, [activeExample, selectedAI]);
  
  // 按类别和子类别组织数据
  const groupedExamples = comparisonData.reduce((acc, example, index) => {
    const category = example.category;
    const subCategory = example.subCategory;
    
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subCategory]) {
      acc[category][subCategory] = [];
    }
    acc[category][subCategory].push({ ...example, originalIndex: index });
    
    return acc;
  }, {} as Record<string, Record<string, Array<ComparisonExample & { originalIndex: number }>>>);

  // 处理AI选择
  const handleAISelect = (aiId: string) => {
    setSelectedAI(aiId);
    // 滚动到AI选择器位置
    setTimeout(() => {
      aiSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // 切换分类折叠状态
  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <section id={id} className="section why-icu-section">
      <div className="section-container">
        {/* Header - 只在未选择AI时显示 */}
        {!selectedAI && (
          <div className="why-icu-header">
            <h2 className="section-title">{title}</h2>
            <div className="section-divider"></div>
            <p className="section-description">{description}</p>
          </div>
        )}

        {/* AI Selector - 横向按钮组 */}
        <div ref={aiSelectorRef} className={`ai-selector-horizontal ${selectedAI ? 'sticky-selector' : ''}`}>
          <div className="selector-label">
            <span>{selectAILabel}</span>
            {!selectedAI && (
              <span className="selector-hint">
                👆 {currentLanguage === 'zh_CN' ? '点击选择一个 AI 开始对比' : 'Click to select an AI to start comparison'}
              </span>
            )}
          </div>
            <div
            className="ai-buttons-row"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '8px',
            }}
            >
            {aiOptions.map((ai) => (
              <button
              key={ai.id}
              className={`ai-button ${selectedAI === ai.id ? 'selected' : ''}`}
              onClick={() => handleAISelect(ai.id)}
              >
              {ai.iconType === 'image' ? (
                <img src={ai.icon} alt={ai.name} className="ai-icon-small" />
              ) : (
                <span className="ai-emoji">{ai.icon}</span>
              )}
              <span className="ai-name">
                {currentLanguage === 'en' && ai.nameEn ? ai.nameEn : ai.name}
              </span>
              </button>
            ))}
            <button
              className="ai-button more-models-button"
              onClick={() => setShowMoreModelsModal(true)}
            >
              <span className="ai-emoji">✨</span>
              <span className="ai-name">{moreModelsLabel}</span>
            </button>
            </div>
          </div>

        {/* 主对比区域 - 左侧导航 + 右侧内容 - 只在选择了AI后显示 */}
        {selectedAI && (
        <div className="comparison-layout full-page-layout">
          {/* 左侧分类导航 */}
          <div className="category-navigation">
            {Object.entries(groupedExamples).map(([category, subCategories]) => {
              const categoryInfo = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];
              const isCollapsed = collapsedCategories.has(category);
              
              return (
                <div key={category} className="category-group">
                  <div 
                    className="category-header clickable"
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="category-icon">{categoryInfo?.icon}</span>
                    <span className="category-name">{categoryInfo?.[currentLanguage]}</span>
                    <span className="collapse-arrow">{isCollapsed ? '▶' : '▼'}</span>
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      {Object.entries(subCategories).map(([subCategory, examples]) => {
                        const subCategoryInfo = SUB_CATEGORY_LABELS[subCategory as keyof typeof SUB_CATEGORY_LABELS];
                        
                        return (
                          <div key={subCategory} className="sub-category-group">
                            <div className="sub-category-header">
                              <span className="sub-category-icon">{subCategoryInfo?.icon}</span>
                              <span className="sub-category-name">{subCategoryInfo?.[currentLanguage]}</span>
                            </div>
                            
                            {examples.map((example) => (
                              <button
                                key={example.originalIndex}
                                className={`example-nav-item ${activeExample === example.originalIndex ? 'active' : ''}`}
                                onClick={() => setActiveExample(example.originalIndex)}
                              >
                                <span className="example-bullet">•</span>
                                <span className="example-question-short">
                                  {example.question[currentLanguage].substring(0, 30)}...
                                </span>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 右侧对比内容 */}
          <div className="comparison-content">
            {/* 问题标题 */}
            <div className="question-display-large">
              <span className="question-icon-large">💬</span>
              <h3 className="question-text-large">{currentQuestion}</h3>
            </div>

            {/* 对比卡片 */}
            <div className="comparison-cards-vertical">
              {/* ICU 答案卡片 */}
              <div className="answer-card-new icu-card-new">
                <div className="card-header-new">
                  <div className="card-title-row">
                    <img src="/iCU_Icon.png" alt="ICU Star" className="card-logo" />
                    <h4 className="card-name">ICU Star</h4>
                    <span className="card-badge-new success">
                      {currentLanguage === 'zh_CN' ? '✓ 了解 CUHK' : '✓ Knows CUHK'}
                    </span>
                  </div>
                </div>
                <div className="answer-content-new">
                  <p className="answer-text-new">
                    {icuAnswerPreview}
                    {shouldCollapseICU && !icuAnswerExpanded && (
                      <button 
                        className="inline-expand-button"
                        onClick={() => setIcuAnswerExpanded(true)}
                      >
                        {currentLanguage === 'zh_CN' ? ' ...展开查看完整回答 ▼' : ' ...Expand to see full answer ▼'}
                      </button>
                    )}
                    {shouldCollapseICU && icuAnswerExpanded && (
                      <>
                        {'\n' + icuAnswerRest}
                        <button 
                          className="inline-expand-button"
                          onClick={() => setIcuAnswerExpanded(false)}
                        >
                          {currentLanguage === 'zh_CN' ? '\n\n收起 ▲' : '\n\nCollapse ▲'}
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 其他 AI 答案卡片 */}
              <div className="answer-card-new other-card-new">
                <div className="card-header-new">
                  <div className="card-title-row">
                    {selectedAIData?.iconType === 'image' ? (
                      <img src={selectedAIData.icon} alt={selectedAIData.name} className="card-logo" />
                    ) : (
                      <span className="card-logo-emoji">{selectedAIData?.icon || '🤖'}</span>
                    )}
                    <h4 className="card-name">
                      {currentLanguage === 'en' && selectedAIData?.nameEn 
                        ? selectedAIData.nameEn 
                        : selectedAIData?.name || 'Other AI'}
                    </h4>
                    <span className="card-badge-new neutral">
                      {currentLanguage === 'zh_CN' ? '通用 AI' : 'General AI'}
                    </span>
                  </div>
                </div>
                <div className="answer-content-new">
                  <p className="answer-text-new">
                    {otherAnswerPreview}
                    {shouldCollapseOther && !otherAIAnswerExpanded && (
                      <button 
                        className="inline-expand-button"
                        onClick={() => setOtherAIAnswerExpanded(true)}
                      >
                        {currentLanguage === 'zh_CN' ? ' ...展开查看完整回答 ▼' : ' ...Expand to see full answer ▼'}
                      </button>
                    )}
                    {shouldCollapseOther && otherAIAnswerExpanded && (
                      <>
                        {'\n' + otherAnswerRest}
                        <button 
                          className="inline-expand-button"
                          onClick={() => setOtherAIAnswerExpanded(false)}
                        >
                          {currentLanguage === 'zh_CN' ? '\n\n收起 ▲' : '\n\nCollapse ▲'}
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 对比总结 */}
            <div className="comparison-summary">
              <div className="summary-icon">⭐</div>
              <p className="summary-text">
                <strong>
                  Stars are {currentLanguage === 'en' && selectedAIData?.nameEn 
                    ? selectedAIData.nameEn 
                    : selectedAIData?.name}{' '}
                  that Know CUHK Better
                </strong>
              </p>
              <p className="summary-description">
                {currentLanguage === 'zh_CN' 
                  ? '我们不是要比其他 AI 更强大，而是更懂 CUHK，更懂你'
                  : 'We\'re not trying to be more powerful than other AIs, we understand CUHK better and understand you better'}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Bottom Stats */}
        {stats && statsLabel && (
          <div className="why-icu-stats-section">
            <div className="why-icu-stats">
              <h4 className="stats-title">{statsLabel}</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.courses}</div>
                  <div className="stat-label">
                    {currentLanguage === 'zh_CN' ? '知识库' : 'Knowledge Base'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.discussions}</div>
                  <div className="stat-label">
                    {currentLanguage === 'zh_CN' ? '对话' : 'Conversations'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.students}</div>
                  <div className="stat-label">
                    {currentLanguage === 'zh_CN' ? '用户' : 'Users'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className="stats-action"
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}
        >
          <a href="/welcome/knowledge-sources" className="stats-link-button">
            {currentLanguage === 'zh_CN' ? '看看我们的AI知识库' : "See Our AI's Knowledge Base"}
          </a>

          <a href="/welcome/about-us" className="stats-link-button">
            {currentLanguage === 'zh_CN' ? '了解更多关于我们的信息' : 'Learn more about Us'}
          </a>
        </div>
      </div>
        
      {/* 更多模型弹窗 */}
      {showMoreModelsModal && (
        <div className="modal-overlay" onClick={() => setShowMoreModelsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMoreModelsModal(false)}>
              ✕
            </button>
            <h3 className="modal-title">{moreModelsModal.title}</h3>
            <p className="modal-description">{moreModelsModal.description}</p>
            <p className="modal-suggestion">{moreModelsModal.suggestion}</p>
            <a href={`mailto:${moreModelsModal.email}`} className="modal-email">
              {moreModelsModal.email}
            </a>
            <button className="modal-button" onClick={() => setShowMoreModelsModal(false)}>
              {moreModelsModal.close}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default WhyICUSection;
