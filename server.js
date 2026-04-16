import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { classify } from './classify.js';
import { respond } from './respond.js';

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();

app.use(cors());
app.use(express.json());

app.post('/message', async (req, res) => {
  const text = (req.body.text || '').trim();

 const analysis = await classify(text);
const result = await respond({ text, analysis });

  res.json(result);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`PROP backend running on port ${PORT}`);
});
