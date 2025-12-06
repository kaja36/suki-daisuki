import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useThrowLogic } from "./useThrowLogic";

function ThrowDetector() {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const { isThrown, checkThrow } = useThrowLogic();
  const [isReady, setIsReady] = useState<boolean>(false);

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
      setIsReady(true);
    };
    init();
  }, []);

  // 検出ループ
  const renderLoop = (videoRef: React.RefObject<HTMLVideoElement | null>, canvasRef?: React.RefObject<HTMLCanvasElement | null>, observeAction?: () => void) => {
    if (!videoRef.current || !poseLandmarkerRef.current) {
            if (!isReady) requestAnimationFrame(() => renderLoop(videoRef, canvasRef, observeAction));
            return;
        } 

    if (videoRef.current.videoWidth > 0) {
      const startTimeMs = performance.now();
      const result = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      // 骨格が見つかったら判定ロジックへ渡す
      if (result.landmarks && result.landmarks.length > 0) {
        checkThrow(result.landmarks[0]);
        if(isThrown && observeAction) {
          stop(observeAction);
        }
      }
    }
    requestAnimationFrame(() => renderLoop(videoRef, canvasRef, observeAction));
  };

  // 停止
  const stop = (observeAction?: () => void) => {
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }
    if (observeAction) {
      observeAction();
    }
  };

  return { renderLoop, stop, isThrown };
}

export default ThrowDetector;