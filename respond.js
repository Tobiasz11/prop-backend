import OpenAI from 'openai';
import fs from 'fs';
import { SAFETY_MESSAGE } from './safety.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const systemPrompt = fs.readFileSync('./prompts/system_suprop.txt', 'utf8');

export async function respond({ text, state, risk }) {
  if (risk === 'HIGH') {
    return { type: 'SAFETY', message: SAFETY_MESSAGE };
  }

  if (state === 'AGGRESSION' || state === 'ANXIETY') {
    return {
      type: 'GESTURE',
      message: 'Jeśli jest za dużo, możesz po prostu przytrzymać ekran.'
    };
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ],
    temperature: 0.4
  });

  return {
    type: 'MESSAGE',
    message: completion.choices[0].message.content
  };
}
