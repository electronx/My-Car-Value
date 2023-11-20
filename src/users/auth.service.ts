import { UsersService } from './users.service';
import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email, password) {
    // See if email is in use
    const user = await this.usersService.find(email);
    if (user.length) throw new BadRequestException('Email is already in use');
    // Hash the user passwords
    // a) Generate a salt
    const salt = randomBytes(8).toString('hex');
    // b) Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // c) Join thr hashed result and the salt

    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const newUser = await this.usersService.create(email, result);

    // return the user
    return newUser;
  }

  async signin(email, password) {
    // Find the user, if there is not one throw an error
    const [user] = await this.usersService.find(email);

    if (!user) throw new NotFoundException('Email or Password is wrong!');

    // Extract salt and storedHash from users.password and compare it to the entered passwored hashed again using salt
    const [salt, storedHash] = user.password.split('.');
    const newHash = (await scrypt(password, salt, 32)) as Buffer;

    // If there is no match throw an error, otherwise return user
    if (!(newHash.toString('hex') === storedHash))
      throw new BadRequestException('Email or Password is wrong!');

    return user;
  }
}
