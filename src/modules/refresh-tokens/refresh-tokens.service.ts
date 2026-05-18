// src/modules/refresh-tokens/refresh-tokens.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../users/entities/RefreshToken.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async create(userId: number, ttlDays: number = 7): Promise<RefreshToken> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    const refreshToken = this.refreshTokenRepo.create({
      token,
      userId,
      expiresAt,
      revoked: false,
    });

    return this.refreshTokenRepo.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepo.findOne({
      where: { token },
      relations: ['user', 'user.roles', 'user.roles.role'],
    });
  }

  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepo.update({ token }, { revoked: true });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.refreshTokenRepo.update(
      { userId, revoked: false },
      { revoked: true },
    );
  }

  async rotate(oldToken: string, newToken: RefreshToken): Promise<void> {
    await this.refreshTokenRepo.update(
      { token: oldToken },
      { revoked: true, replacedByToken: newToken.token },
    );
  }

  async cleanupExpired(): Promise<void> {
    await this.refreshTokenRepo.delete({
      expiresAt: LessThan(new Date()),
      revoked: true,
    });
  }
}
