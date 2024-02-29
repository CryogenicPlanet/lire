import { createRoot } from "react-dom/client";
import { extComm } from "../comm";
import "../../index.css";

const Popup = () => {
  const playTextAudio = async () => {
    // chrome.runtime.sendMessage({ action: "playTextAudio", text: selectedText });

    await extComm.sendMsgToActiveTab("startTTS", []);
  };

  return (
    <div className='flex flex-col items-center justify-center h-full bg-zinc-800 p-20 w-60 text-gray-200'>
      <button
        type='button'
        onClick={playTextAudio}
        className='rounded-md bg-indigo-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
      >
        Read out page!
      </button>
    </div>
  );
};

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

createRoot(root).render(<Popup />);
