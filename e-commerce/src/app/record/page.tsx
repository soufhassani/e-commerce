"use client";
import {
  Drawer,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import DrawerRecorde from "@/features/record/components/DrawerRecorde";
import { useEffect, useRef, useState } from "react";
import { BiSolidMicrophone } from "react-icons/bi";
import { BsFillRecordFill } from "react-icons/bs";

const page = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const videoRef = useRef(null);

  const handleStartRecord = async () => {
    if (!navigator.mediaDevices)
      return setError(
        new Error("MediaDevices API not supported in this browser.")
      );
    // if (stream) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(mediaStream);
      //   if(!mediaStream) return;
      setStream(mediaStream);
      setRecorder(mediaRecorder);
      setOpenDrawer(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError(err);
      setOpenDrawer(false);
    }
  };

  if (error) {
    // error as { message: string };
    // // return <div>Error: {error.message}</div>;
  }

  return (
    <div className="h-screen w-full">
      <div className="h-full w-full relative">
        <div className="w-full flex items-center justify-center">
          <BiSolidMicrophone onClick={handleStartRecord} />
        </div>
        {openDrawer && <DrawerRecorde stream={stream} />}
      </div>
    </div>
  );
};

export default page;
