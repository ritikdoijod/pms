import { Hono } from 'hono';
import { errorHandler } from '@pms/middlewares';

import users from './routes/users';
import auth from './routes/auth';

const app = new Hono();

app.onError(errorHandler);

app.route('/auth', auth);
app.route('/users', users);

export { app };
