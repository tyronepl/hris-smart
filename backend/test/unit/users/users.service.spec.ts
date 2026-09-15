import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const repository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: getRepositoryToken(User),
            useValue: repository,
          },
        ],
      }).compile();

    service = module.get<UsersService>(
      UsersService,
    );
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      };

      repository.findOne.mockResolvedValue(user);

      const result =
        await service.findByEmail(
          'john@example.com',
        );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'john@example.com',
        },
      });

      expect(result).toEqual(user);
    });

    it('should return null when the user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result =
        await service.findByEmail(
          'unknown@example.com',
        );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'unknown@example.com',
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      };

      repository.findOne.mockResolvedValue(user);

      const result =
        await service.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(user);
    });

    it('should return null when the user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result =
        await service.findById(999);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a user with the HR role', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
      };

      const user = {
        id: 1,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: 'HR',
      };

      repository.create.mockReturnValue(user);
      repository.save.mockResolvedValue(user);

      const result =
        await service.create(data);

      expect(repository.create).toHaveBeenCalledWith({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: 'HR',
      });

      expect(repository.save).toHaveBeenCalledWith(
        user,
      );

      expect(result).toEqual(user);
    });

    it('should return the saved user', async () => {
      const data = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: 'another-hashed-password',
      };

      const createdUser = {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: 'HR',
      };

      const savedUser = {
        id: 2,
        ...createdUser,
      };

      repository.create.mockReturnValue(
        createdUser,
      );

      repository.save.mockResolvedValue(
        savedUser,
      );

      const result =
        await service.create(data);

      expect(result).toEqual(savedUser);
    });
  });

  describe('save', () => {
    it('should save a user', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      } as User;

      repository.save.mockResolvedValue(user);

      const result =
        await service.save(user);

      expect(repository.save).toHaveBeenCalledWith(
        user,
      );

      expect(result).toEqual(user);
    });

    it('should return the result from the repository', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'HR',
      } as User;

      const savedUser = {
        ...user,
      };

      repository.save.mockResolvedValue(
        savedUser,
      );

      const result =
        await service.save(user);

      expect(result).toBe(savedUser);
    });
  });

  describe('count', () => {
    it('should return the number of users', async () => {
      repository.count.mockResolvedValue(5);

      const result =
        await service.count();

      expect(repository.count).toHaveBeenCalledTimes(
        1,
      );

      expect(result).toBe(5);
    });

    it('should return zero when there are no users', async () => {
      repository.count.mockResolvedValue(0);

      const result =
        await service.count();

      expect(repository.count).toHaveBeenCalledTimes(
        1,
      );

      expect(result).toBe(0);
    });
  });
});
