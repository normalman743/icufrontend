import React, { useState } from 'react';
import './WhyICUSection.css';
import { ComparisonExample } from '../data';

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
  aiOptions: AIOption[];
  comparisonData: ComparisonExample[];
  currentLanguage: 'zh_CN' | 'en';
  statsLabel?: string;
  stats?: {
    courses: string;
    discussions: string;
    students: string;
  };
}

const WhyICUSection: React.FC<WhyICUSectionProps> = ({
  id,
  title,
  subtitle,
  description,
  aiOptions,
  comparisonData,
  currentLanguage,
  statsLabel,
  stats,
}) => {
  const [selectedAI, setSelectedAI] = useState<string>(aiOptions[0]?.id || 'chatgpt');
  const [activeExample, setActiveExample] = useState(0);

  const selectedAIData = aiOptions.find(ai => ai.id === selectedAI);
  const currentExampleData = comparisonData[activeExample];
  
  // 动态获取当前示例的数据
  const currentQuestion = currentExampleData?.question[currentLanguage] || '';
  const currentICUAnswer = currentExampleData?.icuAnswer[currentLanguage] || '';
  const currentOtherAIAnswer = currentExampleData?.otherAIAnswers[selectedAI]?.[currentLanguage] || 
    (currentLanguage === 'zh_CN' ? '暂无此 AI 的回答数据' : 'No answer data available for this AI');
  
  // 获取类别显示文本
  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: { zh_CN: string; en: string; icon: string } } = {
      Academic: { zh_CN: '学术', en: 'Academic', icon: '📚' },
      Life: { zh_CN: '生活', en: 'Life', icon: '🍜' },
      Admin: { zh_CN: '行政', en: 'Admin', icon: '📋' },
      Survival: { zh_CN: '求生', en: 'Survival', icon: '🎯' }
    };
    return categoryMap[category] || { zh_CN: category, en: category, icon: '❓' };
  };

  return (
    <section id={id} className="section why-icu-section">
      <div className="section-container">
        {/* Header */}
        <div className="why-icu-header">
          <h2 className="section-title">{title}</h2>
          <div className="section-divider"></div>
          <p className="why-icu-subtitle">{subtitle}</p>
          <p className="section-description">{description}</p>
        </div>

        {/* AI Selector */}
        <div className="ai-selector-container">
          <div className="selector-label">
            <span className="selector-icon">🤖</span>
            <span>{currentLanguage === 'zh_CN' ? '选择一个 AI 助手进行对比：' : 'Choose an AI to Compare:'}</span>
          </div>
          <div className="ai-options-grid">
            {aiOptions.map((ai) => (
              <button
                key={ai.id}
                className={`ai-option ${selectedAI === ai.id ? 'selected' : ''}`}
                onClick={() => setSelectedAI(ai.id)}
              >
                {ai.iconType === 'image' ? (
                  <img src={ai.icon} alt={ai.name} className="ai-logo-image" />
                ) : (
                  <span className="ai-category-badge">{ai.icon}</span>
                )}
                <span className="ai-option-name">
                  {currentLanguage === 'en' && ai.nameEn ? ai.nameEn : ai.name}
                </span>
                <span className="ai-category-badge-large">
                  {ai.category === 'international' 
                    ? (currentLanguage === 'zh_CN' ? '🌍 国际' : '🌍 International')
                    : (currentLanguage === 'zh_CN' ? '🇨🇳 国内' : '🇨🇳 Domestic')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Container */}
        <div className="comparison-container">
          {/* Example Tabs */}
          <div className="example-tabs">
            {comparisonData.map((exampleData, index) => {
              const categoryInfo = getCategoryDisplay(exampleData.category);
              return (
                <button
                  key={index}
                  className={`example-tab ${activeExample === index ? 'active' : ''}`}
                  onClick={() => setActiveExample(index)}
                >
                  <div className="tab-number">{index + 1}</div>
                  <div>
                    <div className="tab-header">
                      <span className={`tab-category category-${exampleData.category.toLowerCase()}`}>
                        {categoryInfo.icon} {categoryInfo[currentLanguage]}
                      </span>
                    </div>
                    <div className="tab-question">{exampleData.question[currentLanguage]}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Comparison Cards */}
          <div className="comparison-cards">
            {/* ICU Card */}
            <div className="answer-card icu-card">
              <div className="card-header">
                <div className="card-icon icu-icon">
                  <img src="/iCU_Icon.png" alt="ICU Star" className="card-ai-logo" />
                </div>
                <div>
                  <h3 className="card-title">ICU Star</h3>
                  <span className="card-badge success">
                    {currentLanguage === 'zh_CN' ? '了解 CUHK' : 'Knows CUHK'}
                  </span>
                </div>
              </div>

              <div className="question-display">
                <span className="question-icon">💬</span>
                <p className="question-text">{currentQuestion}</p>
              </div>

              <div className="answer-box icu-answer">
                <div className="answer-label">
                  <span className="check-icon">✓</span>
                  <span>{currentLanguage === 'zh_CN' ? 'ICU 回答：' : 'ICU Answer:'}</span>
                </div>
                <p className="answer-text">{currentICUAnswer}</p>
              </div>
            </div>

            {/* Other AI Card */}
            <div className="answer-card other-ai-card">
              <div className="card-header">
                <div className="card-icon other-icon">
                  {selectedAIData?.iconType === 'image' ? (
                    <img src={selectedAIData.icon} alt={selectedAIData.name} className="card-ai-logo" />
                  ) : (
                    selectedAIData?.icon || '🤖'
                  )}
                </div>
                <div>
                  <h3 className="card-title">
                    {currentLanguage === 'en' && selectedAIData?.nameEn 
                      ? selectedAIData.nameEn 
                      : selectedAIData?.name || 'Other AI'}
                  </h3>
                  <span className="card-badge fail">
                    {currentLanguage === 'zh_CN' ? '通用 AI' : 'General AI'}
                  </span>
                </div>
              </div>

              <div className="question-display">
                <span className="question-icon">💬</span>
                <p className="question-text">{currentQuestion}</p>
              </div>

              <div className="answer-box other-answer">
                <div className="answer-label">
                  <span className="cross-icon">✗</span>
                  <span>
                    {currentLanguage === 'en' && selectedAIData?.nameEn 
                      ? selectedAIData.nameEn 
                      : selectedAIData?.name || 'Other AI'}{' '}
                    {currentLanguage === 'zh_CN' ? '回答：' : 'Answer:'}
                  </span>
                </div>
                <p className="answer-text">{currentOtherAIAnswer}</p>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="example-dots">
            {comparisonData.map((_, index) => (
              <button
                key={index}
                className={`dot ${activeExample === index ? 'active' : ''}`}
                onClick={() => setActiveExample(index)}
                aria-label={`Example ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        {stats && (
          <div className="why-icu-info">
            <div className="info-card">
              <span className="info-icon">💡</span>
              <div className="info-content">
                <h4>Stars are AIs that Know CUHK Better</h4>
                <p>
                  ICU Stars are trained on CUHK-specific knowledge including course reviews, 
                  campus discussions, and student experiences. While other AIs provide general 
                  responses, ICU understands the unique context of CUHK students.
                </p>
              </div>
            </div>

            {statsLabel && (
              <>
                <h4 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
                  {statsLabel}
                </h4>
                <div className="info-stats">
                  <div className="stat-item">
                    <div className="stat-number">{stats.courses}</div>
                    <div className="stat-label">CUHK Courses Covered</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.discussions}</div>
                    <div className="stat-label">Student Discussions</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.students}</div>
                    <div className="stat-label">Students Helped</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default WhyICUSection;