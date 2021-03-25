import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import util from 'util';

import GCPUploadPodcastService from '../services/GCPUploadPodcastService';
import EmailSenderService from '../services/EmailSenderService';

import gcpCredentials from '../config/gcp';

interface Request {
  data: { originalText: string };
}

export default {
  key: 'GCPTextToSpeech',
  async execute({ data }: Request): any {
    const recipientEmail = 'jbmn2@cin.ufpe.br';
    const gcpUploadPodcast = new GCPUploadPodcastService();
    const emailSender = new EmailSenderService();

    const client = new textToSpeech.TextToSpeechClient({
      credentials: gcpCredentials,
    });
    const { originalText } = data;
    const text = originalText;

    // Construct the request
    const request = {
      input: { text },
      voice: { languageCode: 'en-US-Wavenet-A', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('./tmp/output/output.mp3', response.audioContent, 'binary');

    console.log('Audio content written to file: output.mp3');

    const audioFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      'output',
      'output.mp3',
    );
    const fileUrl = await gcpUploadPodcast.execute({ audioFilePath });
    const email = {
      sender: 'jbmn2@cin.ufpe.br',
      recipient: recipientEmail,
      subject: 'A tradução do seu podcast está pronta!',
      content: `Aqui está o link para a tradução de seu podcast!\nLink: ${fileUrl}`,
    };
    await emailSender.execute(email);

    return emailSender ? 200 : 500;
  },
};
