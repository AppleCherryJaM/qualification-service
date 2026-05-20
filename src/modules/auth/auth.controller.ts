/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    res.cookie(
      'refresh_token',
      result.refresh_token,
      getRefreshCookieOptions(),
    );
    return {
      access_token: result.access_token,
      expires_in: result.expires_in,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @GetUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(refreshToken);
    res.cookie(
      'refresh_token',
      result.refresh_token,
      getRefreshCookieOptions(),
    );
    return {
      access_token: result.access_token,
      expires_in: result.expires_in,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async logout(
    @GetUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token', { path: '/auth/refresh' }); // старый path
    res.clearCookie('refresh_token', { path: '/' }); // новый path
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @GetUser('sub') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(userId);
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'All sessions terminated' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: any) {
    return user;
  }
}
