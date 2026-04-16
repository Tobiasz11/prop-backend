import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function respond({ text, analysis, timeContext, memory }) {
  const { intent, regulation } = analysis;

  let mode = "normal";

  if (intent === "vent") mode = "vent";
  if (regulation === "dysregulated") mode = "regulate";

  const systemPrompt = `
Jesteś rozmówcą, nie chatbotem.

Ostatnie emocje użytkownika: ${memory.states.join(", ")}
Ostatnie tematy: ${memory.topics.slice(-3).join(" | ")}

Możesz delikatnie nawiązać do wcześniejszych rzeczy, jeśli pasuje.
Nie rób tego zawsze.

Styl:
- mów naturalnie, po ludzku
- unikaj "brzmi jak", "rozumiem że"
- możesz używać luźnych zwrotów
- nie bądź perfekcyjny

Zasady:
- max 1 pytanie
- czasem bez pytania
- krótsze odpowiedzi
- naturalność
- brak ocen
- jeden wątek

Kontekst czasu: ${timeContext}

Jeśli:
- new → zacznij naturalnie
- return → zauważ powrót (np. "fajnie, że wróciłeś")
- continuous → kontynuuj rozmowę

Tryb: ${mode}

TRYBY:

VENT:
- pozwól się wygadać
- nie analizuj za dużo
- bądź obecny

REGULATE:
- uspokajaj
- zwalniaj rozmowę
- skup się na emocji

NORMAL:
- naturalna rozmowa
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });

  return {
    reply: res.choices[0].message.content,
    mode,
  };
}