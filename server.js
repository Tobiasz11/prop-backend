import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { classify } from "./classify.js";
import { respond } from "./respond.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

//PAMIĘĆ CZASU (MVP)
let lastMessageTime = null;

app.post("/message", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Brak tekstu" });
    }

//TIME CONTEXT
    const now = Date.now();

    let timeContext = "continuous";

    if (!lastMessageTime) {
      timeContext = "new";
    } else if (now - lastMessageTime > 1000 * 60 * 5) {
      timeContext = "return"; // >1h przerwy
    }

    lastMessageTime = now;

//ANALIZA
    const analysis = await classify(text);

//ODPOWIEDŹ
    const result = await respond({ text, analysis, timeContext });

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