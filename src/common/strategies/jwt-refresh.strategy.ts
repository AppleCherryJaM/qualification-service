/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/common/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { RefreshTokensService } from '../../modules/refresh-tokens/refresh-tokens.service';

// passport-jwt не подходит для hex refresh_token — он пытается декодировать
// токен как JWT и падает до вызова validate().
// passport-custom даёт полный контроль: мы сами читаем cookie и валидируем.
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly refreshTokensService: RefreshTokensService) {
    super();
  }

  async validate(req: Request) {
    console.log('=== JwtRefreshStrategy validate ===');

    const token = req?.cookies?.refresh_token || req?.body?.refresh_token;

    if (!token) {
      console.log('No refresh token in cookie or body');
      throw new UnauthorizedException('Refresh token missing');
    }

    console.log('token:', token.substring(0, 20) + '...');

    const tokenEntity = await this.refreshTokensService.findByToken(token);

    if (!tokenEntity) {
      console.log('Token not found in DB');
      throw new UnauthorizedException('Refresh token invalid');
    }

    if (tokenEntity.revoked) {
      console.log('Token is revoked');
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (new Date() > tokenEntity.expiresAt) {
      console.log('Token expired');
      throw new UnauthorizedException('Refresh token expired');
    }

    console.log('Token valid, userId:', tokenEntity.userId);

    return {
      userId: tokenEntity.userId,
      refreshToken: token,
    };
  }
}
