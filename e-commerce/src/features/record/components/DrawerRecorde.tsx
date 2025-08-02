import {
  Drawer,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import React, { useEffect, useRef, useState } from "react";
import { BsFillRecordFill } from "react-icons/bs";
import { IoCheckmarkSharp, IoClose } from "react-icons/io5";

type Props = {
  stream: MediaStream | null;
};

const RECORDING_TIME = 5;

const DrawerRecorde = ({ stream }: Props) => {
  if (!stream) return;

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  //   const [recordState, setRecorderState] = useState(recorder.state);
  const recordRef = useRef<HTMLDivElement>(null);
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
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      console.log("🔊 Recording URL:", url);
      setAudioUrl(url); // store it
      chunksRef.current = []; // clear
    };
  }, [stream]);

  //   console.log("recorder: ", recorder);

  const handleRecording = () => {
    if (!recorder) return;

    if (!recording) {
      recorder.start();
      setRecording(true);
      //   if (recordRef.current) {
      //     recordRef.current.style.background = "red";
      //     recordRef.current.style.color = "black";
      //   }

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

      //   setTimeout(() => {
      //     recorder.stop();
      //     setRecording(false);
      //     console.log("⏹️ Recording stopped");
      //     if (timerRef.current) {
      //       clearInterval(timerRef.current);
      //       timerRef.current = null;
      //     }
      //   }, RECORDING_TIME * 1000);
    }

    // if (!stream) return;
  };

  const handleCancelRecording = () => {
    console.log("recorded cancelled");
  };

  const handleSendRecording = () => {
    console.log("record was sent");
  };

  return (
    <Drawer>
      <DrawerHeader>
        <DrawerTitle>Start Recording</DrawerTitle>
        <DrawerDescription>
          You can look for the product you need using you voice only.
        </DrawerDescription>
      </DrawerHeader>

      <div>
        <div className="flex items-center justify-between">
          <div
            ref={recordRef}
            onClick={handleRecording}
            className={`${
              recording
                ? "bg-red-500 flex p-1.5 w-fit rounded-full"
                : "drawerControllerIcon"
            } `}
          >
            <BsFillRecordFill
              className={recording ? "animate-pulse duration-[50ms]" : ""}
            />
          </div>
          <div className="w-full h-full">
            <div className="w-full h-full bg-neutral-800 rounded-full text-white">
              <div
                className={`w-0 h-1 bg-white transition-all ease-linear duration-100`}
                style={{
                  width: `${Math.min((seconds / RECORDING_TIME) * 100, 100)}%`,
                }}
              />
            </div>
            <span>{`${Math.floor(seconds)} second${
              seconds >= 2 ? "s" : ""
            }`}</span>
          </div>
        </div>
        <div>
          <div className="drawerControllerIcon" onClick={handleCancelRecording}>
            <IoClose />
          </div>
          <div className="drawerControllerIcon" onClick={handleSendRecording}>
            <IoCheckmarkSharp />
          </div>
        </div>
      </div>

      {audioUrl && (
        <div className="mt-4">
          <p>📣 Your Recording:</p>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </Drawer>
  );
};

export default DrawerRecorde;
