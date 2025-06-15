import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serveerUploadSchema } from "@/features/upload/upload.schema";
import { s3 } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const validation = serveerUploadSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(validation.error.errors, { status: 400 });

  const { filename, fileType } = body;

  if (!filename || !fileType) {
    return NextResponse.json(
      { error: "Missing filename or fileType" },
      { status: 400 }
    );
  }

  const key = `uploads/${Date.now()}-${filename}`; // Prevent name collisions

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60s expiry

  return NextResponse.json({
    signedUrl,
    fileUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`,
    key,
  });
}
