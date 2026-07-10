import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthIdentity } from './entities/auth-identity.entity';
import {
  ROLE_PERMISSIONS,
  type Permission,
  type Resource,
} from './permissions.config';
import type {
  JwtPayload,
  SessionPayload,
  SessionUser,
} from './auth.types';
import type { GoogleProfile } from './google.strategy';
import * as crypto from 'crypto';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  session: SessionPayload;
};

type OAuthStatePayload = {
  type: 'oauth_state';
  returnUrl: string;
  nonce: string;
};

type OAuthExchangePayload = {
  type: 'oauth_exchange';
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepo: Repository<RefreshToken>,
    @InjectRepository(AuthIdentity)
    private readonly authIdentitiesRepo: Repository<AuthIdentity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  isGoogleAuthEnabled(): boolean {
    return Boolean(
      this.configService.get<string>('GOOGLE_CLIENT_ID') &&
        this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Continue with Google instead.',
      );
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException();
    }
    return user;
  }

  buildSession(user: User): SessionPayload {
    const rolePerms = ROLE_PERMISSIONS[user.role];

    const permissions: Record<Resource, string[]> = {
      users: rolePerms.users ?? [],
      locations: rolePerms.locations ?? [],
      shifts: rolePerms.shifts ?? [],
      assignments: rolePerms.assignments ?? [],
      swaps: rolePerms.swaps ?? [],
      analytics: rolePerms.analytics ?? [],
      audit: rolePerms.audit ?? [],
      availability: rolePerms.availability ?? [],
      skills: rolePerms.skills ?? [],
      notifications: rolePerms.notifications ?? [],
    };

    const features: Permission[] = Object.entries(rolePerms).flatMap(
      ([resource, actions]) =>
        actions.map(
          (action) => `${resource}:${action}` as Permission,
        ),
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone ?? null,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      role: user.role,
      permissions,
      features,
    };
  }

  createOAuthState(returnUrl: string): string {
    const safeReturnUrl = this.sanitizeReturnUrl(returnUrl);
    const payload: OAuthStatePayload = {
      type: 'oauth_state',
      returnUrl: safeReturnUrl,
      nonce: crypto.randomUUID(),
    };

    return this.jwtService.sign(payload, { expiresIn: '10m' });
  }

  parseOAuthState(state: string): { returnUrl: string } {
    let payload: OAuthStatePayload;
    try {
      payload = this.jwtService.verify<OAuthStatePayload>(state);
    } catch {
      throw new BadRequestException('Invalid or expired OAuth state');
    }

    if (payload.type !== 'oauth_state') {
      throw new BadRequestException('Invalid OAuth state');
    }

    return { returnUrl: this.sanitizeReturnUrl(payload.returnUrl) };
  }

  createOAuthExchangeCode(userId: string): string {
    const payload: OAuthExchangePayload = {
      type: 'oauth_exchange',
      sub: userId,
    };

    return this.jwtService.sign(payload, { expiresIn: '60s' });
  }

  async exchangeOAuthCode(code: string): Promise<AuthTokens> {
    let payload: OAuthExchangePayload;
    try {
      payload = this.jwtService.verify<OAuthExchangePayload>(code);
    } catch {
      throw new UnauthorizedException('Invalid or expired sign-in code');
    }

    if (payload.type !== 'oauth_exchange' || !payload.sub) {
      throw new UnauthorizedException('Invalid sign-in code');
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return this.issueTokens(user);
  }

  async loginWithGoogle(profile: GoogleProfile): Promise<{
    exchangeCode: string;
    returnUrl: string;
  }> {
    if (!profile.emailVerified) {
      throw new UnauthorizedException(
        'Your Google email address is not verified.',
      );
    }

    const user = await this.resolveGoogleUser(profile);
    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    return {
      exchangeCode: this.createOAuthExchangeCode(user.id),
      returnUrl: '/dashboard',
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthTokens> {
    const user = await this.validateUser(email, password);
    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);
    return this.issueTokens(user);
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokens = await this.refreshTokensRepo.find();
    for (const token of tokens) {
      const match = await bcrypt.compare(rawToken, token.tokenHash);
      if (match && !token.revokedAt) {
        token.revokedAt = new Date();
        await this.refreshTokensRepo.save(token);
        break;
      }
    }
  }

  async refresh(
    rawToken: string,
  ): Promise<AuthTokens> {
    const tokens = await this.refreshTokensRepo.find({
      relations: ['user'],
    });
    let matched: RefreshToken | undefined;
    for (const token of tokens) {
      const match = await bcrypt.compare(rawToken, token.tokenHash);
      if (match) {
        matched = token;
        break;
      }
    }

    if (
      !matched ||
      matched.revokedAt ||
      matched.expiresAt < new Date()
    ) {
      throw new UnauthorizedException();
    }

    matched.revokedAt = new Date();
    await this.refreshTokensRepo.save(matched);

    const user = await this.usersRepo.findOneOrFail({
      where: { id: matched.userId },
    });
    return this.issueTokens(user);
  }

  async getSessionForUser(user: SessionUser): Promise<SessionPayload> {
    const fullUser = await this.usersRepo.findOneOrFail({
      where: { id: user.id },
    });
    return this.buildSession(fullUser);
  }

  async updateNotificationPreferences(
    userId: string,
    notifyInApp: boolean,
    notifyEmail: boolean,
  ): Promise<void> {
    await this.usersRepo.update(userId, {
      notifyInApp,
      notifyEmail,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.passwordHash) {
      throw new BadRequestException(
        'Set a password first or continue using Google sign-in.',
      );
    }
    const valid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!valid) {
      throw new UnauthorizedException();
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.save(user);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const session = this.buildSession(user);
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user);
    return { accessToken, refreshToken, session };
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  private async issueRefreshToken(user: User): Promise<string> {
    const rawToken = crypto.randomUUID().replace(/-/g, '');
    const hash = await bcrypt.hash(rawToken, 12);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token = this.refreshTokensRepo.create({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
      revokedAt: null,
    });
    await this.refreshTokensRepo.save(token);
    return rawToken;
  }

  private async resolveGoogleUser(profile: GoogleProfile): Promise<User> {
    const existingIdentity = await this.authIdentitiesRepo.findOne({
      where: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
      relations: ['user'],
    });

    if (existingIdentity?.user) {
      if (!existingIdentity.user.isActive) {
        throw new UnauthorizedException(
          'Your account is inactive. Contact your workspace admin.',
        );
      }
      return existingIdentity.user;
    }

    const existingUser = await this.usersRepo.findOne({
      where: { email: profile.email },
    });

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new UnauthorizedException(
          'Your account is inactive. Contact your workspace admin.',
        );
      }

      await this.linkGoogleIdentity(existingUser, profile);
      return existingUser;
    }

    const user = this.usersRepo.create({
      email: profile.email,
      passwordHash: null,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: 'staff',
      isActive: true,
    });
    await this.usersRepo.save(user);
    await this.linkGoogleIdentity(user, profile);
    return user;
  }

  private async linkGoogleIdentity(
    user: User,
    profile: GoogleProfile,
  ): Promise<void> {
    const identity = this.authIdentitiesRepo.create({
      userId: user.id,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      email: profile.email,
    });
    await this.authIdentitiesRepo.save(identity);
  }

  private sanitizeReturnUrl(returnUrl: string): string {
    if (!returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
      return '/dashboard';
    }
    return returnUrl;
  }
}
