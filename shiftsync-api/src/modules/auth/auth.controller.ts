import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public, CurrentUser } from '../../common/decorators/auth.decorators';
import type { SessionPayload, SessionUser } from './auth.types';
import {
  LoginDto,
  RefreshDto,
  LogoutDto,
  UpdateNotificationsDto,
  ChangePasswordDto,
  OAuthExchangeDto,
} from './dto/LoginDto';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleOAuthRedirectFilter } from './google-oauth-redirect.filter';
import type { GoogleProfile } from './google.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Public auth configuration' })
  getAuthConfig(): { googleEnabled: boolean } {
    return { googleEnabled: this.authService.isGoogleAuthEnabled() };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and obtain tokens and session' })
  @ApiOkResponse({ description: 'Login successful; returns accessToken, refreshToken, session' })
  @ApiBadRequestResponse({ description: 'Invalid body or validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(@Body() dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    session: SessionPayload;
  }> {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth sign-in' })
  googleAuth(): void {
    // Passport handles the redirect to Google.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseFilters(GoogleOAuthRedirectFilter)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(
    @Req() req: Request & { user?: GoogleProfile },
    @Res() res: Response,
    @Query('state') state?: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      res.status(500).send('FRONTEND_URL is not configured');
      return;
    }

    try {
      const profile = req.user;
      if (!profile) {
        throw new Error('Missing Google profile');
      }

      const { returnUrl } = state
        ? this.authService.parseOAuthState(state)
        : { returnUrl: '/dashboard' };

      const { exchangeCode } = await this.authService.loginWithGoogle(profile);

      const redirectUrl = new URL('/auth/callback', frontendUrl);
      redirectUrl.searchParams.set('code', exchangeCode);
      redirectUrl.searchParams.set('returnUrl', returnUrl);
      res.redirect(redirectUrl.toString());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google sign-in failed';
      const redirectUrl = new URL('/login', frontendUrl);
      redirectUrl.searchParams.set('error', message);
      res.redirect(redirectUrl.toString());
    }
  }

  @Public()
  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange Google OAuth code for tokens' })
  async exchangeOAuthCode(@Body() dto: OAuthExchangeDto): Promise<{
    accessToken: string;
    refreshToken: string;
    session: SessionPayload;
  }> {
    return this.authService.exchangeOAuthCode(dto.code);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiOkResponse({ description: 'Tokens refreshed' })
  @ApiBadRequestResponse({ description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshDto): Promise<{
    accessToken: string;
    refreshToken: string;
    session: SessionPayload;
  }> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiOkResponse({ description: 'Logged out' })
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.authService.revokeRefreshToken(dto.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current session' })
  @ApiOkResponse({ description: 'Current session returned' })
  async me(@CurrentUser() user: SessionUser): Promise<SessionPayload> {
    return this.authService.getSessionForUser(user);
  }

  @Patch('me/notifications')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiOkResponse({ description: 'Preferences updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async updateNotifications(
    @CurrentUser() user: SessionUser,
    @Body() dto: UpdateNotificationsDto,
  ): Promise<void> {
    await this.authService.updateNotificationPreferences(
      user.id,
      dto.notifyInApp,
      dto.notifyEmail,
    );
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiOkResponse({ description: 'Password changed' })
  @ApiBadRequestResponse({ description: 'Validation failed or current password wrong' })
  async changePassword(
    @CurrentUser() user: SessionUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
