import { useEffect, useRef } from 'react'
import { startStream, stopStream } from '../hooks/Camera'
import { FaceTracking } from '../feature/faceTrack/FaceTracking'

function FaceDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { renderLoop, stop, AngleLog, shakeCount } = FaceTracking();

  // カメラとトラッキングの初期化
  useEffect(() => {
    let active = true;

    const init = async () => {
      // カメラストリームを開始
      const stream = await startStream({
        width: 640,
        height: 480,
        videoRef
      });

      if (!active || !stream || !videoRef.current) return;

      // ビデオが読み込まれたらトラッキング開始
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play();
          renderLoop(videoRef);
        }
      };
    };

    init();

    return () => {
      active = false;
      stopStream(videoRef);
      stop();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Face Angle Demo</h1>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div>
          <video
            ref={videoRef}
            style={{
              width: '640px',
              height: '480px',
              border: '2px solid #ccc',
              borderRadius: '8px',
              transform: 'scaleX(-1)'
            }}
          />
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h2>Face Angles</h2>
          {AngleLog ? (
            <div style={{ fontSize: '18px', lineHeight: '2' }}>
              <div>
                <strong>Pitch (上下):</strong> {AngleLog.pitch.toFixed(1)}°
              </div>
              <div>
                <strong>Yaw (左右):</strong> {AngleLog.yaw.toFixed(1)}°
              </div>
              <div>
                <strong>Roll (回転):</strong> {AngleLog.roll.toFixed(1)}°
              </div>
            </div>
          ) : (
            <div style={{ color: '#666' }}>検出中...</div>
          )}
        </div>
      </div>
      <h2>顔を振った回数</h2>
        { shakeCount ? <div>顔を振った回数: {shakeCount} 回</div> : null }
    </div>
  )
}

export default FaceDemo