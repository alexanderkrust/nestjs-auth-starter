import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersRepository {
  public constructor(private prisma: PrismaService) {}

  public async findForId(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  public async findForEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  public async create(
    payload: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...payload,
        password: await hash(payload.password, 10),
      },
    });
  }
}
