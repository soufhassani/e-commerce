import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = params.key; // e.g., "uploads/123-photo.jpg"

  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });

  await s3.send(command);

  return NextResponse.json({ message: "Deleted" });
}
