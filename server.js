import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { classify } from "./classify.js";
import { respond } from "./respond.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

// 🧠 PAMIĘĆ UŻYTKOWNIKÓW
const userSessions = {};

app.post("/message", async (req, res) => {
  try {
    const { text, userId = "default-user" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Brak tekstu" });
    }

    const now = Date.now();

    // 🔹 tworzenie usera jeśli nie istnieje
    if (!userSessions[userId]) {
      userSessions[userId] = {
        lastMessageTime: null,
        topics: [],
        states: [],
      };
    }

    const session = userSessions[userId];

    // 🧠 TIME CONTEXT
    let timeContext = "continuous";

    if (!session.lastMessageTime) {
      timeContext = "new";
    } else if (now - session.lastMessageTime > 1000 * 60 * 16) {
      timeContext = "return";
    }

    session.lastMessageTime = now;

    // 🧠 ANALIZA
    const analysis = await classify(text);

    // 🧠 ZAPIS PAMIĘCI
    session.states.push(analysis.state);

    // 🔹 prosty topic (z tekstu)
    session.topics.push(text);
    // 🧠 INSIGHT (prosty wykrywacz wzorców)
	let insight = null;

    // 🔹 najczęstszy stan
	const freq = {};
	session.states.forEach((s) => {
  	freq[s] = (freq[s] || 0) + 1;
	});

	const dominantState = Object.keys(freq).reduce((a, b) =>
 	 freq[a] > freq[b] ? a : b
	);

    // 🔹 jeśli powtarza się 3+ razy
	if (freq[dominantState] >= 3) {
 	 insight = `Użytkownik często wraca do stanu: 	${dominantState}`;
	}

    // 🔹 ograniczenie pamięci
    if (session.states.length > 10) session.states.shift();
    if (session.topics.length > 10) session.topics.shift();

    // 💬 ODPOWIEDŹ
    const result = await respond({
      text,
      analysis,
      timeContext,
      memory: session,
      insight,
    });

    res.json({
      reply: result.reply,
      mode: result.mode,
      analysis,
      timeContext,
      memory: session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.listen(PORT, () => {
  console.log(`Server działa na porcie ${PORT}`);
});