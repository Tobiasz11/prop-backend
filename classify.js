import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classify(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Zanalizuj wiadomość użytkownika i zwróć JSON:

{
  "state": "smutek | lęk | złość | samotność | przeciążenie | neutral",
  "intent": "vent | seek_help | reflect | share | resist",
  "intensity": "low | medium | high",
  "regulation": "regulated | dysregulated"
}

Zasady:
- vent = wyrzucanie emocji
- dysregulated = chaos, dużo emocji
- high intensity = mocny język / napięcie

Zwróć TYLKO JSON.
        `,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return JSON.parse(res.choices[0].message.content);
}