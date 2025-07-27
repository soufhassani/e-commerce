import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "tmp-uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// In-memory file expiry map
const expiryMap: Record<string, number> = {};

// Auto-cleanup expired files every 10s
setInterval(() => {
  const now = Date.now();
  for (const fileId in expiryMap) {
    if (expiryMap[fileId] < now) {
      const filePath = path.join(UPLOAD_DIR, `${fileId}.wav`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted expired file: ${fileId}`);
      }
      delete expiryMap[fileId];
    }
  }
}, 10 * 1000);

// Helper function to call Whisper
async function callWhisperWithUrl(fileID: string) {
  const whisperResponse = await fetch(
    `${process.env.WHISPER_API_URL}/transcribe-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `http://nextjs:3000/api/whisper/temp/${fileID}`,
      }),
    }
  );

  if (!whisperResponse.ok) {
    const err = await whisperResponse.text();
    throw new Error(err || "Whisper server error");
  }

  return whisperResponse.json();
}

// POST /api/whisper
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty or missing" },
        { status: 400 }
      );
    }

    // **Check MIME type (audio only)**
    const validMimeTypes = [
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/x-wav",
    ];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    // Save file locally
    const fileId = randomUUID();
    const filePath = path.join(UPLOAD_DIR, `${fileId}.wav`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Set expiry (30 seconds)
    expiryMap[fileId] = Date.now() + 30 * 1000;

    // Call Whisper using the temporary URL
    const result = await callWhisperWithUrl(fileId);

    // Clean up the file immediately after use
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      delete expiryMap[fileId];
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/whisper:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
