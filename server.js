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

  const { state, risk } = await classify(text);
  const result = await respond({ text, state, risk });

  res.json(result);
});

app.listen(3001, () => {
  console.log('PROP backend running on http://localhost:3001');
});
//force deploy 
