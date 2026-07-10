import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';

export type GoogleProfile = {
  provider: 'google';
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  picture?: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientID || !clientSecret) {
      super({
        clientID: 'disabled',
        clientSecret: 'disabled',
        callbackURL: 'http://localhost/disabled',
        scope: ['email', 'profile'],
      });
      return;
    }

    super({
      clientID,
      clientSecret,
      callbackURL: 'http://localhost/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleProfile {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Google account did not return an email address');
    }

    const givenName = profile.name?.givenName?.trim() || '';
    const familyName = profile.name?.familyName?.trim() || '';
    const fallbackName = profile.displayName?.trim() || email.split('@')[0];

    return {
      provider: 'google',
      providerAccountId: profile.id,
      email: email.toLowerCase(),
      emailVerified: profile.emails?.[0]?.verified ?? false,
      firstName: givenName || fallbackName,
      lastName: familyName || 'User',
      picture: profile.photos?.[0]?.value,
    };
  }
}
