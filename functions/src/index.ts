import * as functions from 'firebase-functions';
import { googleTts } from '../../src/features/googletts/googletts';

// Google Cloud TTSクライアントの初期化
// const textToSpeech = require('@google-cloud/text-to-speech');
// const client = new textToSpeech.TextToSpeechClient();

export const googleTtsFunction = functions.https.onRequest(async (req, res) => {
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