import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [UsersModule, AuthenticationModule],
  providers: [PrismaService],
})
export class AppModule {}
