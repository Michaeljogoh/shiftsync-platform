import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Catch(UnauthorizedException)
export class GoogleOAuthRedirectFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const redirectUrl = new URL('/login', frontendUrl);
    redirectUrl.searchParams.set(
      'error',
      exception.message || 'Google sign-in failed',
    );
    res.redirect(redirectUrl.toString());
  }
}
