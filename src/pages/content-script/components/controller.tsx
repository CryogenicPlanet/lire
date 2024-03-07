import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "@/index.css";
import { LoadingIcon } from "@/components/loading";
import { usePlaybackStore } from "../lib/store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Controller = () => {
  const {
    showController,
    playbackState: state,
    togglePlayback,
    previousChunk,
    nextChunk,
    isPlaying,
    config,
    ttsState,
  } = usePlaybackStore();

  console.log({ showController });

  if (!showController) return null;

  return (
    <div className='fixed bottom-2 right-2'>
      <Popover defaultOpen={true}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-5 h-5'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75'
              />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className='w-80 bg-indigo-300/20 filter backdrop-blur-xl flex justify-center items-center'
          side='top'
        >
          <div className='grid gap-4'>
            {state === "loading tts" ? (
              <div className='p-4 flex flex-col items-center justify-center'>
                <p>Processing text...</p>
                <LoadingIcon className='w-6 h-6 animate-spin' />
              </div>
            ) : (
              <div className='flex flex-col space-y-2 items-center'>
                <div className='flex items-center space-x-4'>
                  <button
                    type='button'
                    onClick={previousChunk}
                    className='rounded-full p-1.5 text-slate-900 shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z'
                      />
                    </svg>
                  </button>
                  <button
                    type='button'
                    onClick={togglePlayback}
                    className='rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                  >
                    {isPlaying ? (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-6 h-6'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M15.75 5.25v13.5m-7.5-13.5v13.5'
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-6 h-6'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    type='button'
                    onClick={nextChunk}
                    className='rounded-full p-1.5 text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 '
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z'
                      />
                    </svg>
                  </button>
                </div>

                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='scroll'
                    name='scroll'
                    checked={config.scrollToView}
                    onChange={(e) => {
                      usePlaybackStore.setState((state) => ({
                        ...state,
                        scrollToView: e.target.checked,
                      }));
                    }}
                  />

                  <label htmlFor='scroll' className='ml-2 text-sm'>
                    Should scroll into view
                  </label>
                </div>

                <Accordion type='single' collapsible>
                  <AccordionItem value='item-1'>
                    <AccordionTrigger>Debug</AccordionTrigger>
                    <AccordionContent>
                      <div className='flex items-center whitespace-break-spaces'>
                        <p>{JSON.stringify(ttsState)}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
