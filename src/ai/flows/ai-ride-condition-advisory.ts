'use server';
/**
 * @fileOverview This file implements a Genkit flow that provides an AI-generated advisory for motorcycle riding conditions based on weather data.
 *
 * - aiRideConditionAdvisory - A function that generates a riding condition advisory.
 * - AIRideConditionAdvisoryInput - The input type for the aiRideConditionAdvisory function.
 * - AIRideConditionAdvisoryOutput - The return type for the aiRideConditionAdvisory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIRideConditionAdvisoryInputSchema = z.object({
  locationDescription: z.string().describe('A description of the location or event for which the advisory is requested (e.g., "Rome, Italy tomorrow" or "Our club ride near Milan on May 15th").'),
  weatherData: z.string().describe('Raw weather forecast data in JSON format for the specified location and time. This data will be parsed by the AI to generate the advisory.'),
});
export type AIRideConditionAdvisoryInput = z.infer<typeof AIRideConditionAdvisoryInputSchema>;

const AIRideConditionAdvisoryOutputSchema = z.object({
  overallAdvisory: z.string().describe('A concise overall summary of the riding conditions.'),
  isSafeToRide: z.boolean().describe('True if riding is generally safe given the conditions, false otherwise.'),
  hazardLevel: z.enum(['low', 'medium', 'high']).describe('The assessed level of hazards for riding.'),
  recommendations: z.array(z.string()).describe('Specific recommendations or precautions for riders based on the weather.'),
  temperatureRange: z.string().describe('The expected temperature range (e.g., "15°C to 22°C").'),
  precipitationRisk: z.string().describe('Description of precipitation risk (e.g., "Low (5% chance of rain)", "Moderate (scattered showers)").'),
  windConditions: z.string().describe('Description of wind speed and direction (e.g., "Moderate winds (15-25 km/h) from the West", "Strong gusts possible").'),
});
export type AIRideConditionAdvisoryOutput = z.infer<typeof AIRideConditionAdvisoryOutputSchema>;

export async function aiRideConditionAdvisory(input: AIRideConditionAdvisoryInput): Promise<AIRideConditionAdvisoryOutput> {
  return aiRideConditionAdvisoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRideConditionAdvisoryPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: AIRideConditionAdvisoryInputSchema },
  output: { schema: AIRideConditionAdvisoryOutputSchema },
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an expert motorcycle riding conditions analyst and safety advisor. Your task is to analyze weather data and provide a comprehensive advisory for motorcycle club members, focusing on safety, enjoyment, and potential hazards.

Analyze the provided weather data for "{{locationDescription}}" and generate a structured advisory.

Weather Data (JSON):
{{{weatherData}}}

Based on this weather data, provide the following:
1. An overall summary of the riding conditions.
2. A boolean indicating if it's generally safe to ride.
3. An assessment of the hazard level (low, medium, or high).
4. Specific recommendations or precautions for riders.
5. The expected temperature range.
6. The description of precipitation risk.
7. The description of wind conditions.

Provide your response strictly in JSON format according to the output schema.`,
});

const aiRideConditionAdvisoryFlow = ai.defineFlow(
  {
    name: 'aiRideConditionAdvisoryFlow',
    inputSchema: AIRideConditionAdvisoryInputSchema,
    outputSchema: AIRideConditionAdvisoryOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      
      if (!output) {
        return {
          overallAdvisory: "Impossibile generare un'informativa dettagliata. Si consiglia prudenza generica.",
          isSafeToRide: true,
          hazardLevel: 'medium',
          recommendations: ["Controllare sempre le condizioni meteo locali prima di mettersi in viaggio.", "Mantenere una guida difensiva."],
          temperatureRange: "N/D",
          precipitationRisk: "N/D",
          windConditions: "N/D"
        };
      }
      
      return output;
    } catch (error) {
      console.error("Genkit prompt execution failed:", error);
      // Return a safe default instead of crashing the page
      return {
        overallAdvisory: "Servizio di consulenza AI temporaneamente non disponibile. Guidare con la massima attenzione.",
        isSafeToRide: true,
        hazardLevel: 'medium',
        recommendations: ["Verificare manualmente le condizioni meteo.", "Attenersi ai protocolli di sicurezza standard del club."],
        temperatureRange: "Dati non disponibili",
        precipitationRisk: "Dati non disponibili",
        windConditions: "Dati non disponibili"
      };
    }
  }
);
