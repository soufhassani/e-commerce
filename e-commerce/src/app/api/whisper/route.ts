import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import { error } from "console";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing (we use formidable)
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, _fields, files) => {
      if (err) return res.status(400).json({ error: "File parsing error" });

      const fileField = files.file;
      const audioFile: File | undefined = Array.isArray(fileField)
        ? fileField[0]
        : fileField;
      if (!audioFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileStream = fs.createReadStream(audioFile.filepath);
      const formData = new FormData();
      formData.append(
        "file",
        fileStream,
        audioFile.originalFilename || "audio.wav"
      );

      const whisperResponse = await fetch("http://whisper:5000/transcribe", {
        method: "POST",
        body: formData as any,
        headers: (formData as any).getHeaders(),
      });

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        return res
          .status(whisperResponse.status)
          .json({ error: errorText || "Whisper server error" });
      }

      const data = await whisperResponse.json();
      return res.status(200).json(data);
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
