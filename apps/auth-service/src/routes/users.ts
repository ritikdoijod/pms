import { Hono } from 'hono';
import { getUsers } from '../queries';
import { UserResponseSchema } from '../schemas/user';

const router = new Hono();

// get users
router.get('/', async (c) => {
  const users = await getUsers();

  return c.json({
    status: 'success',
    data: { users: users.map((user) => UserResponseSchema.parse(user)) },
  });
});


// get user

// create user
router.post('/', async (c) => {
  
})



export default router;
