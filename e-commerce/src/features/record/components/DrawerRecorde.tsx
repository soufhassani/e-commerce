"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { BsFillRecordFill } from "react-icons/bs";
import { FaPause } from "react-icons/fa6";
import { IoCheckmarkSharp, IoCloseCircle } from "react-icons/io5";

type Props = {
  stream: MediaStream | null;
  setStream: Dispatch<SetStateAction<MediaStream | null>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const RECORDING_TIME = 5;

const DrawerRecorde = ({ isOpen, setIsOpen, stream, setStream }: Props) => {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [controls, setControls] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  //   const [recordState, setRecorderState] = useState(recorder.state);
  const recordRef = useRef<HTMLDivElement>(null);
  const audioBlop = useRef<Blob>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const chunks = [];

  useEffect(() => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    setRecorder(mediaRecorder);

    mediaRecorder.ondataavailable = (e) => {
      console.log("🎙️ ondataavailable fired");
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audioBlop.current = new Blob(chunksRef.current, { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlop.current);
      setAudioUrl(url); // store it
      chunksRef.current = []; // clear
      setRecording(false);
      setControls(true);
      setSeconds(RECORDING_TIME);
    };
  }, [stream]);

  //   console.log("recorder: ", recorder);

  const handleStopRecording = () => {
    if (!recorder) return;
    recorder.stop();
  };

  const handleRecording = () => {
    if (!recorder) return;

    if (recording) {
      handleStopRecording();
      return;
    }

    // Paused here need to clear the blop
    if (audioBlop.current) audioBlop.current;

    setControls(false);
    recorder.start();
    setRecording(true);

    console.log("🔴 Recording started");
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - (startTimeRef.current ?? 0)) / 1000;
      if (elapsed >= RECORDING_TIME) {
        recorder.stop();
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setRecording(false);
        setSeconds(RECORDING_TIME);
        return;
      }
      setSeconds(elapsed);
    }, 100);
  };

  const handleCancelRecording = () => {
    console.log("recorded cancelled");
  };

  const handleSendRecording = () => {
    console.log("record was sent");
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    recorder?.stop();
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  return (
    <Drawer open={isOpen}>
      <DrawerContent
        className="
          data-[state=open]:animate-in
          data-[state=open]:border-neutral-700
          data-[state=closed]:animate-out
          data-[state=open]:fade-in-0
          data-[state=closed]:fade-out-0
          data-[state=open]:slide-in-from-bottom-1/3
          data-[state=closed]:slide-out-to-bottom-1/3
        "
      >
        <DrawerHeader>
          <DrawerClose
            asChild
            onClick={handleCloseDrawer}
            className="absolute top-5 right-5"
          >
            <div aria-label="close-icon">
              <IoCloseCircle
                size={30}
                className="text-neutral-700 cursor-pointer hover:scale-110 "
              />
            </div>
          </DrawerClose>
          <DrawerTitle>Start Recording</DrawerTitle>
          <DrawerDescription>
            You can look for the product you need using you voice only.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex items-center justify-center pb-8">
          <div className="flex items-center justify-between gap-5 min-w-xl">
            <div
              ref={recordRef}
              onClick={handleRecording}
              className={`${
                recording
                  ? "bg-red-500 flex p-1.5 w-fit rounded-full"
                  : "drawerControllerIcon"
              } `}
            >
              {recording ? (
                <FaPause className="animate-pulse duration-[50ms]" />
              ) : (
                <BsFillRecordFill />
              )}
            </div>
            <div className="w-full h-full">
              <div className="w-full h-full flex items-center gap-4">
                <div className="w-full h-full bg-neutral-800 rounded-full text-white">
                  <div
                    className={`w-0 h-2.5 rounded-4xl bg-white transition-all ease-linear duration-100`}
                    style={{
                      width: `${Math.min(
                        (seconds / RECORDING_TIME) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="w-fit">
                  {!controls ? (
                    <span className="whitespace-nowrap">{`00:${
                      seconds > 9
                        ? Math.floor(seconds)
                        : `0${Math.floor(seconds)}`
                    }`}</span>
                  ) : (
                    <div className="flex gap-1">
                      <div
                        className="drawerControllerIcon !bg-transparent hover:!bg-neutral-700 hover:!scale-100"
                        onClick={handleSendRecording}
                      >
                        <IoCheckmarkSharp />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {audioUrl && (
          <div className="mt-4">
            <p>📣 Your Recording:</p>
            <audio controls src={audioUrl}></audio>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerRecorde;
