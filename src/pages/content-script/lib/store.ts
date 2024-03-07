import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type PlaybackState = "loading tts" | "playing" | "paused" | "done";
type TTSState = {
  completedChunks: number;
  totalChunks: number;
  state: "not started" | "pending" | "done";
};

type Config = {
  highlight: {
    color?: string;
    backgroundColor?: string;
    underlineColor?: string;
    noUnderline?: boolean;
    noHighlight: boolean;
  };
  scrollToView: boolean;
};

export const usePlaybackStore = create<{
  currentChunkIndex: number;
  playbackQueue: { index: number; dataUrl: string }[];
  isPlaying: boolean;
  totalChunkLength: number;
  textChunks: string[];
  showController: boolean;
  playbackState: PlaybackState;
  ttsState: TTSState;
  config: Config;

  // @ts-ignore
  highlight: Highlight | null;

  addToPlaybackQueue: (chunks: { index: number; dataUrl: string }[]) => void;
  togglePlayback: () => void;
  previousChunk: () => void;
  nextChunk: () => void;
}>()(
  subscribeWithSelector((set, get) => ({
    currentChunkIndex: 0,
    totalChunkLength: 0,
    playbackQueue: [],
    textChunks: [],
    isPlaying: false,
    showController: false,
    playbackState: "loading tts",
    ttsState: {
      completedChunks: 0,
      totalChunks: 0,
      state: "not started",
    },
    highlight: null,
    config: {
      highlight: {
        noHighlight: false,
      },
      scrollToView: true,
    },
    addToPlaybackQueue: (chunks) => {
      const newChunks = [...get().playbackQueue, ...chunks];
      const sortedChunks = newChunks.sort((a, b) => a.index - b.index);

      const newChunksLength = chunks.length;

      const completedChunks = get().ttsState.completedChunks + newChunksLength;

      console.log("addToPlaybackQueue", {
        completedChunks,
      });

      set({
        playbackQueue: sortedChunks,
        ttsState: { ...get().ttsState, completedChunks },
      });
    },
    togglePlayback: () => {
      set({ isPlaying: !get().isPlaying });
    },
    previousChunk: () => {
      const currentChunkIndex = get().currentChunkIndex;
      if (currentChunkIndex > 0) {
        set({ currentChunkIndex: currentChunkIndex - 1 });
      }
    },
    nextChunk: () => {
      const currentChunkIndex = get().currentChunkIndex;
      if (currentChunkIndex < get().playbackQueue.length - 1) {
        set({ currentChunkIndex: currentChunkIndex + 1 });
      }
    },
  }))
);
