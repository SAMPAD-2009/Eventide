
'use server';
/**
 * @fileOverview An AI flow for parsing natural language into a structured task.
 *
 * - parseTask - A function that takes a string and returns a structured task object.
 * - ParsedTask - The output type for the parseTask function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PRIORITIES } from '@/lib/priorities';
import { format } from 'date-fns';

const priorityLevels = PRIORITIES.map(p => p.level);

const ParsedTaskSchema = z.object({
  title: z.string().describe('The main title of the task.'),
  description: z.string().optional().describe('Any additional details about the task.'),
  due_date: z.string().optional().describe('The due date in YYYY-MM-DD format.'),
  priority: z.enum(priorityLevels as [string, ...string[]]).default('Casual').describe('The priority of the task.'),
  project_id: z.string().default('Inbox').describe("The project or category for the task. This is often indicated by a hashtag, like #work or #shopping. If no project is specified, default to 'Inbox'."),
  label_id: z.string().optional().describe('Any specific label associated with the task, often using a hashtag.'),
});
export type ParsedTask = z.infer<typeof ParsedTaskSchema>;

export async function parseTask(input: string): Promise<ParsedTask> {
  const result = await parseTaskFlow(input);
  // Ensure due_date is correctly formatted if it exists
  if (result.due_date) {
    try {
      result.due_date = format(new Date(result.due_date), 'yyyy-MM-dd');
    } catch (e) {
      console.warn("Could not parse date from AI, leaving it as is:", result.due_date);
    }
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'parseTaskPrompt',
  input: { schema: z.string() },
  output: { schema: ParsedTaskSchema },
  prompt: `You are an expert at parsing natural language text into structured task data.
  
  Analyze the following text and extract the task details.
  
  - The current date is ${format(new Date(), 'PPPP')}.
  - Identify the main action as the 'title'.
  - Any secondary information should be the 'description'.
  - If a date or time is mentioned (e.g., "tomorrow", "next Friday", "in 2 hours"), determine the exact due date and format it as YYYY-MM-DD.
  - Determine the priority. Words like "urgent", "asap", or "important" indicate a higher priority. Default to 'Casual'. The available priorities are: ${priorityLevels.join(', ')}.
  - Identify the project. Projects are usually prefixed with a hashtag (#), like #work, #home, #shopping. If no project is specified, use 'Inbox'.
  
  TEXT:
  {{{input}}}
  `,
});

const parseTaskFlow = ai.defineFlow(
  {
    name: 'parseTaskFlow',
    inputSchema: z.string(),
    outputSchema: ParsedTaskSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
