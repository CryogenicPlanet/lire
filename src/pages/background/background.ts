import { extComm } from "../comm";

export function background() {
  console.log("background function reached");
  return "background";
}

// replace with your own welcome page url
const onInstallUrl = "";

// this runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed or updated");
  if (details.reason === "install") {
    console.log("Extension installed, opening welcome page");
    chrome.tabs.create({ url: onInstallUrl });
  }
});

async function fetchTTS(
  chunk: string,
  idx: number
): Promise<{
  index: number;
  dataUrl: string;
}> {
  const { openaiKey } = await chrome.storage.local.get("openaiKey");

  if (!openaiKey) {
    throw new Error("No OpenAI key found");
  }

  console.log("fetchTTS function reached");
  return fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: chunk,
      voice: "alloy",
    }),
  })
    .then((response) => {
      console.log("TTS fetch response received");
      return response.blob();
    })
    .then((blob) => {
      console.log("Converting blob to data URL");
      return new Promise<{
        index: number;
        dataUrl: string;
      }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("Blob conversion to data URL completed");
          resolve({
            index: idx,
            dataUrl: reader.result as string,
          });
        };
        reader.readAsDataURL(blob);
      });
    });
}

const queueRestChunks = async (texts: string[]) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const maxFetchesPerMinute = 30;
  const interval = 60000 / maxFetchesPerMinute; // Interval in milliseconds

  for (const [index, text] of texts.entries()) {
    setTimeout(
      () =>
        fetchTTS(text, index).then((url) => {
          extComm.sendMsg("content", "voiceChunk", [[url]]);
        }),
      index * interval
    );
    await delay(interval); // Ensure we don't exceed the rate limit
  }
};

extComm.onMsgCallback("background", "tts", ([text], callback) => {
  console.log("Received TTS message with text:", text);

  const firstThirtyChunks = text.slice(0, 30);

  const rest = text.slice(30);

  const ttsPromises = firstThirtyChunks.map((chunk, idx) =>
    fetchTTS(chunk, idx)
  );

  Promise.all(ttsPromises)
    .then((urls) => {
      console.log("All TTS URLs fetched", { urls });
      callback(urls);
    })
    .catch((error) => {
      console.error("Error fetching TTS URLs:", error);
      callback([]);
    });

  queueRestChunks(rest);

  return true; // Indicates an asynchronous response
});

extComm.onMsgCallback("background", "hasOpenAIKey", (_, callback) => {
  console.log("Checking if OpenAI key exists in localStorage");
  chrome.storage.local.get("openaiKey", (result) => {
    const hasKey = result.openaiKey !== undefined;
    console.log("OpenAI key exists in localStorage", { hasKey });
    callback(hasKey);
  });
  return true; // indicates that the response is sent asynchronously
});

extComm.onMsgCallback("background", "setOpenAIKey", ([key], callback) => {
  console.log(`Setting OpenAI key in localStorage`);
  chrome.storage.local.set({ openaiKey: key }, () => {
    console.log("OpenAI key is set in localStorage");
    callback();
  });
  return true; // indicates that the response is sent asynchronously
});
