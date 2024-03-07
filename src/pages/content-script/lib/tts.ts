import { Readability } from "@mozilla/readability";
import { nlpChunks } from "./textUtil";
import { usePlaybackStore } from "./store";
import { extComm } from "@/pages/comm";
import { Result, Err, Ok } from "ts-results";

const getDomText = (): string[] => {
  const documentClone = document.cloneNode(true) as Document;

  console.log("cloned document", documentClone);

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

  if (!text) throw new Error("no selected text");

  console.log("splitting text into chunks");

  const textChunks = nlpChunks(text);

  return textChunks;
};

const getSelectedText = (): Result<string[], false> => {
  const selection = window.getSelection();

  if (!selection) {
    return Err(false);
  }

  const selectedText = selection.toString();

  if (!selectedText) {
    return Err(false);
  }

  return Ok(nlpChunks(selectedText));
};

export const startTTS = async () => {
  usePlaybackStore.setState({
    showController: true,
    playbackState: "loading tts",
  });

  const selectedText = getSelectedText();

  const textChunks = selectedText.ok ? selectedText.val : getDomText();

  console.log("textChunks", textChunks);

  extComm.sendMsg("background", "tts", [textChunks]).then((dataUrls) => {
    // Play audio from URLs and handle the queue

    usePlaybackStore.getState().addToPlaybackQueue(dataUrls);

    usePlaybackStore.setState({
      isPlaying: true,
      currentChunkIndex: 0,
      ttsState: {
        completedChunks: dataUrls.length,
        totalChunks: textChunks.length,
        state: "pending",
      },
      textChunks: textChunks,
      playbackState: "playing",
    });
  });
};

export const setupTextReaderMode = () => {
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

  const styleElement = document.createElement("style");
  styleElement.textContent = `
      ::highlight(readability-highlight) {
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

extComm.onMsgCallback("content", "voiceChunk", ([chunks], cb) => {
  console.log("voiceChunk received", chunks);
  usePlaybackStore.getState().addToPlaybackQueue(chunks);
  cb();

  return true;
});

extComm.onMsg("content", "doneTTS", () => {
  const ttsState = usePlaybackStore.getState().ttsState;

  usePlaybackStore.setState({
    ttsState: {
      ...ttsState,
      state: "done",
    },
  });
});
