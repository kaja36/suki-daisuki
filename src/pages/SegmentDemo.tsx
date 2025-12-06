import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import './App.css'

function SegmentDemo() {
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageSegmenterRef = useRef<ImageSegmenter | null>(null);

    // ビデオの設定
    const video = {
    width: 640,
    height: 480
  };

  // MediaPipe ImageSegmenterの初期化
  async function createImageSegmenter() {
    // モデル取得
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // ImageSegmenterの作成
    const imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-assets/selfie_multiclass_256x256.tflite"
      },
      outputCategoryMask: true,
      outputConfidenceMasks: false,
      runningMode: "VIDEO"
    });
    
    imageSegmenterRef.current = imageSegmenter;
  }

  // 検出、描画ループ(フレーム毎)
  async function renderLoop(): Promise<void> {
    if (!videoRef.current || !imageSegmenterRef.current || !canvasRef.current) return;

    const startTimeMs = performance.now();
    const result = imageSegmenterRef.current.segmentForVideo(videoRef.current, startTimeMs);
    
    // セグメンテーション結果の描画
    const ctx = canvasRef.current.getContext('2d');
    if (ctx && result.categoryMask) {
      const imageData = ctx.createImageData(video.width, video.height);
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

    requestAnimationFrame(() => {
      renderLoop();
    });
  }

  // カメラ初期化とクリーンアップ
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: false, 
          video: { width: video.width, height: video.height } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            await createImageSegmenter();
            renderLoop();
          };
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("カメラへのアクセスに失敗しました");
      }
    };

    initializeCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current!.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        id="local-video"
        autoPlay
        playsInline
        muted
        width={video.width}
        height={video.height}
      />
      <canvas
        ref={canvasRef}
        width={video.width}
        height={video.height}
      />
      {error && <div className="error">{error}</div>}
    </>
  )
}

export default SegmentDemo
