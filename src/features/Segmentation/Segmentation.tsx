import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';
import { CAMERA_CONF } from '../../config/CameraConf';


function Segmentation() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const imageSegmenterRef = useRef<ImageSegmenter | null>(null);

  // MediaPipe初期化
  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      imageSegmenterRef.current = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
          delegate: "GPU"
        },
        outputCategoryMask: true,
        outputConfidenceMasks: false,
        runningMode: "VIDEO"
      });
      setIsReady(true);
    };
    init();
  }, []);

  // 検出ループ
  const renderLoop = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => {
    if (!videoRef.current || !imageSegmenterRef.current || !canvasRef.current) {
      if (!isReady) requestAnimationFrame(() => renderLoop(videoRef, canvasRef));
      return;
    }

    if (videoRef.current.videoWidth > 0) {
      const startTimeMs = performance.now();
      const result = imageSegmenterRef.current.segmentForVideo(videoRef.current, startTimeMs);

      // セグメンテーション結果の描画
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && result.categoryMask) {
        const imageData = ctx.createImageData(CAMERA_CONF.width, CAMERA_CONF.height);
        const mask = result.categoryMask.getAsUint8Array();

        for (let i = 0; i < mask.length; i++) {
          const j = i * 4;
          const value = mask[i] * 50;
          imageData.data[j] = value;
          imageData.data[j + 1] = value;
          imageData.data[j + 2] = value;
          imageData.data[j + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
      }
    }

    requestAnimationFrame(() => renderLoop(videoRef, canvasRef));
  };

  // 停止
  const stop = () => {
    if (imageSegmenterRef.current) {
      imageSegmenterRef.current.close();
      imageSegmenterRef.current = null;
    }
  };

  return { renderLoop, stop };
}

export default Segmentation;