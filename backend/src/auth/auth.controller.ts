import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    const user = await this.authService.register(
      body.name,
      body.email,
      body.password,
    );

    await this.auditLogsService.create({
      action: 'REGISTER',
      module: 'AUTH',
      description: `Registered new user ${body.email}`,
      newData: {
        name: body.name,
        email: body.email,
      },
    });

    return user;
  }

  @Post('login')
  async login(
    @Body()
    loginDto: LoginDto,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    await this.auditLogsService.create({
      action: 'LOGIN',
      module: 'AUTH',
      description: `User logged in: ${loginDto.email}`,
      newData: {
        email: loginDto.email,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(
    @Req()
    request: any,
  ) {
    return this.authService.getCurrentUser(
      request.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req()
    request: any,
    @Body()
    body: {
      name: string;
    },
  ) {
    const result =
      await this.authService.updateProfile(
        request.user.userId,
        body.name,
      );

    await this.auditLogsService.create({
      userId: request.user.userId,
      action: 'PROFILE_UPDATE',
      module: 'AUTH',
      recordId: request.user.userId,
      description: 'Updated account profile',
      newData: {
        name: body.name,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(
    @Req()
    request: any,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    const result =
      await this.authService.changePassword(
        request.user.userId,
        body.currentPassword,
        body.newPassword,
      );

    await this.auditLogsService.create({
      userId: request.user.userId,
      action: 'PASSWORD_CHANGE',
      module: 'AUTH',
      recordId: request.user.userId,
      description: 'Changed account password',
    });

    return result;
  }
}
