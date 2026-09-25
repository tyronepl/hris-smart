import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  AuditLog,
} from './entities/audit-log.entity';

import {
  CreateAuditLogDto,
} from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(
    data: CreateAuditLogDto,
  ): Promise<AuditLog> {
    const auditLog =
      this.auditLogRepository.create({
        userId: data.userId ?? null,

        userName:
          data.userName ?? null,

        action:
          data.action ?? null,

        module:
          data.module ?? null,

        recordId:
          data.recordId ?? null,

        description:
          data.description ?? null,

        oldData:
          data.oldData !== undefined
            ? JSON.stringify(data.oldData)
            : null,

        newData:
          data.newData !== undefined
            ? JSON.stringify(data.newData)
            : null,

        ipAddress:
          data.ipAddress ?? null,

        userAgent:
          data.userAgent ?? null,
      });

    return this.auditLogRepository.save(
      auditLog,
    );
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
  ): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({
      where: {
        id,
      },
    });
  }

  async clear(): Promise<void> {
    await this.auditLogRepository.clear();
  }
}
