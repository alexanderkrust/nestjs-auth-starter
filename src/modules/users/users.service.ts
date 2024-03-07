import { UnprocessableEntityException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
import { RegisterPayload } from 'src/types/authentication';

@Injectable()
export class UsersService {
  private readonly userRepository: UsersRepository;

  public constructor(users: UsersRepository) {
    this.userRepository = users;
  }

  public async validateCredentials(
    user: User,
    password: string,
  ): Promise<boolean> {
    return compare(password, user.password);
  }

  public async createUserFromRequest(request: RegisterPayload): Promise<User> {
    const { email, password, firstname, lastname } = request;

    const existingFromEmail = await this.findForEmail(request.email);

    if (existingFromEmail) {
      throw new UnprocessableEntityException('Email already in use');
    }

    try {
      const user = await this.userRepository.create({
        email,
        password,
        firstname,
        lastname,
      });
      return user;
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  public async findForId(id: string): Promise<User | null> {
    return this.userRepository.findForId(id);
  }

  public async findForEmail(email: string): Promise<User | null> {
    return this.userRepository.findForEmail(email);
  }
}
