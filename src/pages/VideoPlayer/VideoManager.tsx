import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getSequence, type PlayListItem } from '../../config/PlayList';
import { FaceTracking } from '../../features/faceTrack/FaceTracking';
import Segmentation from '../../features/Segmentation/Segmentation';
import ThrowDetector from '../../features/throw/ThrowDetector';
import { startStream, stopStream } from '../../hooks/Camera';
import { CAMERA_CONF } from '../../config/CameraConf';

type VideoManagerProps = { movieTitle: string };

function VideoManager({ movieTitle }: VideoManagerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const startedRef = useRef<boolean>(false); // renderLoop二重起動防止
    const advancingRef = useRef<boolean>(false); // シーン遷移の二重発火防止
    const FaceTrackingRenderLoop = FaceTracking().renderLoop;
    const SegmentationRenderLoop = Segmentation().renderLoop;
    const ThrowDetectorRenderLoop = ThrowDetector().renderLoop;

    const sceneList = useMemo(() => {
        const sequence = getSequence(movieTitle);
        console.log(`Loaded sequence for title "${movieTitle}":`, sequence);
        return sequence;
    }, [movieTitle]);

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    // インデックス変更時に遷移ガード解除
    useEffect(() => {
        advancingRef.current = false;
    }, [currentIndex]);

    const [prevTitle, setPrevTitle] = useState(movieTitle);
    if (movieTitle !== prevTitle) {
        setPrevTitle(movieTitle);
        setCurrentIndex(0);
    }

    const existUrl = (): string => {
        const url = sceneList ? sceneList.length > currentIndex ? sceneList[currentIndex].url : '' : ''
        if (!url) {
            console.warn('No URL found for the current scene.');
            setWarningMessage('No URL found for the current scene.');
            return '';
        }
        return url;
    }

    const prepareDetecter = async (callFunction: "FaceTracking" | "ThrowDetector" | "Segmentation" | undefined) => {
        if (!callFunction) return;
        if (startedRef.current) {
            // すでに開始済みなら再起動しない
            return;
        }

        // カメラストリームを開始
        await startStream({
            width: CAMERA_CONF.width,
            height: CAMERA_CONF.height,
            videoRef
        });
        const el = videoRef.current;
        console.log('Video element after startStream:', el);
        if (!el) return;
        if (!el.srcObject) {
            console.warn('Camera srcObject is missing after startStream');
            return;
        }
        // ビデオが読み込まれたらトラッキング開始
        el.onloadedmetadata = async () => {
            const v = videoRef.current;
            if (v) {
                try { await v.play(); } catch (e) { console.warn('video play failed', e); }

                let renderLoop: ((videoRef: React.RefObject<HTMLVideoElement | null>, canvasRef: React.RefObject<HTMLCanvasElement | null>, observeAction?: () => void) => void) | undefined;
                if (callFunction === "FaceTracking") {
                    renderLoop = FaceTrackingRenderLoop;
                } else if (callFunction === "ThrowDetector") {
                    renderLoop = ThrowDetectorRenderLoop;
                } else if (callFunction === "Segmentation") {
                    renderLoop = SegmentationRenderLoop;
                }

                const observeAction = () => setNextScene();
                if (!renderLoop) {
                    console.warn(`No renderLoop resolved for callFunction: ${callFunction}`);
                    return;
                }
                // 一度だけ開始
                if (!startedRef.current) {
                    console.log(`Starting renderLoop for ${callFunction}`);
                    startedRef.current = true;
                    renderLoop(videoRef, canvasRef, observeAction);
                }
            }
        };
    }

    const setNextScene = () => {
        if (advancingRef.current) {
            return;
        }
        advancingRef.current = true;
        // 次のシーンへ移動
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            console.log("Moving to next scene", nextIndex);
            if (sceneList && nextIndex < sceneList.length) {
                startedRef.current = false; // インタラクティブシーンならrenderLoopを再起動可能にする
                if (!sceneList[nextIndex].isInteractive) {
                    stopStream(videoRef);
                }
                return nextIndex;
            } else {
                return prevIndex; // シーンがなければインデックスを変更しない
            }
        });
    }

    return (
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
            {warningMessage ? warningMessage :
                <video
                    src={existUrl()}
                    controls={false}
                    autoPlay
                    playsInline
                    muted={sceneList ? sceneList[currentIndex].muted : true}
                    loop={sceneList ? sceneList[currentIndex].isInteractive : false}
                    onLoadedMetadata={sceneList ? () => prepareDetecter(sceneList[currentIndex].callFunction as unknown as ("FaceTracking" | "ThrowDetector" | "Segmentation" | undefined)) : undefined}
                    onEnded={() => setNextScene()}
                    style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
                ></video>
            }
        </div>
    )
}

export default VideoManager;