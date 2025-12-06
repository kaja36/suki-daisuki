import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import React, { useEffect, useRef, useState } from 'react'
import { getFaceAngle, isShakeFace } from './FaceAngle';
import { CONFIG, type FaceShakeState } from '../../config/FaceTrackingConf';

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
    const activeRef = useRef<boolean>(false); // ループの稼働状態
    const rafIdRef = useRef<number | null>(null); // rAF管理

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
    const renderLoop = (videoRef: React.RefObject<HTMLVideoElement | null>, canvasRef?: React.RefObject<HTMLCanvasElement | null>, observeAction?: () => void) => {
        activeRef.current = true;
        if (!videoRef.current || !faceLandmarkerRef.current || !isReady) {
            rafIdRef.current = requestAnimationFrame(() => renderLoop(videoRef, canvasRef, observeAction));
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
                    setShakeCount(prevCount => {
                        const next = prevCount + 1;
                        console.log("Shaking detected", next);
                        if (observeAction && next >= CONFIG.REQUIRED_SHAKE_COUNT) {
                            stop(observeAction);
                        }
                        return next;
                    });
                }
            }
        }
        rafIdRef.current = requestAnimationFrame(() => renderLoop(videoRef, canvasRef, observeAction));
    };

    // 停止
    const stop = (observeAction?: () => void) => {
        activeRef.current = false;
        setShakeCount(0);
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        if (observeAction) {
            observeAction();
        }
    }

    // 完全解放（最終的に不要になった時のみ呼ぶ）
    const dispose = () => {
        if (faceLandmarkerRef.current) {
            faceLandmarkerRef.current.close();
            faceLandmarkerRef.current = null;
        }
        setIsReady(false);
    }

    return { renderLoop, stop, dispose, AngleLog, shakeCount }; // コンポーネントは何も描画しない場合は戻り値が必要
}