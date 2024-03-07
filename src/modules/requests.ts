import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: 'A email is required' })
  readonly email: string;

  @IsNotEmpty({ message: 'A password is required to login' })
  readonly password: string;
}

export class RegisterRequest {
  @IsNotEmpty({ message: 'An email is required' })
  readonly email: string;

  @IsNotEmpty({ message: 'A firstname is required' })
  readonly firstname: string;

  @IsNotEmpty({ message: 'A lastname is required' })
  readonly lastname: string;

  @IsNotEmpty({ message: 'A password is required' })
  @MinLength(6, { message: 'Your password must be at least 6 characters' })
  readonly password: string;
}

export class RefreshRequest {
  @IsNotEmpty({ message: 'The refresh token is required' })
  readonly refresh_token: string;
}
