import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.WHISPER_API_URL}/health`);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Whisper server is not ready" },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unable to reach Whisper service" },
      { status: 500 }
    );
  }
}
