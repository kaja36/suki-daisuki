import React, { useEffect } from 'react'
import { startStream } from '../hooks/Camera';
import { CAMERA_CONF } from '../config/CameraConf';
import ThrowDetector from "../features/throw/ThrowDetector"

function ThrowDemo() {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isCameraReady, setIsCameraReady] = React.useState(false);
    const { renderLoop, stop, isThrown } = ThrowDetector();

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
                    setIsCameraReady(true);
                    renderLoop(videoRef);
                }
            };
        };
        init();
        return () => {
            active = false;
        };
    }, []);


    return (
        <div style={{ position: "relative", width: 640, height: 480, border: "5px solid #00f", margin: "20px auto" }}>
            <div style={{
                position: "absolute", top: 10, left: 10,
                background: "rgba(0,0,0,0.7)", color: "white", padding: "10px", zIndex: 10,
                fontSize: "20px", fontWeight: "bold"
            }}>
                ステータス: {isCameraReady ? "監視中" : "起動中"}<br />
                判定: {isThrown ? "ポイ捨てした" : "待機中"}
            </div>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
            />
        </div>
    )
}

export default ThrowDemo