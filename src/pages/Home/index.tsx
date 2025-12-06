// src/pages/Home/index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import StoryIcon from '../../components/StoryIcon';
import bgImage from '../../assets/bg_image.jpg'; 
import takeruImg from '../../assets/takeru.png';
import sacchanImg from '../../assets/saccyan.png';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="main-container">
        {/* 背景画像 */}
        <img src={bgImage} alt="背景の街並み" className="background-image" />
        
        {/* コンテンツレイヤー */}
        <div className="content-layer">
          <h1 className="page-title">
            みんなの声を<br />聞いてみよう
          </h1>
          
          <div className="icons-wrapper">
            {/* たけるくんのアイコン */}
            <StoryIcon 
              imageSrc={takeruImg}
              mainText="たけるくん"
              subText="のお話"
              onClick={() => navigate('/video/takeru')}
            />
            
            {/* さっちゃんのアイコン */}
            <StoryIcon 
              imageSrc={sacchanImg}
              mainText="さっちゃん"
              subText="のお話"
              onClick={() => navigate('/video/sacchan')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;