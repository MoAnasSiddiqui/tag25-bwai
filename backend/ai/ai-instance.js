const { genkit } = require("genkit");
const { googleAI } = require("@genkit-ai/googleai");

require("dotenv").config(); // if you're using a .env file

const ai = genkit({
  promptDir: "./prompts",
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: "googleai/gemini-2.5-flash-preview-04-17",
});

module.exports = { ai };
