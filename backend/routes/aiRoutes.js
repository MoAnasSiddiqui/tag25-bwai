const express = require("express");
const { z } = require("zod");
const { ai } = require("../ai/ai-instance"); // 🔁 Drop `.js` to avoid ESM headaches
const { generateAudio } = require("../services/text-to-speech");
const { fetchNews } = require("../services/fetch-news");

const router = express.Router();

// Schemas
const GenerateNewsScriptInputSchema = z.object({
  articleTitle: z.string(),
  articleContent: z.string(),
  articleUrl: z.string(),
});

const GenerateNewsScriptOutputSchema = z.object({
  script: z.string(),
  audioUrl: z.string(), // Add the URL for the audio file
});

// AI Prompt for generating the script
const prompt = ai.definePrompt({
  name: "generateNewsScriptPrompt",
  input: { schema: GenerateNewsScriptInputSchema },
  output: { schema: GenerateNewsScriptOutputSchema },
  prompt: `You are a professional news script writer. Based on the following news article, create a broadcast-ready news script for a digital avatar to present. Ensure the script has an appropriate tone, pacing, and structure for television news reporting. The script should be approximately 200-250 words, with the following elements:

Start with a greeting based on the time of day:

Morning: "Good morning, [region]."

Afternoon: "Good afternoon, [region]."

Evening: "Good evening, [region]."

Provide a brief, impactful introduction that draws in the audience.

Introduce the main news story with clear, concise details.

Use smooth transitions between key points to maintain the flow of the story.

Close with a thoughtful sign-off, such as:

"That's all for now, [region]. Stay tuned for more updates."

"Thank you for joining us today. We'll keep you informed as this story develops."

"We'll be back with more after the break."

Article Title: {{{articleTitle}}}
Article Content: {{{articleContent}}}
Source URL: {{{articleUrl}}}`,
});

// Flow logic to generate script and audio
const generateNewsScriptFlow = ai.defineFlow(
  {
    name: "generateNewsScriptFlow",
    inputSchema: GenerateNewsScriptInputSchema,
    outputSchema: GenerateNewsScriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    // Generate audio for the script
    const audioUrl = await generateAudio(output.script);

    return {
      script: output.script,
      audioUrl,
    };
  }
);

// In-memory cache for articles, scripts, and audio URLs
let cachedArticles = [];
let cachedScripts = [];
let cachedAudio = [];
let lastUpdated = null;

// Dummy articles (mocked data - this will eventually be replaced with a real source)
function fetchDummyArticles() {
  return [
    {
      title:
        "Local Man Discovers Secret Portal in Refrigerator, Accidentally Attends 1987 Office Meeting",
      content:
        "In what experts are calling “a highly unusual time-space kitchen anomaly,” a man from Des Moines claims he stumbled upon a glowing vortex behind a jar of pickles in his refrigerator...",
      url: "https://example.com/news1",
    },
    // {
    //   title:
    //     "World Leaders Meet for Emergency Summit on Rising Penguin Uprisings in the Southern Hemisphere",
    //   content:
    //     "In an unprecedented turn of events, world leaders have convened in Geneva to address a surge in coordinated penguin activity...",
    //   url: "https://example.com/news2",
    // },
    // {
    //   title:
    //     "Startup Launches Subscription Service for Renting Emotions—Beta Testers Confused and Crying",
    //   content:
    //     "Silicon Valley startup *FeelShare* has launched an experimental platform allowing users to “stream” emotions on demand...",
    //   url: "https://example.com/news3",
    // },
    // {
    //   title:
    //     "Aliens Land in Kansas, Ask for WiFi Password, Leave After Realizing We Still Use 5G",
    //   content:
    //     "A brief extraterrestrial encounter rocked a small Kansas town yesterday when a saucer-shaped craft landed outside a gas station...",
    //   url: "https://example.com/news4",
    // },
    // {
    //   title:
    //     "Underground Society of Cats Apparently Running Shadow Government, Whistleblower Claims",
    //   content:
    //     "In a leak that’s shocking yet strangely validating to cat owners, a whistleblower from within the Department of Homeland Security...",
    //   url: "https://example.com/news5",
    // },
  ];
}

/// Function to generate scripts and audio for the articles
async function generateScriptsAndAudioForArticles(articles) {
  const scriptsAndAudio = [];

  for (const article of articles) {
    const { title, content, url } = article;
    const input = {
      articleTitle: title,
      articleContent: content,
      articleUrl: url,
    };

    try {
      const result = await generateNewsScriptFlow(input);
      scriptsAndAudio.push({
        script: result.script,
        audioUrl: result.audioUrl,
      });
    } catch (err) {
      console.error(
        "Error generating script and audio for article:",
        title,
        err
      );
      scriptsAndAudio.push({
        script: "Error generating script",
        audioUrl: null,
      });
    }
  }

  return scriptsAndAudio;
}

// Function to refresh articles, scripts, and audio
async function updateArticles() {
  console.log("[Article Refresh] Fetching fresh articles...");
  // cachedArticles = fetchDummyArticles(); // Replace with real source
  cachedArticles = await fetchNews();
  const scriptsAndAudio = await generateScriptsAndAudioForArticles(
    cachedArticles
  ); // Generate scripts and audio
  cachedScripts = scriptsAndAudio.map((item) => item.script);
  cachedAudio = scriptsAndAudio.map((item) => item.audioUrl);
  lastUpdated = new Date();
}

// Run once on startup
updateArticles();

// Set interval to refresh every hour
setInterval(updateArticles, 60 * 60 * 1000); // 1 hour in ms

// GET route to serve cached articles, scripts, and audio
router.get("/get-articles", (_req, res) => {
  res.json({
    articles: cachedArticles,
    scripts: cachedScripts,
    audioUrls: cachedAudio,
    lastUpdated,
  });
});

// POST route for generating a news script and audio from a specific article
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

module.exports = router;
