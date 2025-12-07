export interface PlayListItem {
  url: string;
  muted: boolean;
  isInteractive: boolean;
  callFunction?: "FaceTracking" | "ThrowDetector" | "Segmentation";
}

export type PlayListDict = Record<string, { sequence: PlayListItem[] }>;

export const PLAY_LIST: PlayListDict = {
  "たけるくんのお話": {
    sequence: [
      {
        url: "/assets/movie/sea/coast.mp4",
        muted: false,
        isInteractive: true,
        callFunction: "ThrowDetector",
      },
      {
        url: "/assets/movie/sea/falls_ball.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/approaching_plankton.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/come_plankton.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/hurt_stomach.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/eat_plankton_text.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/cg_crossing_voice.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/cg_crossing_fish.mp4",
        muted: false,
        isInteractive: true,
        callFunction: "FaceTracking",
      },
      {
        url: "/assets/movie/sea/cg_crossing_non.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/how_should_do.mp4",
        muted: false,
        isInteractive: false,
      },
      {
        url: "/assets/movie/sea/最後の問いかけテキスト.mp4",
        muted: false,
        isInteractive: false,
      },
    ],
  },
  // 例: 別タイトルを追加する場合
  // "another-title": { sequence: [...] }
};

export function getSequence(title: string): PlayListItem[] {
  return PLAY_LIST[title]?.sequence ?? [];
}
