// services/textToSpeech.js
const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE_PATH,
});

async function generateAudio(script) {
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

  if (!response.audioContent) {
    throw new Error("Failed to synthesize audio");
  }

  // Create a filename
  const fileName = `${Date.now()}-speech.wav`;
  const outputDir = path.join(__dirname, "..", "tmp");

  // Ensure the tmp directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const filePath = path.join(outputDir, fileName);

  // Save audio content to file
  fs.writeFileSync(filePath, response.audioContent, "binary");

  // Return a URL pointing to the file (you must serve this folder via Express)
  const publicUrl = `/audio/${fileName}`; // Or prepend domain in prod

  return publicUrl;
}

module.exports = { generateAudio };
