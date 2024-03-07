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
      return response.blob();
    })
    .then((blob) => {
      return new Promise<{
        index: number;
        dataUrl: string;
      }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            index: idx,
            dataUrl: reader.result as string,
          });
        };
        reader.readAsDataURL(blob);
      });
    });
}

const queueRestChunks = async (texts: string[], startIdx: number) => {
  const maxFetchesPerMinute = 30;
  const interval = 60000 / maxFetchesPerMinute; // Interval in milliseconds

  const promises = [];
  for (const [index, text] of texts.entries()) {
    const promise = new Promise((resolve) => {
      setTimeout(
        () =>
          fetchTTS(text, startIdx + index)
            .then((url) =>
              extComm
                .sendMsgToActiveTab("voiceChunk", [[url]])
                .then(() => console.log(`voiceChunk ${url.index} sent`))
            )
            .then(resolve),
        index * interval
      );
    });
    promises.push(promise);
  }

  console.log("Scheduled voiceChunks", texts.length);

  await Promise.all(promises);

  console.log("All voiceChunks done");

  await extComm.sendMsgToActiveTab("doneTTS", []);
};

extComm.onMsgCallback("background", "tts", ([text], callback) => {
  console.log("Received TTS message with text:", text);

  const split = 30;

  const firstThirtyChunks = text.slice(0, split);

  const rest = text.slice(split);

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

  queueRestChunks(rest, split);

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
