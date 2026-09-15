import { jest } from '@jest/globals';

const mockBcryptCompare = jest.fn();
const mockBcryptHash = jest.fn();

jest.unstable_mockModule('bcrypt', () => ({
  compare: mockBcryptCompare,
  hash: mockBcryptHash,
}));

const { AuthService } =
  await import('../../../src/auth/auth.service');

import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../src/users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    count: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: UsersService,
            useValue: usersService,
          },
          {
            provide: JwtService,
            useValue: jwtService,
          },
        ],
      }).compile();

    service =
      module.get<AuthService>(AuthService);
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('register', () => {
    it('should register the first HR user successfully', async () => {
      usersService.count.mockResolvedValue(0);

      usersService.findByEmail.mockResolvedValue(
        null,
      );

      mockBcryptHash.mockResolvedValue(
        'hashed-password',
      );

      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      };

      usersService.create.mockResolvedValue(
        user,
      );

      const result =
        await service.register(
          'John Doe',
          'john@example.com',
          'password123',
        );

      expect(
        usersService.count,
      ).toHaveBeenCalledTimes(1);

      expect(
        usersService.findByEmail,
      ).toHaveBeenCalledWith(
        'john@example.com',
      );

      expect(
        mockBcryptHash,
      ).toHaveBeenCalledWith(
        'password123',
        12,
      );

      expect(
        usersService.create,
      ).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash:
          'hashed-password',
      });

      expect(result).toEqual({
        message:
          'HR account created successfully',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'HR',
        },
      });
    });

    it('should throw ForbiddenException when an HR account already exists', async () => {
      usersService.count.mockResolvedValue(1);

      await expect(
        service.register(
          'John Doe',
          'john@example.com',
          'password123',
        ),
      ).rejects.toThrow(
        ForbiddenException,
      );

      expect(
        usersService.findByEmail,
      ).not.toHaveBeenCalled();

      expect(
        usersService.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the email is already registered', async () => {
      usersService.count.mockResolvedValue(0);

      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
      });

      await expect(
        service.register(
          'John Doe',
          'john@example.com',
          'password123',
        ),
      ).rejects.toThrow(
        ConflictException,
      );

      expect(
        usersService.create,
      ).not.toHaveBeenCalled();

      expect(
        mockBcryptHash,
      ).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash:
          '$2b$12$hashed-password',
        role: 'HR',
      };

      usersService.findByEmail.mockResolvedValue(
        user,
      );

      mockBcryptCompare.mockResolvedValue(
        true,
      );

      jwtService.signAsync.mockResolvedValue(
        'test-access-token',
      );

      const result =
        await service.login(
          'john@example.com',
          'password123',
        );

      expect(
        usersService.findByEmail,
      ).toHaveBeenCalledWith(
        'john@example.com',
      );

      expect(
        mockBcryptCompare,
      ).toHaveBeenCalledWith(
        'password123',
        user.passwordHash,
      );

      expect(
        jwtService.signAsync,
      ).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      expect(result).toEqual({
        message: 'Login successful',
        accessToken:
          'test-access-token',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'HR',
        },
      });
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(
        null,
      );

      await expect(
        service.login(
          'unknown@example.com',
          'password123',
        ),
      ).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        mockBcryptCompare,
      ).not.toHaveBeenCalled();

      expect(
        jwtService.signAsync,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the password is incorrect', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash:
          '$2b$12$hashed-password',
        role: 'HR',
      };

      usersService.findByEmail.mockResolvedValue(
        user,
      );

      mockBcryptCompare.mockResolvedValue(
        false,
      );

      await expect(
        service.login(
          'john@example.com',
          'wrong-password',
        ),
      ).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        jwtService.signAsync,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      };

      usersService.findById.mockResolvedValue(
        user,
      );

      const result =
        await service.getCurrentUser(1);

      expect(
        usersService.findById,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'HR',
      });
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      usersService.findById.mockResolvedValue(
        null,
      );

      await expect(
        service.getCurrentUser(999),
      ).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update the user name successfully', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      };

      usersService.findById.mockResolvedValue(
        user,
      );

      usersService.save.mockResolvedValue({
        ...user,
        name: 'Updated Name',
      });

      const result =
        await service.updateProfile(
          1,
          '  Updated Name  ',
        );

      expect(
        usersService.findById,
      ).toHaveBeenCalledWith(1);

      expect(user.name).toBe(
        'Updated Name',
      );

      expect(
        usersService.save,
      ).toHaveBeenCalledWith(user);

      expect(result).toEqual({
        message:
          'Profile updated successfully',
        user: {
          id: 1,
          name: 'Updated Name',
          email: 'john@example.com',
          role: 'HR',
        },
      });
    });

    it('should throw ConflictException when the name is empty', async () => {
      await expect(
        service.updateProfile(1, '   '),
      ).rejects.toThrow(
        ConflictException,
      );

      expect(
        usersService.findById,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      usersService.findById.mockResolvedValue(
        null,
      );

      await expect(
        service.updateProfile(
          999,
          'Updated Name',
        ),
      ).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        usersService.save,
      ).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash:
          '$2b$12$old-hashed-password',
        role: 'HR',
      };

      usersService.findById.mockResolvedValue(
        user,
      );

      mockBcryptCompare.mockResolvedValue(
        true,
      );

      mockBcryptHash.mockResolvedValue(
        '$2b$12$new-hashed-password',
      );

      usersService.save.mockResolvedValue(
        user,
      );

      const result =
        await service.changePassword(
          1,
          'oldpassword',
          'newpassword123',
        );

      expect(
        usersService.findById,
      ).toHaveBeenCalledWith(1);

      expect(
        mockBcryptCompare,
      ).toHaveBeenCalledWith(
        'oldpassword',
        '$2b$12$old-hashed-password',
      );

      expect(
        mockBcryptHash,
      ).toHaveBeenCalledWith(
        'newpassword123',
        12,
      );

      expect(user.passwordHash).toBe(
        '$2b$12$new-hashed-password',
      );

      expect(
        usersService.save,
      ).toHaveBeenCalledWith(user);

      expect(result).toEqual({
        message:
          'Password changed successfully',
      });
    });

    it('should throw ConflictException when the new password is too short', async () => {
      await expect(
        service.changePassword(
          1,
          'oldpassword',
          'short',
        ),
      ).rejects.toThrow(
        ConflictException,
      );

      expect(
        usersService.findById,
      ).not.toHaveBeenCalled();

      expect(
        mockBcryptCompare,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      usersService.findById.mockResolvedValue(
        null,
      );

      await expect(
        service.changePassword(
          999,
          'oldpassword',
          'newpassword123',
        ),
      ).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        mockBcryptCompare,
      ).not.toHaveBeenCalled();

      expect(
        usersService.save,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the current password is incorrect', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash:
          '$2b$12$old-hashed-password',
        role: 'HR',
      };

      usersService.findById.mockResolvedValue(
        user,
      );

      mockBcryptCompare.mockResolvedValue(
        false,
      );

      await expect(
        service.changePassword(
          1,
          'wrong-password',
          'newpassword123',
        ),
      ).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        mockBcryptHash,
      ).not.toHaveBeenCalled();

      expect(
        usersService.save,
      ).not.toHaveBeenCalled();
    });
  });
});