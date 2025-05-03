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

    const testOptions = [
      {
        audioConfig: {
          audioEncoding: "LINEAR16",
          effectsProfileId: ["small-bluetooth-speaker-class-device"],
          pitch: 0,
          speakingRate: 1,
        },
        input: {
          text: "Movies, oh my gosh, I just just absolutely love them. They're like time machines taking you to different worlds and landscapes, and um, and I just can't get enough of it.",
        },
        voice: {
          languageCode: "en-US",
          name: "en-US-Chirp3-HD-Achernar",
        },
      },
      {
        input: {
          ssml: `
                    <speak>
                      <prosody rate="medium" pitch="0st">
                        Hello there! I'm <emphasis level="moderate">not</emphasis> your average robot voice.
                      </prosody>
                    </speak>
                  `,
        },
        voice: {
          languageCode: "en-US",
          // name: "en-US-Studio-M",
          // name: "en-US-Chirp-HD-D", // Choose a voice from GCP dashboard
          name: "en-US-Wavenet-F", // Choose a voice from GCP dashboard
        },
        audioConfig: { audioEncoding: "MP3" },
      },
    ];

    const [response] = await client.synthesizeSpeech({
      audioConfig: {
        audioEncoding: "LINEAR16",
        effectsProfileId: ["small-bluetooth-speaker-class-device"],
        pitch: 0,
        speakingRate: 1,
      },
      input: {
        text: script,
      },
      voice: {
        languageCode: "en-US",
        name: "en-US-Chirp3-HD-Achernar",
      },
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
