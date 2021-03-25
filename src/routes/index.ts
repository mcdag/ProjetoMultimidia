import { Router } from 'express';

import podcastRouter from './poscast.routes';

const routes = Router();
routes.use('/audio', podcastRouter);

export default routes;
