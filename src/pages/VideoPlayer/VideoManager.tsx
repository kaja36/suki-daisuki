import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getSequence } from '../../config/PlayList';
import { FaceTracking } from '../../features/faceTrack/FaceTracking';
import Segmentation from '../../features/Segmentation/Segmentation';
import ThrowDetector from '../../features/throw/ThrowDetector';
import { startStream, stopStream } from '../../hooks/Camera';
import { CAMERA_CONF } from '../../config/CameraConf';
import { useNavigate } from 'react-router-dom';

type VideoManagerProps = { movieTitle: string };

function VideoManager({ movieTitle }: VideoManagerProps) {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const startedRef = useRef<boolean>(false); // renderLoop二重起動防止
        const advancingRef = useRef<boolean>(false); // シーン遷移の二重発火防止
            // FaceTracking() を複数回呼ぶと別インスタンスになり、shakeCount が伝播しないため1回だけに統一
            const faceTracking = FaceTracking();
            const FaceTrackingRenderLoop = faceTracking.renderLoop;
            const shakeCount = faceTracking.shakeCount;
            const SegmentationRenderLoop = Segmentation().renderLoop;
            const ThrowDetectorRenderLoop = ThrowDetector().renderLoop;

        const sceneList = useMemo(() => {
            const sequence = getSequence(movieTitle);
            console.log(`Loaded sequence for title "${movieTitle}":`, sequence);
            return sequence;
        }, [movieTitle]);

        const [currentIndex, setCurrentIndex] = useState<number>(0);
        const [warningMessage, setWarningMessage] = useState<string | null>(null);
        const [previewVisible, setPreviewVisible] = useState<boolean>(false);

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
            const url = sceneList ? (sceneList.length > currentIndex ? sceneList[currentIndex].url : '') : '';
            if (!url) {
                console.warn('No URL found for the current scene.');
                setWarningMessage('No URL found for the current scene.');
                return '';
            }
            return url;
        };

        const prepareDetecter = async (callFunction: "FaceTracking" | "ThrowDetector" | "Segmentation" | undefined) => {
            if (!callFunction) return;
            if (startedRef.current) return; // すでに開始済みなら再起動しない

            await startStream({ width: CAMERA_CONF.width, height: CAMERA_CONF.height, videoRef });
            const el = videoRef.current;
            console.log('Video element after startStream:', el);
            if (!el) return;
            if (!el.srcObject) {
                console.warn('Camera srcObject is missing after startStream');
                return;
            }
            setPreviewVisible(true);

            el.onloadedmetadata = async () => {
                const v = videoRef.current;
                if (!v) return;
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
                if (!startedRef.current) {
                    console.log(`Starting renderLoop for ${callFunction}`);
                    startedRef.current = true;
                    renderLoop(videoRef, canvasRef, observeAction);
                }
            };
        };

        const setNextScene = () => {
            if (advancingRef.current) return;
            advancingRef.current = true;
            setCurrentIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;
                console.log('Moving to next scene', nextIndex);
                if (sceneList && nextIndex < sceneList.length) {
                    startedRef.current = false;
                    if (!sceneList[nextIndex].isInteractive) {
                        stopStream(videoRef);
                        setPreviewVisible(false);
                    }
                    return nextIndex;
                }
                navigate('/')
                return prevIndex;
            });
        };

        return (
            <div style={{ position: 'relative' }}>
                {sceneList ? (sceneList[currentIndex].url === "/assets/movie/sea/cg_crossing_voice.mp4"  || sceneList[currentIndex].url === "/assets/movie/sea/cg_crossing_fish.mp4" ?  (
                    <img
                        src="/assets/prastic/white.png"
                        alt="overlay"
                        // 変更理由: return内だけでザワザワ表現を適用するため、
                        // shakeCountから決定的な擬似乱数を生成し、
                        // translate/rotateを微小に変化させる（SRP: UIのみ）。
                        style={{
                            position: 'absolute',
                            height: '80%',
                            left: '50%',
                            top: '50%',
                            transform: (() => {
                                const amp = 10; // 変位最大(px)
                                const rotAmp = 5; // 回転最大(deg)
                                const seed = shakeCount ?? 0;
                                const rand = (s: number) => {
                                    const x = Math.sin(s * 12.9898) * 43758.5453;
                                    return x - Math.floor(x);
                                };
                                const r1 = rand(seed + 1);
                                const r2 = rand(seed + 2);
                                const r3 = rand(seed + 3);
                                const dx = (r1 * 2 - 1) * amp;
                                const dy = (r2 * 2 - 1) * amp;
                                const rot = (r3 * 2 - 1) * rotAmp;
                                return `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
                            })(),
                            transition: 'transform 70ms ease',
                            pointerEvents: 'none',
                            zIndex: 3,
                        }}
                    />
                ) : null ): null}
                {/* プレビュービデオ（カメラ）: 左下に重ねて表示 */}
                <video
                    ref={videoRef}
                    style={{
                        position: 'absolute',
                        left: '8px',
                        bottom: '8px',
                        width: '200px',
                        height: '150px',
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        transform: 'scaleX(-1)',
                        zIndex: 2,
                        backgroundColor: '#000',
                        pointerEvents: 'none',
                        opacity: previewVisible ? 1 : 0,
                    }}
                />
                {/* メイン動画 */}
                {warningMessage ? warningMessage : (
                    <video
                        src={existUrl()}
                        controls={false}
                        autoPlay = {true}
                        playsInline
                        muted={sceneList ? sceneList[currentIndex].muted : true}
                        loop={sceneList ? sceneList[currentIndex].isInteractive : false}
                        onLoadedMetadata={sceneList ? (e) => {
                            try { e.currentTarget.currentTime = 0; } catch (err) { console.warn('Failed to reset currentTime', err); }
                            prepareDetecter(sceneList[currentIndex].callFunction as unknown as ("FaceTracking" | "ThrowDetector" | "Segmentation" | undefined));
                        } : undefined}
                        onEnded={() => setNextScene()}
                        style={{ width: '100%', height: '100%', zIndex: 1 }}
                    />
                )}
            </div>
        );
    }

    export default VideoManager;