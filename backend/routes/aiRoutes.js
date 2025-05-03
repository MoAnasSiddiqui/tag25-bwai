const express = require("express");
const { z } = require("zod");
const { ai } = require("../ai/ai-instance"); // 🔁 Drop `.js` to avoid ESM headaches

const router = express.Router();

// Schemas
const GenerateNewsScriptInputSchema = z.object({
  articleTitle: z.string(),
  articleContent: z.string(),
  articleUrl: z.string(),
});

const GenerateNewsScriptOutputSchema = z.object({
  script: z.string(),
});

// AI Prompt
const prompt = ai.definePrompt({
  name: "generateNewsScriptPrompt",
  input: { schema: GenerateNewsScriptInputSchema },
  output: { schema: GenerateNewsScriptOutputSchema },
  prompt: `You are a professional news script writer. Based on the following news article, create a broadcast-ready news script for a digital avatar to present. Ensure the script has an appropriate tone, pacing, and structure for television news reporting. The script should be approximately 200 words.

Article Title: {{{articleTitle}}}
Article Content: {{{articleContent}}}
Source URL: {{{articleUrl}}}`,
});

// Flow logic
const generateNewsScriptFlow = ai.defineFlow(
  {
    name: "generateNewsScriptFlow",
    inputSchema: GenerateNewsScriptInputSchema,
    outputSchema: GenerateNewsScriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);

// POST route for generating news script
router.post("/generate-news-script", async (req, res) => {
  try {
    const input = GenerateNewsScriptInputSchema.parse(req.body);
    const result = await generateNewsScriptFlow(input);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: err.errors });
    }
    console.error("AI generation error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Dummy articles (mocked content)
const dummyArticles = [
  {
    title:
      "Local Man Discovers Secret Portal in Refrigerator, Accidentally Attends 1987 Office Meeting",
    content:
      "In what experts are calling “a highly unusual time-space kitchen anomaly,” a man from Des Moines claims he stumbled upon a glowing vortex behind a jar of pickles in his refrigerator...",
    url: "https://example.com/news1",
  },
  {
    title:
      "World Leaders Meet for Emergency Summit on Rising Penguin Uprisings in the Southern Hemisphere",
    content:
      "In an unprecedented turn of events, world leaders have convened in Geneva to address a surge in coordinated penguin activity...",
    url: "https://example.com/news2",
  },
  {
    title:
      "Startup Launches Subscription Service for Renting Emotions—Beta Testers Confused and Crying",
    content:
      "Silicon Valley startup *FeelShare* has launched an experimental platform allowing users to “stream” emotions on demand...",
    url: "https://example.com/news3",
  },
  {
    title:
      "Aliens Land in Kansas, Ask for WiFi Password, Leave After Realizing We Still Use 5G",
    content:
      "A brief extraterrestrial encounter rocked a small Kansas town yesterday when a saucer-shaped craft landed outside a gas station...",
    url: "https://example.com/news4",
  },
  {
    title:
      "Underground Society of Cats Apparently Running Shadow Government, Whistleblower Claims",
    content:
      "In a leak that’s shocking yet strangely validating to cat owners, a whistleblower from within the Department of Homeland Security...",
    url: "https://example.com/news5",
  },
];

// GET route for dummy articles
router.get("/get-articles", (_req, res) => {
  res.json(dummyArticles);
});

module.exports = router;
