import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useThrowLogic } from "./useThrowLogic";

const ThrowDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const { isThrown, checkThrow } = useThrowLogic();
  const [isCameraReady, setIsCameraReady] = useState(false);

  // MediaPipe初期化
  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
    };
    init();
  }, []);

  // 検出ループ
  const renderLoop = () => {
    if (!videoRef.current || !poseLandmarkerRef.current) return;
    
    if (videoRef.current.videoWidth > 0) {
      const startTimeMs = performance.now();
      const result = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      // 骨格が見つかったら判定ロジックへ渡す
      if (result.landmarks && result.landmarks.length > 0) {
        checkThrow(result.landmarks[0]);
      }
    }
    requestAnimationFrame(renderLoop);
  };

  // カメラ起動
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setIsCameraReady(true);
            renderLoop();
          };
        }
      } catch (e) {
        console.error("カメラ起動エラー:", e);
      }
    };
    startCamera();
  }, []);

  return (
    <div style={{ position: "relative", width: 640, height: 480, border: "5px solid #00f", margin: "20px auto" }}>
      <div style={{ 
        position: "absolute", top: 10, left: 10, 
        background: "rgba(0,0,0,0.7)", color: "white", padding: "10px", zIndex: 10,
        fontSize: "20px", fontWeight: "bold"
      }}>
        ステータス: {isCameraReady ? "監視中" : "起動中"}<br />
        判定: {isThrown ? "ポイ捨てした" : "待機中"}
      </div>

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }} 
      />
    </div>
  );
};

export default ThrowDetector;