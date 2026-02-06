// ScrollProgress.tsx
// Sticky progress bar that appears when user scrolls down

import { useEffect, useState } from 'react';

import { FootballFieldProgress } from './FootballFieldProgress';
import { TrophyProgress } from './TrophyProgress';
import './ScrollProgress.css';

interface ScrollProgressProps {
  progressPercentage: number;
  style?: 'trophy' | 'football' | 'simple';
}

export function ScrollProgress({ progressPercentage, style = 'football' }: ScrollProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show progress bar when user scrolls down more than 100px
      const scrollThreshold = 100;
      const shouldShow = window.scrollY > scrollThreshold;
      setIsVisible(shouldShow);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Don't render if no progress or not visible
  if (progressPercentage === 0 || !isVisible) {
    return null;
  }

  // Render the appropriate progress component
  const renderProgressComponent = () => {
    switch (style) {
      case 'trophy':
        return <TrophyProgress progressPercentage={progressPercentage} />;
      case 'football':
        return <FootballFieldProgress progressPercentage={progressPercentage} />;
      case 'simple':
      default:
        return (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
          </div>
        );
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    <div className={`scroll-progress ${isVisible ? 'scroll-progress--visible' : ''}`}>
      {renderProgressComponent()}
    </div>
  );
}
