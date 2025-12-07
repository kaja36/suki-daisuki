import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useThrowLogic } from "./useThrowLogic";

function ThrowDetector() {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const { isThrown, checkThrow } = useThrowLogic();
  const [isReady, setIsReady] = useState<boolean>(false);
  const activeRef = useRef<boolean>(false); // ループ稼働状態
  const rafIdRef = useRef<number | null>(null); // rAF管理
  const observeActionRef = useRef<(() => void) | undefined>(undefined); // 直近のobserveAction保持


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

  useEffect(() => {
    if (isThrown && activeRef.current && observeActionRef.current) {
      console.log("Throw detected, stopping detector.");
      stop(observeActionRef.current);
    }
  }, [isThrown]);

  // 検出ループ
  const renderLoop = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    canvasRef?: React.RefObject<HTMLCanvasElement | null>,
    observeAction?: () => void
  ) => {
    observeActionRef.current = observeAction;
    activeRef.current = true;
    // 変更理由: isReady は状態反映タイミングにより古い値になる可能性がある。
    // 実際に使用可能かどうかは poseLandmarkerRef.current の有無で判定するのが安全。
    // 単一責任: UI向けフラグとして isReady は維持するが、ループの可否は参照の存在で判断する。
    if (!videoRef.current || !poseLandmarkerRef.current) {
      console.log("Waiting for video or poseLandmarker.", { hasVideo: !!videoRef.current, hasPose: !!poseLandmarkerRef.current, isReady });
      rafIdRef.current = requestAnimationFrame(() => renderLoop(videoRef, canvasRef, observeAction));
      return;
    }

    if (videoRef.current.videoWidth > 0) {
      const startTimeMs = performance.now();
      const result = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      // console.log("PoseLandmarker result:", result);
      // 骨格が見つかったら判定ロジックへ渡す
      if (result.landmarks && result.landmarks.length > 0) {
        checkThrow(result.landmarks[0]);
      }
    }
    rafIdRef.current = requestAnimationFrame(() => renderLoop(videoRef, canvasRef, observeAction));
  };

  // 停止
  const stop = (observeAction?: () => void) => {
    activeRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (observeAction) {
      observeAction();
    }
  };

  // 完全解放（不要時のみ）
  const dispose = () => {
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }
    setIsReady(false);
  };

  return { renderLoop, stop, dispose, isThrown };
}

export default ThrowDetector;