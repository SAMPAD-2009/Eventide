
'use server';
/**
 * @fileOverview A simple text summarization AI flow.
 *
 * - summarize - A function that takes text and returns a one-sentence summary.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeInputSchema = z.string().describe('The text to summarize.');
const SummarizeOutputSchema = z.string().describe('The one-sentence summary.');

export async function summarize(text: string): Promise<string> {
  return summarizeFlow(text);
}

const prompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: { schema: SummarizeInputSchema },
  output: { schema: SummarizeOutputSchema },
  prompt: `You are an expert at summarizing text.
  
  Please summarize the following text into a single, concise sentence.
  
  TEXT:
  {{{input}}}`,
});

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
