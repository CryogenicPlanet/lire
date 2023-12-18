/**
 * imports
 */

import { extComm } from "../comm";

export function background() {
  return "background";
}

// replace with your own welcome page url
const onInstallUrl = "";

// this runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: onInstallUrl });
  }
});

extComm.onMsgCallback("background", "tts", ([str], callback) => {
  console.log("Handling bg openai call", str);
  fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: str,
      voice: "alloy",
    }),
  })
    .then((response) => response.blob())
    .then((blob) => {
      console.log("Blob is here", blob);
      // Send the blob to the popup script

      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert the blob to a data URL and send it
        const dataUrl = reader.result;

        console.log("Data url is ", dataUrl);
        callback(dataUrl as string);
      };

      reader.onerror = () => {
        console.error("FileReader error:", reader.error);
        // callback(null);
      };

      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return true;
});
