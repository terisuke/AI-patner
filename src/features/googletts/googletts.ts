import * as textToSpeech from '@google-cloud/text-to-speech';

export async function googleTts(message: string, ttsType: string) {
  try {
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text: message },
      voice: { languageCode: 'en-US', name: ttsType, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'LINEAR16' },
    };

    const [response] = await client.synthesizeSpeech(request as textToSpeech.protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest);
    return { audio: response.audioContent };
  } catch (error) {
    console.error('Error during TTS request:', error);
    throw new Error('TTS request failed');
  }
}