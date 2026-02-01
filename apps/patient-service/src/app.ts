import { Hono } from 'hono';
import { router } from './routes';
import { errorHandler } from '@pms/middlewares';

const app = new Hono();

app.onError(errorHandler);

app.route('/patients', router);

export { app };
