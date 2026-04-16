import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { classify } from "./classify.js";
import { respond } from "./respond.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

//PAMIĘĆ UŻYTKOWNIKÓW (MVP)
const userSessions = {};

app.post("/message", async (req, res) => {
  try {
    const { text, userId = "default-user" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Brak tekstu" });
    }

//TIME CONTEXT PER USER
    const now = Date.now();

    if (!userSessions[userId]) {
      userSessions[userId] = {
        lastMessageTime: null,
      };
    }

    let timeContext = "continuous";

    const lastTime = userSessions[userId].lastMessageTime;

    if (!lastTime) {
      timeContext = "new";
    } else if (now - lastTime > 5000) {
// 5 sekund do testów
      timeContext = "return";
    }

    userSessions[userId].lastMessageTime = now;

//ANALIZA
    const analysis = await classify(text);

//ODPOWIEDŹ
    const result = await respond({
      text,
      analysis,
      timeContext,
    });

    res.json({
      reply: result.reply,
      mode: result.mode,
      analysis,
      timeContext,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.listen(PORT, () => {
  console.log(`Server działa na porcie ${PORT}`);
});