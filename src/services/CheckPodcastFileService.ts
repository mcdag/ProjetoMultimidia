import path from 'path';
import fs from 'fs';

import uploadConfig from '../config/upload';

interface Request {
  audioFileName: string;
}

class CheckPodcastFileService {
  public async execute({ audioFileName }: Request): Promise<number> {
    const podcastFilePath = path.join(uploadConfig.directory, audioFileName);
    const podcastFileExists = await fs.promises.stat(podcastFilePath);
    return podcastFileExists ? 200 : 500;
  }
}

export default CheckPodcastFileService;
