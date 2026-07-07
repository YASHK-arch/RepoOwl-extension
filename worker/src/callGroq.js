import Groq from 'groq-sdk';
import { validateGroqResponse } from './validateGroqResponse.js';

/**
 * Validates the API key
 */
export function assertGroqApiKey(apiKey) {
  const trimmed = apiKey?.trim() || '';
  if (!trimmed) {
    throw new Error('GROQ_API_KEY is empty. Please provide a valid Groq API key.');
  }
}

export async function callGroq(prompt, apiKey) {
  const client = new Groq({ apiKey: apiKey.trim() });

  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI assistant. You must respond in valid JSON format matching this schema:\n' +
                   '{ "context": "string", "duplicate_data": { "original_issue_ids": [integer], "explanation": "string" } }\n' +
                   'Ensure the JSON is well-formed.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('Groq API returned an empty response.');
    }

    return validateGroqResponse(JSON.parse(text));
  } catch (error) {
    console.error('\n========================================');
    console.error('🔥 ACTUAL RAW GROQ ERROR:');
    console.error(error);
    console.error('========================================\n');
    throw new Error(`Groq API Failed: ${error.message || error}`);
  }
}