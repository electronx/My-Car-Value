import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hased password', async () => {
    const user = await service.signup('email@test.com', 'pass');

    expect(user.password).not.toEqual('pass');

    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  // it('throws an err if user signs up with email already in use', async () => {
  //   // redefine fakeUsersService.find method to test different scenarios
  //   fakeUsersService.find = () =>
  //     Promise.resolve([
  //       { id: 1, email: 'email@test.com', password: 'pass' } as User,
  //     ]);

  //   // we expect that when service.signup rejects cause there is already an user
  //   //  with provided email, to throw a BadRequestException
  //   await expect(service.signup('email@test.com', 'pass')).rejects.toThrow(
  //     BadRequestException,
  //   );
  // });

  // it('throws if signin is called with an unused email', async () => {
  //   await expect(
  //     service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
  //   ).rejects.toThrow(NotFoundException);
  // });

  // it('throws if an invalid password is provided', async () => {
  //   fakeUsersService.find = () =>
  //     Promise.resolve([
  //       { email: 'asdf@asdf.com', password: 'laskdjf' } as User,
  //     ]);
  //   await expect(
  //     service.signin('laskdjf@alskdfj.com', 'passowrd'),
  //   ).rejects.toThrow(BadRequestException);
  // });

  // INTELLIGENT TESTING WITH BETTER fakeUSersService

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('laskdjf@alskdfj.com', 'password');
    await expect(
      service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if email and password is correct', async () => {
    const userz = await service.signup('email@email.com', 'pass');

    const user = await service.signin('email@email.com', 'pass');

    expect(user).toBeDefined();
  });
});
