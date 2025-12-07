import React, { useEffect, useRef } from "react";
import { CAMERA_CONF } from "../../config/CameraConf";
import { startStream } from "../../hooks/Camera";
import Segmentation from "../../features/Segmentation/Segmentation";

function SegmentDemo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { renderLoop } = Segmentation();

    // カメラとトラッキングの初期化
    useEffect(() => {
        let active = true;

        const init = async () => {
            // カメラストリームを開始
            const stream = await startStream({
                width: CAMERA_CONF.width,
                height: CAMERA_CONF.height,
                videoRef
            });

            if (!active || !stream || !videoRef.current) return;

            // ビデオが読み込まれたらトラッキング開始
            videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                    videoRef.current.play();
                    renderLoop(videoRef, canvasRef);
                }
            };
        };

        init();

        return () => {
            active = false;
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current!.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div>
            <video
                ref={videoRef}
                id="local-video"
                autoPlay
                playsInline
                muted
                width={CAMERA_CONF.width}
                height={CAMERA_CONF.height}
                style={{
                    width: '640px',
                    height: '480px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    transform: 'scaleX(-1)'
                }}
            />
            <canvas
                ref={canvasRef}
                width={CAMERA_CONF.width}
                height={CAMERA_CONF.height}
                style={{
                    width: '640px',
                    height: '480px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    transform: 'scaleX(-1)'
                }}
            />
        </div>
    )
}

export default SegmentDemo
