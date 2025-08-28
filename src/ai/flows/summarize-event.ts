'use server';

/**
 * @fileOverview A flow for summarizing event details using AI.
 *
 * - summarizeEvent - A function that takes event details and returns a short summary.
 * - SummarizeEventInput - The input type for the summarizeEvent function.
 * - SummarizeEventOutput - The return type for the summarizeEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEventInputSchema = z.object({
  details: z.string().describe('The detailed description of the event.'),
});
export type SummarizeEventInput = z.infer<typeof SummarizeEventInputSchema>;

const SummarizeEventOutputSchema = z.object({
  summary: z.string().describe('A short, concise summary of the event details.'),
});
export type SummarizeEventOutput = z.infer<typeof SummarizeEventOutputSchema>;

export async function summarizeEvent(input: SummarizeEventInput): Promise<SummarizeEventOutput> {
  return summarizeEventFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEventPrompt',
  input: {schema: SummarizeEventInputSchema},
  output: {schema: SummarizeEventOutputSchema},
  prompt: `You are an event summarization expert.  You will be provided with the detailed description of an event, and you will generate a short, concise summary of the event.

Event Details: {{{details}}}`,
});

const summarizeEventFlow = ai.defineFlow(
  {
    name: 'summarizeEventFlow',
    inputSchema: SummarizeEventInputSchema,
    outputSchema: SummarizeEventOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
