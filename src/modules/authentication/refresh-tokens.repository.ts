import { Injectable } from '@nestjs/common';
import { RefreshToken, User } from '@prisma/client';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RefreshTokensRepository {
  constructor(private prisma: PrismaService) {}

  public async createRefreshToken(
    user: User,
    ttl: number,
  ): Promise<RefreshToken> {
    const token: RefreshToken = {} as RefreshToken;
    token.userId = user.id;
    token.is_revoked = false;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);

    token.expiresAt = expiration;

    const createdToken = await this.prisma.refreshToken.create({
      data: token,
    });

    return createdToken;
  }

  public async findTokenById(id: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: {
        id,
      },
    });
  }

  public async revokeToken(token: RefreshToken): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: {
        id: token.id,
      },
      data: {
        is_revoked: true,
      },
    });
  }
}
