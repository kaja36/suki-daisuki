# たちばみ
## 概要
社会問題を当事者の目線に立って考える。『知識としての社会課題』を『体験としての自分事』に変えるプロダクトである。  
Blenderによって表現されたストーリを体験者の動作を検知することで進めていく。  

<img width="300" height="300" alt="throw-motion" src="https://github.com/user-attachments/assets/37a36ab4-6be2-49f0-9c8f-b0b353cd7d7a" />
<img width="300" height="300" alt="face-shake-motion" src="https://github.com/user-attachments/assets/21fb3fc0-7aa9-4510-9b37-207a091fba09" />


## 全体構造
- public: 素材
- src
  - ルート: `App.tsx`, `main.tsx`, 共通スタイル `App.css`, `index.css`
  - `assets/`: アセット置き場
  - `components/StoryIcon/`: ストーリーアイコンのコンポーネントとCSS
  - `config/`: 設定群  
    - `CameraConf.ts`, `FaceTrackingConf.ts`, `PlayList.ts`, `ThrowConf.ts`
  - `features/`: 機能別ロジック  
    - `faceTrack/`: `FaceAngle.tsx`, `FaceTracking.tsx`（顔向き・トラッキング）  
    - `Segmentation/`: `Segmentation.tsx`（セグメンテーション）  
    - `throw/`: `ThrowDetector.tsx`, `useThrowLogic.ts`（投擲検知ロジック）
  - `hooks/`: カメラ用カスタムフック `Camera.tsx`
  - `pages/`: ページ単位
    - `Demo/`: デモ画面 (`Demo.tsx`, `FaceDemo.tsx`, `SegmentDemo.tsx`, `ThrowDemo.tsx`)
    - `Home/`: トップページ (`index.tsx`, スタイル `Home.css`)
    - `VideoPlayer/`: 動画プレイヤー (`index.tsx`, `VideoManager.tsx`, スタイル `VideoPlayer.css`)
