# 概要
# 構造
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
