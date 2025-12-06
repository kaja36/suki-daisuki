import { CONFIG, type FaceShakeState } from "../../config/FaceTrackingConf";

export const getFaceAngle = (matrixData: number[]) => {
    if (matrixData.length === 0) return null;

    // Index,0,4,8,12 (X)
    // Index,1,5,9,13 (Y)
    // Index,2,6,10,14 (Z)
    // Index,3,7,11,15
    const m00: number = matrixData[0];
    const m01: number = matrixData[4];
    const m02: number = matrixData[8];  // sin(Yaw)成分に関与
    // const m10 : number = matrixData[1];
    // const m11 : number = matrixData[5];
    const m12: number = matrixData[9];  // sin(Pitch)成分に関与
    const m22: number = matrixData[10]; // cos(Pitch)成分に関与
    const pitch: number = Math.atan2(m12, m22);

    const c2 = Math.sqrt(m00 * m00 + m01 * m01);
    const yaw: number = Math.atan2(-m02, c2);

    const roll: number = Math.atan2(m01, m00);

    const toDeg = (rad: number) => rad * (180 / Math.PI);

    return {
        pitch: toDeg(pitch), // 上下
        yaw: toDeg(yaw),   // 左右
        roll: toDeg(roll)   // 回転
    };
};

export const getFacePosition = (matrixData: number[]) => {
    if (matrixData.length === 0) return null;

    const m03 = matrixData[12]; // X位置
    const m13 = matrixData[13]; // Y位置
    const m23 = matrixData[14]; // Z位置

    return { x: m03, y: m13, z: m23 };
}


export const isShakeFace = (matrix: number[], stateRef: React.RefObject<FaceShakeState>) => {
    const rawAngles = getFaceAngle(matrix);
    if (!rawAngles) {
        stateRef.current.baseYaw = null;
        return false;
    }

    // 1. 【初期化】 まだ基準がないなら今の角度を入れる
    if (stateRef.current.baseYaw === null) {
        stateRef.current.baseYaw = rawAngles.yaw;
        return;
    }

    // 2. 【ここが重要！】 基準点を、現在の角度に少しだけ近づける（ドリフト補正）
    // これにより、baseYaw は「数秒前の平均的な顔の向き」になり続けます
    const currentBase = stateRef.current.baseYaw;
    stateRef.current.baseYaw = (currentBase * (1 - CONFIG.DRIFT_FACTOR)) + (rawAngles.yaw * CONFIG.DRIFT_FACTOR);

    // 3. 相対角度の計算
    const relativeYaw = rawAngles.yaw - stateRef.current.baseYaw;

    let currentZone: "LEFT" | "CENTER" | "RIGHT" = "CENTER";
    if (relativeYaw > CONFIG.THRESHOLD) currentZone = "LEFT";
    else if (relativeYaw < -CONFIG.THRESHOLD) currentZone = "RIGHT";

    // 4. 【首振り検知ロジック】
    const state = stateRef.current;
    const now = Date.now();

    // タイムアウト処理（振るのが遅すぎたらリセット）
    if (now - state.lastCrossTime > CONFIG.TIMEOUT) {
        state.crossCount = 0;
    }

    // ゾーンが変わったかチェック（CENTERは無視して、左右の変化を見る）
    // 「左→右」または「右→左」に動いた瞬間だけカウント
    if (currentZone !== "CENTER" && currentZone !== state.lastZone) {

        // カウントアップ
        state.crossCount++;
        state.lastCrossTime = now;
        state.lastZone = currentZone;

        console.log(`スイング検知: ${state.crossCount}回目`);

        // 規定回数（例:3回）振ったら発火！
        if (state.crossCount >= CONFIG.REQUIRED_CROSS) {

            // アクション実行
            // doSomething();

            // リセット（連続発火防止）
            state.crossCount = 0;
            state.lastZone = "CENTER"; // 一旦落ち着かせる
            return true;
        }
    }
    return false;

}