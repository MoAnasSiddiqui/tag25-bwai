const { z } = require("zod");
const { ai } = require("../ai/ai-instance"); // 🔁 Drop `.js` to avoid ESM headaches
//
// // Define the input schema for query generation
const QueryGeneratorInputSchema = z.object({
  region: z.string(), // Region name input (e.g., "Pakistan")
  previousQueries: z.array(z.string()).optional(), // Optional array of previous queries
});

// Define the output schema for query generation
const QueryGeneratorOutputSchema = z.object({
  search_queries: z.array(z.string()), // Array of generated search queries
});

// AI Prompt for generating search queries
const prompt = ai.definePrompt({
  name: "generateSearchQueryPrompt",
  input: { schema: QueryGeneratorInputSchema },
  output: { schema: QueryGeneratorOutputSchema },
  prompt: `You are a search query generation assistant. Your job is to create an optimized search engine query (for Google or Bing) that retrieves the latest news, articles, and blogs for a given region, using news websites that are either based in or regularly cover that region.
  
  Instructions:
  Accept the region name (e.g., "Pakistan", "East Africa", "Germany", "California") as input.
  
  Identify all the news websites that are either based in or regularly report on that region.
  
  Generate a search query that includes:
  
  Keywords like "latest news", "recent articles", "blogs", "updates", "May 2025".
  
  The region name as a required phrase.
  
  Relevant site-specific filters using site:domain.com for regional news outlets.
  
  Boolean operators (OR, parentheses) to combine multiple sites.
  
  Focus on retrieving content that is fresh and relevant to May 2025.
  
  Find news related to TECH, SPORTS, BUSINESS, ENTERTAINMENT, POLITICS, GEOGRAPHY.
  
  IGNORE SIMILAR NEWS.
  
  Output:
  Output only the final search query string (no explanation or formatting).
  
  Region: {{{region}}}`,
});

// Flow logic to generate search query
// Flow logic to generate search query
const generateSearchQueryFlow = ai.defineFlow(
  {
    name: "generateSearchQueryFlow",
    inputSchema: QueryGeneratorInputSchema,
    outputSchema: QueryGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input); // Generate the search query using the defined prompt

    // Flatten the search_queries array and append to previous queries if any
    return {
      search_queries: [
        ...(input.previousQueries || []),
        ...output.search_queries,
      ],
    };
  }
);

// Example usage
async function generateSearchQuery(region, previousQueries = []) {
  const input = { region, previousQueries };
  const { search_queries } = await generateSearchQueryFlow(input);
  return search_queries;
}

// Export the functions if needed
module.exports = {
  generateSearchQuery,
};
