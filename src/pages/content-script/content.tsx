import { Readability } from "@mozilla/readability";

import { extComm } from "../comm";
import { textToChunks } from "./textUtil";
import { create } from "zustand";
import { Controller } from "./controller";

import { subscribeWithSelector } from "zustand/middleware";
import { createRoot } from "react-dom/client";
import Modal from "./Modal";

type PlaybackState = "loading tts" | "playing" | "paused" | "done";

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
  doneTTS: boolean;
  totalChunkLength: number;
  textChunks: string[];
  showController: boolean;
  state: PlaybackState;
  config: Config;

  addToPlaybackQueue: (chunks: { index: number; dataUrl: string }[]) => void;
  togglePlayback: () => void;
  previousChunk: () => void;
  nextChunk: () => void;
}>()(
  subscribeWithSelector((set, get) => ({
    currentChunkIndex: 0,
    totalChunkLength: 0,
    doneTTS: false,
    playbackQueue: [],
    textChunks: [],
    isPlaying: false,
    showController: false,
    state: "loading tts",
    config: {
      highlight: {
        noHighlight: false,
      },
      scrollToView: true,
    },
    addToPlaybackQueue: (chunks) => {
      const newChunks = [...get().playbackQueue, ...chunks];
      const sortedChunks = newChunks.sort((a, b) => a.index - b.index);
      set({ playbackQueue: sortedChunks });
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

const highlightWalker = (textChunks: string[], index: number) => {
  const body = document.body;
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);

  const searchText = textChunks[index];

  const splits = searchText.split("\n").filter((chunk) => chunk.length > 4);

  const elms = document.querySelectorAll(".highlight");
  elms.forEach((elm) => elm.classList.remove("highlight"));

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const nodeText = node.nodeValue;
    const hasMatch = splits.some(
      (split) =>
        nodeText?.toLowerCase().includes(split.toLowerCase()) ||
        (nodeText && split.toLowerCase().includes(nodeText?.toLowerCase()))
    );

    if (hasMatch) {
      const span = document.createElement("span");
      span.classList.add("highlight");
      span.textContent = node.nodeValue;

      const parent = node.parentNode;
      if (parent) {
        parent.replaceChild(span, node);
      }

      if (usePlaybackStore.getState().config.scrollToView) {
        span.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
};

const setupTextReaderMode = () => {
  const fontColor = getComputedStyle(document.body).color;

  // Extract RGB values and ignore the alpha channel if it's in rgba format
  const rgbMatch = fontColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/);

  if (!rgbMatch) {
    console.warn("Could not extract RGB values from font color:", fontColor);
    return;
  }

  const r = parseInt(rgbMatch[1]);
  const g = parseInt(rgbMatch[2]);

  const b = parseInt(rgbMatch[3]);

  document.body.style.color = `rgba(${r}, ${g}, ${b}, ${0.2});`;

  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .highlight {
      color: rgba(${r}, ${g}, ${b},1);
      font-weight: 500;
      text-decoration: underline;
      background-color: rgb(165, 180, 252, 0.4);
      backdrop-filter: blur(8px);
      filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06));
      text-decoration-color: rgba(99, 102, 241, 0.8);
    }
  `;
  document.head.appendChild(styleElement);
};

const startTTS = async () => {
  console.log("checking if openAI key exists");

  const hasOpenAIKey = await extComm.sendMsg("background", "hasOpenAIKey", []);

  console.log("hasOpenAIKey", hasOpenAIKey);

  if (!hasOpenAIKey) {
    const modal = document.createElement("div");
    modal.id = "crx-modal";
    document.body.append(modal);
    createRoot(modal).render(<Modal startTTS={startTTS} />);
    return;
  }

  const root = document.createElement("div");
  root.id = "crx-root";
  document.body.append(root);

  createRoot(root).render(<Controller />);

  const documentClone = document.cloneNode(true) as Document;

  console.log("cloned document", documentClone);

  usePlaybackStore.setState({ showController: true, state: "loading tts" });

  documentClone.querySelectorAll("br").forEach((br) => {
    if (br.previousSibling) {
      const sibling = br.previousSibling;
      if (sibling.nodeType === Node.TEXT_NODE) {
        sibling.textContent += "\n";
      }
    }
  });

  const content = new Readability(documentClone as Document, {
    keepClasses: true,
  }).parse();

  const text = content?.textContent;

  // console.log("text", text);

  if (!text) throw new Error("no selected text");

  console.log("splitting text into chunks");

  const textChunks = textToChunks(text); // Implement this function

  console.log("textChunks", textChunks);

  extComm.sendMsg("background", "tts", [textChunks]).then((dataUrls) => {
    // Play audio from URLs and handle the queue

    usePlaybackStore.getState().addToPlaybackQueue(dataUrls);

    usePlaybackStore.setState({
      isPlaying: true,
      currentChunkIndex: 0,
      doneTTS: false,
      textChunks: textChunks,
      state: "playing",
    });

    setupTextReaderMode();
  });

  extComm.onMsg("content", "voiceChunk", ([chunks]) => {
    usePlaybackStore.getState().addToPlaybackQueue(chunks);
  });
};

extComm.onMsg("content", "startTTS", async () => {
  // TODO: change to full body content later
  startTTS();
  return true;
});

console.log("content script loaded");

const audioElement = new Audio();

const playNextAudio = () => {
  console.log("playNextAudio called");
  const currentChunk = usePlaybackStore.getState().currentChunkIndex;
  const dataUrl = usePlaybackStore.getState().playbackQueue[currentChunk];

  if (!dataUrl) {
    console.log("No data URL found for current chunk:", currentChunk);
    return;
  }

  console.log("Setting audio source to data URL for chunk:", currentChunk);
  audioElement.src = dataUrl.dataUrl;

  audioElement.currentTime = 0;

  console.log("Playing audio for chunk:", currentChunk);
  audioElement.play();

  highlightWalker(usePlaybackStore.getState().textChunks, currentChunk);
  // highlightCurrentTextChunk(playbackStore.getState().textChunks, currentChunk);

  audioElement.onended = () => {
    console.log("Audio ended for chunk:", currentChunk);
    usePlaybackStore.setState({
      currentChunkIndex: currentChunk + 1,
    });

    if (usePlaybackStore.getState().isPlaying) {
      console.log("Continuing playback with next audio chunk");
      playNextAudio();
    }
  };
};

usePlaybackStore.subscribe(
  (state) => state.isPlaying,
  (isPlaying) => {
    console.log("Playback state changed. Is playing:", isPlaying);
    if (isPlaying) {
      playNextAudio();
    } else {
      console.log("Pausing audio playback");
      audioElement.pause();
    }
  }
);
