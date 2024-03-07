import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TokensService } from './tokens.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';

import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: '5m',
      },
    }),
    UsersModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    JwtStrategy,
    PrismaService,
    TokensService,
    RefreshTokensRepository,
  ],
})
export class AuthenticationModule {}
