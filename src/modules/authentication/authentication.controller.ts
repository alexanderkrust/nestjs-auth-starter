import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JWTGuard } from './guards/jwt.guard';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { User } from '@prisma/client';
import {
  LoginPayload,
  LoginPayloadSchema,
  RefreshPayload,
  RefreshPayloadSchema,
  RegisterPayload,
  RegisterPayloadSchema,
} from 'src/types/authentication';

export interface AuthenticationPayload {
  user: Omit<User, 'password'>;
  token: {
    type: string;
    access_token: string;
    refresh_token?: string;
  };
}

@Controller('/api/auth')
export class AuthenticationController {
  private readonly users: UsersService;
  private readonly tokens: TokensService;

  public constructor(users: UsersService, tokens: TokensService) {
    this.users = users;
    this.tokens = tokens;
  }

  @Post('/register')
  public async register(@Body() body: RegisterPayload) {
    const validated = await RegisterPayloadSchema.safeParseAsync(body);

    if (!validated.success) {
      throw new BadRequestException('Bad Request');
    }

    const user = await this.users.createUserFromRequest(body);

    const token = await this.tokens.generateAccessToken(user);
    const refresh = await this.tokens.generateRefreshToken(
      user,
      60 * 60 * 24 * 30,
    );

    const payload = this.buildResponsePayload(user, token, refresh);

    return {
      ...payload,
    };
  }

  @Post('/login')
  public async login(@Body() body: LoginPayload) {
    const validated = await LoginPayloadSchema.safeParseAsync(body);

    if (!validated.success) {
      throw new BadRequestException('Bad Request.');
    }

    const { email, password } = body;

    const user = await this.users.findForEmail(email);
    const valid = user
      ? await this.users.validateCredentials(user, password)
      : false;

    if (!valid) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const token = await this.tokens.generateAccessToken(user);
    const refresh = await this.tokens.generateRefreshToken(
      user,
      60 * 60 * 24 * 30,
    );

    const payload = this.buildResponsePayload(user, token, refresh);

    return {
      status: 'success',
      data: payload,
    };
  }

  @Post('/refresh')
  public async refresh(@Body() body: RefreshPayload) {
    const validated = await RefreshPayloadSchema.safeParseAsync(body);

    if (!validated.success) {
      throw new BadRequestException('Bad Request.');
    }

    let user, token;
    try {
      const access_token = await this.tokens.createAccessTokenFromRefreshToken(
        body.refresh_token,
      );
      user = access_token.user;
      token = access_token.token;
    } catch (e) {
      throw new BadRequestException();
    }

    let refresh_token;
    try {
      refresh_token = await this.tokens.generateRefreshToken(
        user,
        60 * 60 * 24 * 30,
      );
    } catch (error) {
      throw new BadRequestException();
    }

    try {
      await this.tokens.revokeRefreshToken(body.refresh_token);
    } catch (error) {
      throw new BadRequestException();
    }

    const payload = this.buildResponsePayload(user, token);

    return {
      access_token: payload.token.access_token,
      refresh_token,
    };
  }

  @Get('/me')
  @UseGuards(JWTGuard)
  public async getUser(@Req() request) {
    const userId = request.user.id;

    const user = await this.users.findForId(userId);

    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private buildResponsePayload(
    user: User,
    accessToken: string,
    refreshToken?: string,
  ): AuthenticationPayload {
    return {
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: {
        type: 'bearer',
        access_token: accessToken,
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      },
    };
  }
}
