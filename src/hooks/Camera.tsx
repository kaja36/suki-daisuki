import React from 'react';

/*
  旧実装（履歴用にコメントアウト）

  import React from 'react'

  interface initCameraParam {
    width: number;
    height: number;
    videoRef: React.RefObject<HTMLVideoElement>;
  }

  function Camera() {
    const createCamera = async ({width, height, videoRef}: initCameraParam) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: width, height: height },
          audio: false
        });
        videoRef.current.srcObject = stream;
        return videoRef;
      } catch (e) {
        console.error("カメラ作成エラー:", e);
        return null;
      }
    }

    const startCamera = async ({width, height, videoRef}: initCameraParam) => {
      try {
        if (videoRef.current) {
          videoRef.current.onloadeddata = () => {
            setIsCameraReady(true);
            renderLoop();
          };
        }
      } catch (e) {
        console.error("カメラ起動エラー:", e);
      }
    };

    return {createCamera};
  }

  export default Camera
*/

export interface CameraInitOptions {
  width: number;
  height: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

// カメラのストリームを開始し、video 要素にアタッチする
export async function startStream({ width, height, videoRef }: CameraInitOptions): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width, height },
      audio: false,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return stream;
  } catch (e) {
    console.error('カメラのストリーム取得に失敗:', e);
    return null;
  }
}

// カメラのストリームを停止し、video 要素から切り離す
export function stopStream(videoRef: React.RefObject<HTMLVideoElement | null>): void {
  const stream = videoRef.current?.srcObject as MediaStream | null;
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
}
