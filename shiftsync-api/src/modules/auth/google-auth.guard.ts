import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { getApiBaseUrl } from './utils/api-base-url';
import type { GoogleProfile } from './google.strategy';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }

    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const returnUrl =
      typeof req.query.returnUrl === 'string' && req.query.returnUrl.length > 0
        ? req.query.returnUrl
        : '/dashboard';

    const callbackURL = `${getApiBaseUrl(req)}/api/v1/auth/google/callback`;

    return {
      scope: ['email', 'profile'],
      state: this.authService.createOAuthState(returnUrl),
      callbackURL,
    };
  }

  handleRequest<TUser = GoogleProfile>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Google sign-in was cancelled');
    }
    return user;
  }
}
