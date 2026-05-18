/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/common/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokensService } from '../../modules/refresh-tokens/refresh-tokens.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly refreshTokensService: RefreshTokensService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token,
        (req: Request) => req?.body?.refresh_token,
      ]),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number }) {
    const token = req?.cookies?.refresh_token || req?.body?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokenEntity = await this.refreshTokensService.findByToken(token);
    if (!tokenEntity || tokenEntity.revoked) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    return {
      userId: payload.sub,
      refreshToken: token,
    };
  }
}
