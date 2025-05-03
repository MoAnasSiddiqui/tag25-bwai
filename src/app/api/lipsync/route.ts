// app/api/lipsync/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";
import os from "os";

const DID_API_KEY = process.env.DID_API_KEY!; // Set this in your .env.local file

export async function POST(req: NextRequest) {
  try {
    const { audioBase64, imageUrl } = await req.json();
    console.log("Received data:", { audioBase64, imageUrl });

    if (!audioBase64 || !imageUrl) {
      return NextResponse.json(
        { error: "Missing audio or image" },
        { status: 400 }
      );
    }

    // Save audio to a temporary MP3 file
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const tempDir = os.tmpdir(); // Get the temp directory path based on the OS
    const audioFilePath = path.join(tempDir, `tts-${Date.now()}.mp3`);
    fs.writeFileSync(audioFilePath, audioBuffer);

    // Upload audio to D-ID
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFilePath));

    const username = "YOUR_API_USERNAME";
    const password = "YOUR_API_PASSWORD"; // or API key

    const token = Buffer.from(`${username}:${password}`).toString("base64");
    console.log(`Basic ${token}`);
    const base64Key = Buffer.from(process.env.DID_API_KEY!).toString("base64");

    const uploadRes = await fetch("https://api.d-id.com/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Basic ${base64Key}`,
      },
      body: formData as any,
    });

    console.log("Upload Response Status:", uploadRes.status);
    const responseBody = await uploadRes.text(); // Read the response body as text
    console.log("Upload Response Body:", responseBody);

    if (!uploadRes.ok) {
      throw new Error("Failed to upload audio to D-ID");
    }

    const { url: audioUrl } = await uploadRes.json();

    // Request D-ID video
    const talkRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DID_API_KEY}`,
      },
      body: JSON.stringify({
        source_url: audioUrl,
        driver_url: imageUrl,
        config: {
          fluent: true,
          align_expand_factor: 1.2,
          auto_match: true,
        },
      }),
    });

    if (!talkRes.ok) {
      throw new Error("Failed to initiate D-ID video generation");
    }

    const result = await talkRes.json();
    return NextResponse.json({ videoUrl: result.result_url });
  } catch (err: any) {
    console.error("Lipsync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
