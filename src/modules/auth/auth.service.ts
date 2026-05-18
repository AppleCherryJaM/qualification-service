// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.roles?.map((ur) => ur.role?.name).filter(Boolean) || [];

    const payload = {
      sub: user.id,
      login: user.email,
      roles,
      employeeId: user.employeeId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as
        | `${number}m`
        | `${number}h`
        | `${number}d`,
    });

    const refreshTokenEntity = await this.refreshTokensService.create(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshTokenEntity.token,
      expires_in: 900,
      user: {
        id: user.id,
        email: user.email,
        roles,
        employeeId: user.employeeId,
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenEntity =
      await this.refreshTokensService.findByToken(refreshToken);

    if (!tokenEntity) {
      throw new ForbiddenException('Refresh token not found');
    }

    if (tokenEntity.revoked) {
      await this.refreshTokensService.revokeAllForUser(tokenEntity.userId);
      throw new ForbiddenException(
        'Refresh token revoked. Please login again.',
      );
    }

    if (new Date() > tokenEntity.expiresAt) {
      throw new ForbiddenException('Refresh token expired');
    }

    const newRefreshToken = await this.refreshTokensService.create(
      tokenEntity.userId,
    );
    await this.refreshTokensService.rotate(refreshToken, newRefreshToken);

    const user = tokenEntity.user;
    const roles = user.roles?.map((ur) => ur.role?.name).filter(Boolean) || [];

    const payload = {
      sub: user.id,
      login: user.email,
      roles,
      employeeId: user.employeeId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as
        | `${number}m`
        | `${number}h`
        | `${number}d`,
    });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
      expires_in: 900,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokensService.revoke(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number) {
    await this.refreshTokensService.revokeAllForUser(userId);
    return { message: 'All sessions terminated' };
  }
}
