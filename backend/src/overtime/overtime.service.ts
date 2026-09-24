import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Overtime,
  OvertimeStatus,
} from './overtime.entity';

import {
  CreateOvertimeDto,
} from './dto/create-overtime.dto';

import {
  UpdateOvertimeDto,
} from './dto/update-overtime.dto';

import {
  UpdateOvertimeStatusDto,
} from './dto/update-overtime-status.dto';

@Injectable()
export class OvertimeService {
  constructor(
    @InjectRepository(Overtime)
    private readonly overtimeRepository: Repository<Overtime>,
  ) {}

  async create(
    createOvertimeDto: CreateOvertimeDto,
  ) {
    const {
      employeeId,
      date,
      startTime,
      endTime,
    } = createOvertimeDto;

    if (endTime <= startTime) {
      throw new BadRequestException(
        'End time must be later than start time',
      );
    }

    const existingOvertime =
      await this.overtimeRepository.findOne({
        where: {
          employeeId,
          date,
          startTime,
          endTime,
        },
      });

    if (existingOvertime) {
      throw new BadRequestException(
        'An overtime record already exists for this employee and time',
      );
    }

    const overtime =
      this.overtimeRepository.create({
        ...createOvertimeDto,
        status:
          createOvertimeDto.status ||
          OvertimeStatus.PENDING,
        notes:
          createOvertimeDto.notes?.trim() ||
          null,
        rejectionReason: null,
      });

    return this.overtimeRepository.save(
      overtime,
    );
  }

  async findAll() {
    return this.overtimeRepository.find({
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const overtime =
      await this.overtimeRepository.findOne({
        where: {
          id,
        },
      });

    if (!overtime) {
      throw new NotFoundException(
        'Overtime record not found',
      );
    }

    return overtime;
  }

  async findByEmployee(
    employeeId: number,
  ) {
    return this.overtimeRepository.find({
      where: {
        employeeId,
      },
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async update(
    id: number,
    updateOvertimeDto: UpdateOvertimeDto,
  ) {
    const overtime =
      await this.findOne(id);

    const startTime =
      updateOvertimeDto.startTime ??
      overtime.startTime;

    const endTime =
      updateOvertimeDto.endTime ??
      overtime.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException(
        'End time must be later than start time',
      );
    }

    const employeeId =
      updateOvertimeDto.employeeId ??
      overtime.employeeId;

    const date =
      updateOvertimeDto.date ??
      overtime.date;

    const existingOvertime =
      await this.overtimeRepository.findOne({
        where: {
          employeeId,
          date,
          startTime,
          endTime,
        },
      });

    if (
      existingOvertime &&
      existingOvertime.id !== id
    ) {
      throw new BadRequestException(
        'An overtime record already exists for this employee and time',
      );
    }

    Object.assign(
      overtime,
      updateOvertimeDto,
    );

    if (
      updateOvertimeDto.notes !==
      undefined
    ) {
      overtime.notes =
        updateOvertimeDto.notes?.trim() ||
        null;
    }

    return this.overtimeRepository.save(
      overtime,
    );
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateOvertimeStatusDto,
  ) {
    const overtime =
      await this.findOne(id);

    if (
      updateStatusDto.status ===
        OvertimeStatus.REJECTED &&
      !updateStatusDto.rejectionReason?.trim()
    ) {
      throw new BadRequestException(
        'A rejection reason is required',
      );
    }

    overtime.status =
      updateStatusDto.status;

    overtime.rejectionReason =
      updateStatusDto.status ===
      OvertimeStatus.REJECTED
        ? updateStatusDto.rejectionReason!.trim()
        : null;

    return this.overtimeRepository.save(
      overtime,
    );
  }

  async remove(id: number) {
    const overtime =
      await this.findOne(id);

    await this.overtimeRepository.remove(
      overtime,
    );

    return {
      message:
        'Overtime record deleted successfully',
    };
  }
}
