const express = require("express");
const router = express.Router();
const textToSpeech = require("@google-cloud/text-to-speech");

// Init TTS client
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE_PATH,
});

router.post("/synthesize", async (req, res) => {
  try {
    const { script } = req.body;

    if (!script || typeof script !== "string") {
      return res.status(400).json({ error: "Invalid input" });
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

    const audioBase64 = Buffer.from(response.audioContent).toString("base64");

    if (!audioBase64) {
      return res.status(500).json({ error: "Failed to synthesize audio" });
    }

    return res.json({ audio: audioBase64, cached: false });
  } catch (err) {
    console.error("TTS Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
});

module.exports = router;
