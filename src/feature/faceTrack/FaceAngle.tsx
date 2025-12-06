

export const getFaceAngle = (matrixData: number[]) => {
    if (matrixData.length === 0) return null;

    // Index,0,4,8,12 (X)
    // Index,1,5,9,13 (Y)
    // Index,2,6,10,14 (Z)
    // Index,3,7,11,15
    const m00 : number = matrixData[0];
    const m01 : number = matrixData[4];
    const m02 : number = matrixData[8];  // sin(Yaw)成分に関与
    // const m10 : number = matrixData[1];
    // const m11 : number = matrixData[5];
    const m12 : number = matrixData[9];  // sin(Pitch)成分に関与
    const m22 : number = matrixData[10]; // cos(Pitch)成分に関与
    const pitch : number = Math.atan2(m12, m22);

    const c2 = Math.sqrt(m00 * m00 + m01 * m01); 
    const yaw : number = Math.atan2(-m02, c2);

    const roll : number = Math.atan2(m01, m00);

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

export const isShakeFace = (prevYaw: number | null, currYaw: number, threshold: number) => {
    if (prevYaw === null) return false;

    return Math.abs(currYaw - prevYaw) > threshold;
}