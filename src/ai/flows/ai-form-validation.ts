'use server';

/**
 * @fileOverview This file defines an AI-powered form validation flow that analyzes form configurations and suggests improvements for user experience, localization, and accessibility.
 *
 * - aiFormValidation - An async function that takes form data and returns AI-powered suggestions for improvement.
 * - AiFormValidationInput - The input type for the aiFormValidation function.
 * - AiFormValidationOutput - The output type for the aiFormValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFormValidationInputSchema = z.object({
  formConfiguration: z
    .string()
    .describe('The JSON configuration of the form to be validated.'),
  userContext: z
    .string()
    .optional()
    .describe(
      'Optional context about the user, such as their location or language.'
    ),
});
export type AiFormValidationInput = z.infer<typeof AiFormValidationInputSchema>;

const AiFormValidationOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'AI-powered suggestions for improving the form configuration, including UX, localization, and accessibility considerations.'
    ),
});
export type AiFormValidationOutput = z.infer<typeof AiFormValidationOutputSchema>;

export async function aiFormValidation(input: AiFormValidationInput): Promise<AiFormValidationOutput> {
  return aiFormValidationFlow(input);
}

const aiFormValidationPrompt = ai.definePrompt({
  name: 'aiFormValidationPrompt',
  input: {schema: AiFormValidationInputSchema},
  output: {schema: AiFormValidationOutputSchema},
  prompt: `You are an AI-powered form validation assistant. Your task is to analyze the provided form configuration and provide suggestions for improvement, focusing on user experience, localization, and accessibility.

Form Configuration:
```json
{{{formConfiguration}}}
```

User Context (optional):
{{{userContext}}}

Consider the following aspects:

*   Input types: Suggest appropriate input types for each field (e.g., email, number, date).
*   Input size: Recommend optimal input sizes for better readability.
*   Localization: Anticipate potential localization issues and advise solutions.
*   Accessibility: Identify and address potential accessibility concerns.
*   Security: Conditionally assess parameters for security purposes.

Provide your suggestions in a clear and concise manner.
`,
});

const aiFormValidationFlow = ai.defineFlow(
  {
    name: 'aiFormValidationFlow',
    inputSchema: AiFormValidationInputSchema,
    outputSchema: AiFormValidationOutputSchema,
  },
  async input => {
    const {output} = await aiFormValidationPrompt(input);
    return output!;
  }
);
