import { z } from 'zod';

export const RegisterPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  firstname: z.string(),
  lastname: z.string(),
});

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const RefreshPayloadSchema = z.object({
  refresh_token: z.string(),
});

export type RefreshPayload = z.infer<typeof RefreshPayloadSchema>;
