// src/ai/flows/generate-news-script.ts
'use server';

/**
 * @fileOverview Generates a news script from article content for a digital avatar to present.
 *
 * - generateNewsScript - A function that takes news article content and returns a broadcast-ready script.
 * - GenerateNewsScriptInput - The input type for the generateNewsScript function.
 * - GenerateNewsScriptOutput - The return type for the generateNewsScript function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateNewsScriptInputSchema = z.object({
  articleTitle: z.string().describe('The title of the news article.'),
  articleContent: z.string().describe('The content of the news article.'),
  articleUrl: z.string().describe('The source URL of the news article.'),
});
export type GenerateNewsScriptInput = z.infer<typeof GenerateNewsScriptInputSchema>;

const GenerateNewsScriptOutputSchema = z.object({
  script: z.string().describe('The generated news script for the avatar to present.'),
});
export type GenerateNewsScriptOutput = z.infer<typeof GenerateNewsScriptOutputSchema>;

export async function generateNewsScript(input: GenerateNewsScriptInput): Promise<GenerateNewsScriptOutput> {
  return generateNewsScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsScriptPrompt',
  input: {
    schema: z.object({
      articleTitle: z.string().describe('The title of the news article.'),
      articleContent: z.string().describe('The content of the news article.'),
      articleUrl: z.string().describe('The source URL of the news article.'),
    }),
  },
  output: {
    schema: z.object({
      script: z.string().describe('The generated news script for the avatar to present.'),
    }),
  },
  prompt: `You are a professional news script writer. Based on the following news article, create a broadcast-ready news script for a digital avatar to present. Ensure the script has an appropriate tone, pacing, and structure for television news reporting.  The script should be approximately 200 words.

Article Title: {{{articleTitle}}}
Article Content: {{{articleContent}}}
Source URL: {{{articleUrl}}}`, //Include the source url in the prompt so it has all info
});

const generateNewsScriptFlow = ai.defineFlow<
  typeof GenerateNewsScriptInputSchema,
  typeof GenerateNewsScriptOutputSchema
>({
  name: 'generateNewsScriptFlow',
  inputSchema: GenerateNewsScriptInputSchema,
  outputSchema: GenerateNewsScriptOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
