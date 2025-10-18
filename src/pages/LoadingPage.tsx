import React, { useState, useEffect } from 'react';
import './LoadingPage.css';

interface LoadingPageProps {
  isLoading?: boolean;
  loadingText?: string;
  loadingProgress?: number;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  isLoading = true,
  loadingText = '加载中...',
  loadingProgress = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (loadingProgress > currentProgress) {
      const timer = setTimeout(() => {
        setCurrentProgress(loadingProgress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, currentProgress]);

  return (
    <div className={`loading-page ${isVisible ? 'loading-page--visible' : ''}`}>
      {/* 主要吉祥物视频区域 */}
      <div className="mascot-video-section">
        <div className="mascot-container">
          {/* 预留视频位置 */}
          <div className="mascot-video-placeholder">
            <div className="mascot-glow"></div>
            <div className="mascot-spinner">
              <div className="spinner-orbit"></div>
              <div className="spinner-core"></div>
            </div>
          </div>

          {/* 替代的动态圆球 */}
          <div className="mascot-ball">
            <div className="ball-glow"></div>
            <div className="ball-core"></div>
          </div>
        </div>
      </div>

      {/* 加载文本区域 */}
      <div className="loading-text-section">
        <div className="loading-content">
          <h1 className="loading-title">ICU</h1>
          <p className="loading-subtitle">Intelligence Cu | The AI for U</p>

          <div className="loading-message">
            <span className="loading-text">{loadingText}</span>
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>

          {/* 进度条 */}
          {loadingProgress > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {currentProgress}%
              </div>
            </div>
          )}

          {/* 加载状态指示器 */}
          <div className="loading-indicators">
            <div className="indicator indicator--1"></div>
            <div className="indicator indicator--2"></div>
            <div className="indicator indicator--3"></div>
          </div>
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="decoration-section">
        <div className="floating-elements">
          <div className="element element--1"></div>
          <div className="element element--2"></div>
          <div className="element element--3"></div>
          <div className="element element--4"></div>
        </div>
      </div>
    </div>
  );
};

// 导出默认加载页面和简化的加载组件
export default LoadingPage;

// 简化版的加载组件
export const SimpleLoading: React.FC<{ text?: string }> = ({ text = '加载中...' }) => {
  return (
    <div className="simple-loading">
      <div className="simple-loading-content">
        <div className="simple-spinner">
          <div className="simple-orbit"></div>
          <div className="simple-core"></div>
        </div>
        <span className="simple-text">{text}</span>
      </div>
    </div>
  );
};