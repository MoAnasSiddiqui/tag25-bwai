// app/api/tts/route.ts

import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

// Load service account credentials from env or JSON
const client = new textToSpeech.TextToSpeechClient({
  // Use GOOGLE_APPLICATION_CREDENTIALS env var or pass keyFilename
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE_PATH, // or leave empty if using env var
});

export async function POST(req: NextRequest) {
  try {
    const { script } = await req.json();

    if (!script || typeof script !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const [response] = await client.synthesizeSpeech({
      input: { text: script },
      voice: {
        languageCode: "en-US",
        name: "en-US-News-K", // Choose a voice from GCP dashboard
      },
      audioConfig: { audioEncoding: "MP3" },
    });

    const audioBase64 = Buffer.from(
      response.audioContent as Uint8Array
    ).toString("base64");

    if (!audioBase64) {
      return NextResponse.json(
        { error: "Failed to synthesize audio" },
        { status: 500 }
      );
    }

    return NextResponse.json({ audio: audioBase64 });
  } catch (err: any) {
    console.error("TTS Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
