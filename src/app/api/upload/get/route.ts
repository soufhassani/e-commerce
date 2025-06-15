import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const { keys } = await req.json(); // keys = ["uploads/img1.jpg", "uploads/img2.jpg"]

  if (!Array.isArray(keys)) {
    return NextResponse.json({ error: "Invalid keys array" }, { status: 400 });
  }

  const urls = await Promise.all(
    keys.map(async (key) => {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
      return { key, signedUrl };
    })
  );

  return NextResponse.json({ urls });
}
