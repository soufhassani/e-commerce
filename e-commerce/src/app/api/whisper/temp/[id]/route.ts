import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "tmp-uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const filePath = path.join(UPLOAD_DIR, `${params.id}.wav`);
  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found or expired", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": "audio/wav" },
  });
}
