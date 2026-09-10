import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
  ) {
    const userCount = await this.usersService.count();

    if (userCount > 0) {
      throw new ForbiddenException(
        'HR registration is already closed',
      );
    }

    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      12,
    );

    const user = await this.usersService.create({
      name,
      email,
      passwordHash,
    });

    return {
      message: 'HR account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId: number) {
    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async updateProfile(
    userId: number,
    name: string,
  ) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new ConflictException(
        'Name cannot be empty',
      );
    }

    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    user.name = trimmedName;

    const updatedUser =
      await this.usersService.save(user);

    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    if (!newPassword || newPassword.length < 8) {
      throw new ConflictException(
        'New password must be at least 8 characters',
      );
    }

    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    const newPasswordHash =
      await bcrypt.hash(newPassword, 12);

    user.passwordHash = newPasswordHash;

    await this.usersService.save(user);

    return {
      message: 'Password changed successfully',
    };
  }
}
