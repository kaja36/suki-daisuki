export interface PlayListItem {
  url: string;
  muted: boolean;
  isInteractive: boolean;
  callFunction?: "FaceTracking" | "ThrowDetector" |  "Segmentation";
}

export type PlayListDict = Record<string, { sequence: PlayListItem[] }>;

export const PLAY_LIST: PlayListDict = {
  "title": {
    sequence: [
      {
        url: "/movie/海岸.mp4",
        muted: true,
        isInteractive: false,
      },
      {
        url: "/movie/海の中.mp4",
        muted: true,
        isInteractive: true, // インタラクティブならtrueに
        callFunction: "FaceTracking", // 顔追跡機能を呼び出す
      },
      {
        url: "/movie/海岸.mp4",
        muted: true,
        isInteractive: false,
      },
      {
        url: "/movie/海の中.mp4",
        muted: true,
        isInteractive: true, // インタラクティブならtrueに
        callFunction: "FaceTracking", // 顔追跡機能を呼び出す
      },
      {
        url: "/movie/海の中.mp4",
        muted: true,
        isInteractive: true, // インタラクティブならtrueに
        callFunction: "ThrowDetector", // 顔追跡機能を呼び出す
      },
    ],
  },
  // 例: 別タイトルを追加する場合
  // "another-title": { sequence: [...] }
};

export function getSequence(title: string): PlayListItem[] {
  return PLAY_LIST[title]?.sequence ?? [];
}