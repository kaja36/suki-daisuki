// --- 顔振り検知の設定値 ---
export const CONFIG = {
  THRESHOLD: 4, // 検知する角度
  TIMEOUT: 800, // 連続検知の猶予時間
  REQUIRED_CROSS: 2, // 往復回数
  REQUIRED_SHAKE_COUNT: 10, // 何回でイベントが発火するか

  // ★追加: 追従スピード (0.0 〜 1.0)
  // 小さいほどゆっくり追従（補正が強力）、大きいほど敏感
  // 0.05 くらいが「姿勢変更にはついていくが、首振りには反応する」絶妙なライン
  DRIFT_FACTOR: 0.01,
};

// 状態管理用のインタフェース
export interface FaceShakeState {
  baseYaw: number| null; // 基準となる角度（キャリブレーション用）
  lastZone: "LEFT" | "CENTER" | "RIGHT"; // 前回の位置 (LEFT, CENTER, RIGHT)
  crossCount: number; // 中心をまたいだ回数
  lastCrossTime: number; // 最後にまたいだ時間
}
