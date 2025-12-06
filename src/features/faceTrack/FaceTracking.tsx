import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import React, { useEffect, useRef, useState } from 'react'
import { getFaceAngle, isShakeFace } from './FaceAngle';
import type { FaceShakeState } from '../../config/FaceTrackingConf';

export interface Angle {
    pitch: number; // 上下
    yaw: number;   // 左右
    roll: number;  // 回転
}


export const FaceTracking = () => {
    const faceLandmarkerRef = React.useRef<FaceLandmarker | null>(null);
    const [AngleLog, setAngleLog] = useState<Angle | null>(null);
    const [shakeCount, setShakeCount] = useState<number>(0);
    const [isReady, setIsReady] = useState<boolean>(false);

    // 状態管理の初期化
    const faceShakeStateRef = useRef<FaceShakeState>({
        baseYaw: null,       // 基準となる角度（キャリブレーション用）
        lastZone: "CENTER",  // 前回の位置 (LEFT, CENTER, RIGHT)
        crossCount: 0,       // 中心をまたいだ回数
        lastCrossTime: 0     // 最後にまたいだ時間
    });

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
            setIsReady(true);
        };
        init();
    }, []);

    // 顔ランドマーク検出と描画ループ
    // 検出ループ
    const renderLoop = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
        if (!videoRef.current || !faceLandmarkerRef.current) {
            if (!isReady) requestAnimationFrame(() => renderLoop(videoRef));
            return;
        }

        if (videoRef.current.videoWidth > 0) {
            const startTimeMs = performance.now();
            const result = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
            if (result.facialTransformationMatrixes.length > 0) {
                const angle = getFaceAngle(result.facialTransformationMatrixes[0].data)
                setAngleLog(angle);
                const isShaking = isShakeFace(angle!.yaw, faceShakeStateRef);
                if (isShaking) {
                    setShakeCount(prevCount => prevCount + 1);
                }
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

    return { renderLoop, stop, AngleLog, shakeCount }; // コンポーネントは何も描画しない場合は戻り値が必要
}