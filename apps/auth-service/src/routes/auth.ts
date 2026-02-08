import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator';
import { LoginRequestSchema } from '../schemas/auth';
import { getUserByUsername } from '../queries';
import { UnauthorizedException } from '@pms/middlewares';
import { verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { UserResponseSchema } from '../schemas/user';

const router = new Hono();

router.post('/login', sValidator('json', LoginRequestSchema), async (c) => {
  const { username, password } = c.req.valid('json');

  const user = await getUserByUsername(username);

  if (!user) throw new UnauthorizedException('Invalid Credentials');

  if (await verify(user.password, password)) {
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return c.json({
      status: 'success',
      data: {
        token,
        user: UserResponseSchema.parse(user),
      },
    });
  }

  throw new UnauthorizedException('Invalid Credentials');
});

export default router;
