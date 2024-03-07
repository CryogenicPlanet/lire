import { highlightWalker } from "./highlighter";
import { usePlaybackStore } from "./store";

export const setupAudioPlayback = () => {
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

  const cancel = usePlaybackStore.subscribe(
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

  return cancel;
};
