import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { extComm } from "../comm";

const Popup = () => {
  const [selectedText, setSelectedText] = useState("");

  const getSelectedText = () => {
    // Send a message to the content script to get the selected text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (typeof tabId === "number") {
        chrome.tabs.sendMessage(tabId, { getText: true });
      }
    });
  };

  const playTextAudio = async () => {
    // chrome.runtime.sendMessage({ action: "playTextAudio", text: selectedText });

    await extComm.sendMsgToActiveTab("startTTS", []);
  };

  return (
    <div>
      <button onClick={getSelectedText}>Get Selected Text</button>
      <button onClick={playTextAudio}>Play Text Audio</button>
      <p>Selected Text: {selectedText}</p>
    </div>
  );
};

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

createRoot(root).render(<Popup />);
