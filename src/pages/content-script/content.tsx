import { extComm } from "../comm";
import { Controller } from "./components/controller";

import { createRoot } from "react-dom/client";
import Modal from "./components/Modal";

import { setupAudioPlayback } from "./lib/audio";

import { setupTextReaderMode, startTTS } from "./lib/tts";

let cancelAudioPlayback: (() => void) | null = null;

const run = async () => {
  if (!(await hasOpenAIKey())) return;

  if (cancelAudioPlayback) cancelAudioPlayback();

  cancelAudioPlayback = setupAudioPlayback();

  startTTS();
};

const hasOpenAIKey = async (): Promise<boolean> => {
  console.log("checking if openAI key exists");

  const hasOpenAIKey = await extComm.sendMsg("background", "hasOpenAIKey", []);

  console.log("hasOpenAIKey", hasOpenAIKey);

  if (!hasOpenAIKey) {
    const modal = document.createElement("div");
    modal.id = "crx-modal";
    document.body.append(modal);
    createRoot(modal).render(<Modal startTTS={run} />);
    return false;
  }

  const root = document.createElement("div");
  root.id = "crx-root";
  document.body.append(root);

  createRoot(root).render(<Controller />);

  return true;
};

extComm.onMsg("content", "startTTS", async () => {
  // TODO: change to full body content later
  run();
  return true;
});

console.log("content script loaded");

setupTextReaderMode();
