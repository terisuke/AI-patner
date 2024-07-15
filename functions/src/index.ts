import * as functions from 'firebase-functions';
import { googleTts } from '../../src/features/googletts/googletts';
import express from 'express';
import cors from 'cors';

const app = express();

// CORS設定を追加
app.use(cors({ origin: true }));

app.get('/googleTtsFunction', async (req, res) => {
  const message = req.query.message as string || 'Hello, world!';
  const ttsType = req.query.ttsType as string || 'en-US-Standard-F';
  console.log(req.query);
  try {
    const { audio } = await googleTts(message, ttsType);
    res.setHeader('Content-Type', 'audio/wav');
    res.send(audio);
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).send(err);
  }
});

exports.googleTtsFunction = functions.https.onRequest(app);
