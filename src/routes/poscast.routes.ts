import multer from 'multer';
import path from 'path';

import { Request, Response, Router } from 'express';

import CheckPodcastFileService from '../services/CheckPodcastFileService';
import GCPUploadPodcastService from '../services/GCPUploadPodcastService';
import QueueService from '../services/QueueService';

import uploadConfig from '../config/upload';

const podcastRouter = Router();
const upload = multer(uploadConfig);

podcastRouter.patch(
  '/upload',
  upload.single('podcast_file'),
  async (request: Request, response: Response) => {
    try {
      const { filename } = request.file;
      const checkUploadPodcast = new CheckPodcastFileService();
      const audioFile = await checkUploadPodcast.execute({
        audioFileName: filename,
      });

      if (audioFile) {
        const gcpUploadPodcast = new GCPUploadPodcastService();
        const audioFilePath = path.resolve(
          __dirname,
          '..',
          '..',
          'tmp',
          'input',
          filename,
        );
        const uploadFile = await gcpUploadPodcast.execute({ audioFilePath });
        console.log(uploadFile);
        // eslint-disable-next-line no-unused-expressions
        uploadFile ? response.sendStatus(200) : response.sendStatus(500);

        await new Promise(resolve => {
          setTimeout(resolve, 20 * 1000);
        });

        console.log('[API] Job GCPSpeechToText colocado na fila.');

        QueueService.add('GCPSpeechToText', {
          gcpBucketFileUrl: `gs://podcast-translator-bucket-2/${filename}`,
        });

        return '';
      }

      return response.sendStatus(500);
    } catch (error) {
      return response.sendStatus(500);
    }
  },
);

podcastRouter.get('/', (request: Request, response: Response) => {
  // QueueService.add('GCPSpeechToText', {
  //   gcpBucketFileUrl:
  //     'gs://podcast-translator-bucket-2/bce48ba1045ea8489c9e-audio-teste.wav',
  // });
  // QueueService.add('GCPTranslate', {
  //   originalText: 'Olá meu nome é José',
  // });
  QueueService.add('GCPTextToSpeech', {
    originalText:
      'Denote simple fat denied add worthy little use. As some he so high down am week. Conduct esteems by cottage to pasture we winding. On assistance he cultivated considered frequently. Person how having tended direct own day man. Saw sufficient indulgence one own you inquietude sympathize. Over fact all son tell this any his. No insisted confined of weddings to returned to debating rendered. Keeps order fully so do party means young. Table nay him jokes quick. In felicity up to graceful mistaken horrible consider. Abode never think to at. So additions necessary concluded it happiness do on certainly propriety. On in green taken do offer witty of. Certainty determine at of arranging perceived situation or. Or wholly pretty county in oppose. Favour met itself wanted settle put garret twenty. In astonished apartments resolution so an it. Unsatiable on by contrasted to reasonable companions an. On otherwise no admitting to suspicion furniture it. Cottage out enabled was entered greatly prevent message. No procured unlocked an likewise. Dear but what she been over gay felt body. Six principles advantages and use entreaties decisively. Eat met has dwelling unpacked see whatever followed. Court in of leave again as am. Greater sixteen to forming colonel no on be. So an advice hardly barton. He be turned sudden engage manner spirit. Pasture he invited mr company shyness. But when shot real her. Chamber her observe visited removal six sending himself boy. At exquisite existence if an oh dependent excellent. Are gay head need down draw. Misery wonder enable mutual get set oppose the uneasy. End why melancholy estimating her had indulgence middletons. Say ferrars demands besides her address. Blind going you merit few fancy their. Affronting everything discretion men now own did. Still round match we to. Frankness pronounce daughters remainder extensive has but. Happiness cordially one determine concluded fat. Plenty season beyond by hardly giving of. Consulted or acuteness dejection an smallness if. Outward general passage another as it. Very his are come man walk one next. Delighted prevailed supported too not remainder perpetual who furnished. Nay affronting bed projection compliment instrument. Drawings me opinions returned absolute in. Otherwise therefore sex did are unfeeling something. Certain be ye amiable by exposed so. To celebrated estimating excellence do. Coming either suffer living her gay theirs. Furnished do otherwise daughters contented conveying attempted no. Was yet general visitor present hundred too brother fat arrival. Friend are day own either lively new. For norland produce age wishing. To figure on it spring season up. Her provision acuteness had excellent two why intention. As called mr needed praise at. Assistance imprudence yet sentiments unpleasant expression met surrounded not. Be at talked ye though secure nearer. Suppose end get boy warrant general natural. Delightful met sufficient projection ask. Decisively everything principles if preference do impression of. Preserved oh so difficult repulsive on in household. In what do miss time be. Valley as be appear cannot so by. Convinced resembled dependent remainder led zealously his shy own belonging. Always length letter adieus add number moment she. Promise few compass six several old offices removal parties fat. Concluded rapturous it intention perfectly daughters is as. At distant inhabit amongst by. Appetite welcomed interest the goodness boy not. Estimable education for disposing pronounce her. John size good gay plan sent old roof own. Inquietude saw understood his friendship frequently yet. Nature his marked ham wished. Denote simple fat denied add worthy little use. As some he so high down am week. Conduct esteems by cottage to pasture we winding. On assistance he cultivated considered frequently. Person how having tended direct own day man. Saw sufficient indulgence one own you inquietude sympathize. Over fact all son tell this any his. No insisted confined of weddings to returned to debating rendered. Keeps order fully so do party means young. Table nay him jokes quick. In felicity up to graceful mistaken horrible consider. Abode never think to at. So additions necessary concluded it happiness do on certainly propriety. On in green taken do offer witty of. Certainty determine at of arranging perceived situation or. Or wholly pretty county in oppose. Favour met itself wanted settle put garret twenty. In astonished apartments resolution so an it. Unsatiable on by contrasted to reasonable companions an. On otherwise no admitting to suspicion furniture it. Cottage out enabled was entered greatly prevent message. No procured unlocked an likewise. Dear but what she been over gay felt body. Six principles advantages and use entreaties decisively. Eat met has dwelling unpacked see whatever followed. Court in of leave again as am. Greater sixteen to forming colonel no on be. So an advice hardly barton. He be turned sudden engage manner.',
  });

  response.sendStatus(200);
});

export default podcastRouter;
