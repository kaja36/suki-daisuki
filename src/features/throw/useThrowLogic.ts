import { useState, useCallback, useRef } from 'react';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// 調整パラメーター
const THROW_THRESHOLD = 0.05; // 手首の移動距離の閾値
const WRIST_HEIGHT_THRESHOLD = 0.6; // 手首の高さの閾値 (0.0:頭頂, 1.0:足元)

export const useThrowLogic = () => {
  const [isThrown, setIsThrown] = useState(false);
  const prevWristRef = useRef<NormalizedLandmark | null>(null);

  const checkThrow = useCallback((landmarks: NormalizedLandmark[]) => {
    if (isThrown) return;

    const rightWrist = landmarks[16]; // 右手首のランドマーク

    // 1. 手首の検出精度の確認
    if ((rightWrist.visibility ?? 0) < 0.5) {
        prevWristRef.current = null; 
        return;
    }
    // 2. 手首の高さの判定
    if (rightWrist.y > WRIST_HEIGHT_THRESHOLD) {
        prevWristRef.current = rightWrist;
        return;
    }
    
    // 3. 手首の移動量の計算と判定
    if (prevWristRef.current) {
      const dx = rightWrist.x - prevWristRef.current.x;
      const dy = rightWrist.y - prevWristRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 移動距離が閾値を超えたらポイ捨てと判定
      if (distance > THROW_THRESHOLD) {
        setIsThrown(true);
        setTimeout(() => setIsThrown(false), 3000);
      }
    }

    prevWristRef.current = rightWrist;
  }, [isThrown]);

  return { isThrown, checkThrow };
};