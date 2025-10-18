import React, { useState, useEffect, useRef } from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  welcomeText?: string;
  userWelcomeText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  user,
  welcomeText,
  userWelcomeText,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 处理视频播放（悬停或点击触发）
  const handlePlayVideo = () => {
    if (hasPlayed) return; // 已经播放过，不再重复播放
    
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.warn('Video playback failed:', error);
      });
      setHasPlayed(true); // 标记为已播放
    }
  };

  // 视频结束时的处理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // 视频结束后定格在最后一帧（什么都不做，不循环）
      console.log('Video ended, frozen at last frame');
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <section id="hero" className="section section-hero">
      <div className="hero-content">
        <div 
          className="phoenix-container"
          onMouseEnter={handlePlayVideo}
          onClick={handlePlayVideo}
        >
          <div className="phoenix-video-container">
            <video
              ref={videoRef}
              className="phoenix-video"
              src="/videos/p2b2icu.mp4"
              poster="/Mascot.PNG"  // 截图第一帧作为封面
              loop={false}
              muted
              playsInline
              preload="auto"
            />
          </div>
          <div className="phoenix-glow"></div>
        </div>

        
        <h2 className="hero-subtitle">{subtitle}</h2>
        <p className="hero-description">{description}</p>

        {user && welcomeText && userWelcomeText && (
          <div className="hero-user">
            <span>{welcomeText}, {user.name || user.email}</span>
            <span>{userWelcomeText}!</span>
          </div>
        )}

        <div className="hero-cta">
          <button className="cta-button cta-button--primary" onClick={onPrimaryClick}>
            {ctaPrimary}
          </button>
          <button className="cta-button cta-button--secondary" onClick={onSecondaryClick}>
            {ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
