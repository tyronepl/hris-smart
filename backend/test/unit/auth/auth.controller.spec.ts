import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtAuthGuard } from '../../../src/auth/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: () => true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: authService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(mockJwtAuthGuard)
        .compile();

    controller =
      module.get<AuthController>(
        AuthController,
      );
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('register', () => {
    it('should call authService.register with the request body values', async () => {
      const body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = {
        message: 'HR account created successfully',
      };

      authService.register.mockResolvedValue(
        response,
      );

      const result =
        await controller.register(body);

      expect(
        authService.register,
      ).toHaveBeenCalledWith(
        body.name,
        body.email,
        body.password,
      );

      expect(result).toEqual(response);
    });
  });

  describe('login', () => {
    it('should call authService.login with email and password', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = {
        message: 'Login successful',
        accessToken: 'test-token',
      };

      authService.login.mockResolvedValue(
        response,
      );

      const result =
        await controller.login(loginDto);

      expect(
        authService.login,
      ).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );

      expect(result).toEqual(response);
    });
  });

  describe('getCurrentUser', () => {
    it('should call authService.getCurrentUser with the authenticated user id', async () => {
      const request = {
        user: {
          userId: 1,
        },
      };

      const response = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'HR',
      };

      authService.getCurrentUser.mockResolvedValue(
        response,
      );

      const result =
        await controller.getCurrentUser(
          request,
        );

      expect(
        authService.getCurrentUser,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(response);
    });
  });

  describe('updateProfile', () => {
    it('should call authService.updateProfile with user id and name', async () => {
      const request = {
        user: {
          userId: 1,
        },
      };

      const body = {
        name: 'Updated Name',
      };

      const response = {
        message: 'Profile updated successfully',
      };

      authService.updateProfile.mockResolvedValue(
        response,
      );

      const result =
        await controller.updateProfile(
          request,
          body,
        );

      expect(
        authService.updateProfile,
      ).toHaveBeenCalledWith(
        1,
        body.name,
      );

      expect(result).toEqual(response);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with user id and passwords', async () => {
      const request = {
        user: {
          userId: 1,
        },
      };

      const body = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

      const response = {
        message: 'Password changed successfully',
      };

      authService.changePassword.mockResolvedValue(
        response,
      );

      const result =
        await controller.changePassword(
          request,
          body,
        );

      expect(
        authService.changePassword,
      ).toHaveBeenCalledWith(
        1,
        body.currentPassword,
        body.newPassword,
      );

      expect(result).toEqual(response);
    });
  });
});