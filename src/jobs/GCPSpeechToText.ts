import speech from '@google-cloud/speech';

import QueueService from '../services/QueueService';

import gcpCredentials from '../config/gcp';

interface Request {
  data: { gcpBucketFileUrl: string };
}

export default {
  key: 'GCPSpeechToText',
  async execute({ data }: Request): any {
    const { gcpBucketFileUrl } = data;
    const client = new speech.v1p1beta1.SpeechClient({
      credentials: gcpCredentials,
    });
    const audio = {
      uri: gcpBucketFileUrl,
    };
    // Audio .wav, mono, 44100 Hertz
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 44100,
      audioChannelCount: 2,
      enableAutomaticPunctuation: true,
      languageCode: 'pt-BR',
    };
    const request = {
      audio,
      config,
    };

    // Detects speech in the audio file
    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results
      ?.map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log(`Transcription: ${transcription}`);

    QueueService.add('GCPTranslate', {
      originalText: transcription,
    });

    return transcription;
  },
};
