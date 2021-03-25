import Translate from '@google-cloud/translate';

import QueueService from '../services/QueueService';

import gcpCredentials from '../config/gcp';

interface Request {
  data: { originalText: string };
}

export default {
  key: 'GCPTranslate',
  async execute({ data }: Request): any {
    const { originalText } = data;
    console.log('GCPTranslate running...');
    const translate = new Translate.v2.Translate({
      credentials: gcpCredentials,
    });
    const text = originalText;
    const target = 'en';

    const [translation] = await translate.translate(text, target);
    console.log(`Translation: ${translation}`);

    QueueService.add('GCPTextToSpeech', {
      originalText: translation,
    });

    return translation;
  },
};
