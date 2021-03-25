import 'dotenv/config';
import Queue from 'bull';
import redisConfig from '../config/redis';

import * as jobs from '../jobs';

const queues = Object.values(jobs.default).map(job => ({
  bull: new Queue(job.key, redisConfig),
  name: job.key,
  execute: job.execute,
}));

export default {
  queues,
  add(name: string, data: any) {
    const selectedQueue = this.queues.find(queue => queue.name === name);

    return selectedQueue?.bull.add(data);
  },
  process() {
    return this.queues.forEach(queue => {
      queue.bull.process(queue.execute);

      queue.bull.on('failed', (job, error) => {
        console.log(`Job ${job.name} failed with ${job.data}.`);
        console.log(`Error: ${error}`);
      });
    });
  },
};
