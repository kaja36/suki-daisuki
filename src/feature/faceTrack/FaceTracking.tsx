import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import React, { useEffect, useState } from 'react'
import { getFaceAngle } from './FaceAngle';

export interface Angle {
    pitch: number; // 上下
    yaw: number;   // 左右
    roll: number;  // 回転
}

export const FaceTracking = () =>  {
    const faceLandmarkerRef = React.useRef<FaceLandmarker | null>(null);
    const [AngleLog, setAngleLog] = useState<Angle | null>(null);

    // MediaPipe初期化
    useEffect(() => {
        const init = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numFaces: 1,
                    minFaceDetectionConfidence: 0.5,
                    minFacePresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                    outputFacialTransformationMatrixes: true,
                });
        };
        init();
    }, []);

    // 顔ランドマーク検出と描画ループ
    // 検出ループ
    const renderLoop = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
        if (!videoRef.current || !faceLandmarkerRef.current) return;

        if (videoRef.current.videoWidth > 0) {
            const startTimeMs = performance.now();
            const result = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
            console.log(result);
            if (result.facialTransformationMatrixes.length > 0) {
                const angle: Angle | null = getFaceAngle(result.facialTransformationMatrixes[0].data);
                setAngleLog(angle);
            }
        }
        requestAnimationFrame(() => renderLoop(videoRef));
    };

    // 停止
    const stop = () => {
        if (faceLandmarkerRef.current) {
            faceLandmarkerRef.current.close();
            faceLandmarkerRef.current = null;
        }
    }

    return {renderLoop, stop, AngleLog}; // コンポーネントは何も描画しない場合は戻り値が必要
}