import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prompt = fs.readFileSync('./prompts/classify.txt', 'utf8');

export async function classify(text) {
  if (!text) return { state: 'WITHDRAWAL', risk: 'LOW' };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: text }
    ],
    temperature: 0
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { state: 'WITHDRAWAL', risk: 'LOW' };
  }
}
