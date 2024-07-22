const functions = require('firebase-functions');
const { googleTts } = require('../src-main/features/googletts/googletts.ts');
const { nanoid } = require('nanoid');

exports.googleTtsFunction = functions.https.onRequest(async (req, res) => {
  const message = req.query.message || 'Hello, world!';
  const ttsType = req.query.ttsType || 'en-US-Standard-B';

  try {
    const { audio } = await googleTts(message, ttsType);
    const id = nanoid();  // nanoidを使用
    res.setHeader('Content-Type', 'audio/wav');
    res.send(audio);
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).send(err);
  }
});
