import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";

// Path to store the cache (you can move this to /tmp in production)
const cacheFilePath = path.join(process.cwd(), "tts-cache.json");

// Init TTS client
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE_PATH,
});

// Load cache if it exists
let cache: Record<string, string> = {};
if (fs.existsSync(cacheFilePath)) {
  try {
    const fileContent = fs.readFileSync(cacheFilePath, "utf-8");
    cache = JSON.parse(fileContent);
  } catch (err) {
    console.warn("Could not read cache file:", err);
    cache = {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const { script } = await req.json();

    if (!script || typeof script !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Use cached response if it exists
    if (cache[script]) {
      console.log("Using cached audio for script.");
      console.log("using cache");

      return NextResponse.json({ audio: cache[script], cached: true });
    }

    const [response] = await client.synthesizeSpeech({
      audioConfig: {
        audioEncoding: "LINEAR16",
        effectsProfileId: ["small-bluetooth-speaker-class-device"],
        pitch: 0,
        speakingRate: 1,
      },
      input: { text: script },
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

    // Save to cache and write back to disk
    cache[script] = audioBase64;
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));

    return NextResponse.json({ audio: audioBase64, cached: false });
  } catch (err: any) {
    console.error("TTS Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
