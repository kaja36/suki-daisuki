// src/pages/VideoPlayer.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoManager from './VideoManager';

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URLのパラメータを取得
  const navigate = useNavigate();

  const getContent = () => {
    if (id === 'takeru') {
      return { title: 'たけるくんのお話', color: '#87CEEB' };
    } else if (id === 'sacchan') {
      return { title: 'さっちゃんのお話', color: '#FFB6C1' };
    }
    return { title: '不明な映像', color: '#ccc' };
  };

  const content = getContent();

  return (
    <div className="video-page">
      <h2>{content.title}</h2>
      
      <div className="placeholder-video">
        {/* ここに <video> タグやMediaPipeの結果Canvasが入る */}
        <VideoManager movieTitle={"title"} />
        <p style={{color: content.color}}>
          ここに {content.title} の映像が流れる予定<br />
        </p>
      </div>

      <button className="back-button" onClick={() => navigate('/')}>
        ホームに戻る
      </button>
    </div>
  );
};

export default VideoPlayer;