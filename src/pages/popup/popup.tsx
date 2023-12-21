import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { extComm } from "../comm";

const Popup = () => {
  const playTextAudio = async () => {
    // chrome.runtime.sendMessage({ action: "playTextAudio", text: selectedText });

    await extComm.sendMsgToActiveTab("startTTS", []);
  };

  return (
    <div>
      <button onClick={playTextAudio}>Play Text Audio</button>
    </div>
  );
};

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

createRoot(root).render(<Popup />);
