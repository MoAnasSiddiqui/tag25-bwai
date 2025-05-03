// Summarize a news article into a concise script for an avatar to deliver.
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {NewsArticle} from '@/services/news-scraper';

const SummarizeNewsArticleInputSchema = z.object({
  article: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
  }).describe('The news article to summarize.'),
});

export type SummarizeNewsArticleInput = z.infer<typeof SummarizeNewsArticleInputSchema>;

const SummarizeNewsArticleOutputSchema = z.object({
  script: z.string().describe('The summarized news script for the avatar.'),
});

export type SummarizeNewsArticleOutput = z.infer<typeof SummarizeNewsArticleOutputSchema>;

export async function summarizeNewsArticle(input: SummarizeNewsArticleInput): Promise<SummarizeNewsArticleOutput> {
  return summarizeNewsArticleFlow(input);
}

const summarizeNewsArticlePrompt = ai.definePrompt({
  name: 'summarizeNewsArticlePrompt',
  input: {
    schema: z.object({
      article: z.object({
        title: z.string(),
        content: z.string(),
        url: z.string(),
      }).describe('The news article to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      script: z.string().describe('The summarized news script for the avatar.'),
    }),
  },
  prompt: `Summarize the following news article into a concise script suitable for a news anchor avatar to deliver. The script should be professional, well-paced, and appropriate for television news reporting. Include the source URL in the script.\n\nTitle: {{{article.title}}}\nContent: {{{article.content}}}\nSource URL: {{{article.url}}}`,
});

const summarizeNewsArticleFlow = ai.defineFlow<
  typeof SummarizeNewsArticleInputSchema,
  typeof SummarizeNewsArticleOutputSchema
>({
  name: 'summarizeNewsArticleFlow',
  inputSchema: SummarizeNewsArticleInputSchema,
  outputSchema: SummarizeNewsArticleOutputSchema,
},
async input => {
  const {output} = await summarizeNewsArticlePrompt(input);
  return output!;
});
