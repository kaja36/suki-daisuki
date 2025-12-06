// src/components/StoryIcon/index.tsx
import React from 'react';
import styles from './StoryIcon.module.css';

interface StoryIconProps {
  imageSrc: string;
  mainText: string;
  subText: string;
  onClick: () => void;
}

const StoryIcon: React.FC<StoryIconProps> = ({ imageSrc, mainText, subText, onClick }) => {
  return (
    <div className={styles.iconWrapper} onClick={onClick}>
      
      {/* 内側の円 */}
      <div className={styles.innerCircle}>
        {/* イラスト */}
        <img src={imageSrc} alt={mainText} className={styles.illustration} />
        
        {/* テキスト */}
        <div className={styles.textGroup}>
          <span className={styles.mainText}>{mainText}</span>
          <span className={styles.subText}>{subText}</span>
        </div>
      </div>

      {/* 再生ボタン */}
      <div className={styles.playButton}>
        <div className={styles.playIcon}></div>
      </div>
      
    </div>
  );
};

export default StoryIcon;