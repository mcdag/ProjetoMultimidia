import { Storage } from '@google-cloud/storage';

import gcpCredentials from '../config/gcp';

interface Request {
  audioFilePath: string;
}

class GCPUploadPodcastService {
  public async execute({ audioFilePath }: Request): Promise<string> {
    const bucketName = 'podcast-translator-bucket-2';
    const filename = audioFilePath;
    const storage = new Storage({
      credentials: gcpCredentials,
    });

    const response = await storage.bucket(bucketName).upload(filename, {
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    const { mediaLink } = response[0].metadata;
    return response ? mediaLink : 500;
  }
}

export default GCPUploadPodcastService;
