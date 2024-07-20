import * as functions from 'firebase-functions';
import { googleTts } from '../../src-shared/features/googletts/googletts';

export const googleTtsFunction = functions.https.onRequest(async (req, res) => {
  // CORSヘッダーを設定
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストに対応
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { message, ttsType } = req.body;
  console.log('受信したリクエスト:', { message, ttsType });

  try {
    const { audio } = await googleTts(message, ttsType);
    res.setHeader('Content-Type', 'audio/wav');
    res.send(audio);
  } catch (err) {
    console.error('エラー:', err);
    res.status(500).send('Internal Server Error');
  }
});