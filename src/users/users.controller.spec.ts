import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      findOne: (id: number) => {
        const user = users.find((obj) => {
          return obj.id === id;
        });
        return Promise.resolve(user);
      },

      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      remove: (id: number) => {
        return null;
      },
      update: (id, body) => {
        return Promise.resolve({
          id,
          email: 'email@email.com',
          password: 'pass',
        } as User);
      },
    };

    fakeAuthService = {
      signup: (email: string, password: string) => {
        const user = {
          id: 1,
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('whoAmI should return user when user is signed in', async () => {
    const user = {
      id: 1,
      email: 'email@email.com',
      password: 'pass',
    } as User;
    await expect(controller.whoAmI(user)).resolves.toEqual(user);
  });

  it('whoAmI should throw when user is not signed in', async () => {
    await expect(controller.whoAmI(null as User)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findUser should find an user with given id', async () => {
    await fakeAuthService.signup('email@email.com', 'password');

    await expect(controller.findUser('1')).toBeDefined();
  });

  it('findUser should throw when user with given id is not found', async () => {
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('findUAllUsers should return an array of users with given email', async () => {
    await fakeAuthService.signup('email@email.com', 'password');

    await expect(controller.findAllUsers('email@email.com')).not.toEqual([]);
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: 0 };
    const user = await controller.signIn(
      {
        email: 'email@email.com',
        password: 'pass',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('createUser updates session object and returns user', async () => {
    const session = { userId: 0 };
    const user = await controller.createUser(
      {
        email: 'email@email.com',
        password: 'pass',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('Singout updates session object with null and returns string', async () => {
    const session = { userId: 1 };
    const response = await controller.signOut(session);

    expect(response).toEqual('you signed out successfully!');
    expect(session.userId).toEqual(null);
  });

  it('Delets user ', async () => {
    const user = await controller.removeUser('1');

    expect(user).toBeDefined();
  });

  it('Updates user ', async () => {
    const user = await controller.updateUser('1', {
      email: 'email2@gmail.com',
      password: 'password',
    });

    expect(user).toBeDefined();
  });
});
