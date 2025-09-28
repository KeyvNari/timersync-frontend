import { client } from '../axios';
import { User } from '../entities/users';

export async function getAccountInfo() {
  const response = await client.get('/api/v1/user/me/');
  return User.parse(response.data);
}