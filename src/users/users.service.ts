import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      username: 'Alex',
      password: 'Alexa',
      role: Role.USER,
    },
    {
      id: 2,
      username: 'Sara',
      password: '182240',
      role: Role.USER,
    },
    {
      id: 3,
      username: 'Amin',
      password: 'amir',
      role: Role.ADMIN,
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findOneById(userId: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === userId);
  }
}
