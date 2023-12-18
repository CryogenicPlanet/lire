// src/pages/content-script/index.tsx
import { createRoot } from "react-dom/client";
import Content from "./content";
import { extComm } from "../comm";

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

// createRoot(root).render(<Content />);

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.getText) {
//     const selectedText = window.getSelection()?.toString();
//     console.log("Hi from content script", selectedText);
//     sendResponse({ selectedText: selectedText });
//   }
//   return true; // Will respond asynchronously.
// });

extComm.onMsg("content", "startTTS", () => {
  const selectedText = window.getSelection()?.toString();

  if (!selectedText) throw new Error("no selected text");

  extComm.sendMsg("background", "tts", [selectedText]).then((dataUrl) => {
    const audio = new Audio(dataUrl);

    audio.play();
  });

  return true;
});
