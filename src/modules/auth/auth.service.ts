import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
        | `${number}d`
        | `${number}s`,
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
    this.logger.log(
      `Refreshing with token: ${refreshToken.substring(0, 20)}...`,
    );

    const tokenEntity =
      await this.refreshTokensService.findByToken(refreshToken);
    this.logger.log(`Found: ${!!tokenEntity}`);

    if (!tokenEntity) {
      throw new ForbiddenException('Refresh token not found');
    }

    if (tokenEntity.revoked) {
      // Токен уже использован — возможна атака повторного воспроизведения.
      // НО: при параллельных запросах с фронта это ложное срабатывание.
      // Поэтому НЕ отзываем все сессии сразу — просто отказываем.
      this.logger.warn(`Revoked token used: ${refreshToken.substring(0, 20)}`);
      throw new ForbiddenException(
        'Refresh token already used. Please login again.',
      );
    }

    if (new Date() > tokenEntity.expiresAt) {
      throw new ForbiddenException('Refresh token expired');
    }

    this.logger.log('Token valid, generating new tokens');

    // Сначала rotate (отзываем старый), потом генерируем новый access token.
    // Порядок важен: если что-то упадёт после rotate — клиент получит 403
    // и будет вынужден залогиниться заново (это корректное поведение).
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
        | `${number}d`
        | `${number}s`,
    });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
      expires_in: 900,
      // ВАЖНО: возвращаем user — фронт обновляет zustand store через setAuth(data)
      user: {
        id: user.id,
        email: user.email,
        roles,
        employeeId: user.employeeId,
      },
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
