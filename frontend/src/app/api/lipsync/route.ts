import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { v2 as cloudinary } from "cloudinary";

// Setup Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const DID_API_KEY = process.env.DID_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { audioBase64, imageUrl, script } = await req.json();
    console.log("Received data:", { audioBase64, imageUrl });

    // if (!audioBase64 || !imageUrl) {
    //   return NextResponse.json(
    //     { error: "Missing audio or image" },
    //     { status: 400 }
    //   );
    // }

    // // Save audio to a temp file
    // const audioBuffer = Buffer.from(audioBase64, "base64");
    // const tempDir = os.tmpdir();
    // const fileName = `tts-${Date.now()}.mp3`;
    // const audioFilePath = path.join(tempDir, fileName);
    // fs.writeFileSync(audioFilePath, audioBuffer);

    // // Upload to Cloudinary
    // const uploadRes = await cloudinary.uploader.upload(audioFilePath, {
    //   resource_type: "video", // Treat audio as video to avoid Cloudinary rejecting it
    //   folder: "tts-audio", // Optional: for organizing uploads
    //   public_id: fileName.replace(".mp3", ""),
    // });

    // const audioUrl = uploadRes.secure_url;
    // console.log("Cloudinary audio URL:", audioUrl);

    const encodedKey = Buffer.from(`${DID_API_KEY}:`).toString("base64");

    // // Call D-ID with Cloudinary audio URL
    // const talkRes = await fetch("https://api.d-id.com/talks", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Basic ${encodedKey}`,
    //   },
    //   body: JSON.stringify({
    //     source_url: imageUrl,
    //     script: {
    //       type: "text",
    //       input: script || "This is a test script",
    //     },
    //     config: {
    //       fluent: true,
    //       align_expand_factor: 1.2,
    //       auto_match: true,
    //     },
    //   }),
    // });

    // // console.log("D-ID response:", talkRes.status, await talkRes.text());

    // if (!talkRes.ok) {
    //   throw new Error("Failed to initiate D-ID video generation");
    // }

    // const result = await talkRes.json();
    // console.log(result);
    // return NextResponse.json({ videoUrl: result.result_url });

    const id = "tlk_wMlmiZq472vCm10RmOp8g";
    const statusCheck = await fetch(`https://api.d-id.com/talks/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${encodedKey}`,
      },
    });

    const statusData = await statusCheck.json();
    console.log(statusData);
    return NextResponse.json({ videoUrl: statusData.result_url });
  } catch (err: any) {
    console.error("Lipsync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
