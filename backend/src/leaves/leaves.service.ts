import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Leave,
  LeaveStatus,
} from './leave.entity';

import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(Leave)
    private readonly leavesRepository: Repository<Leave>,
  ) {}

  async create(createLeaveDto: CreateLeaveDto) {
    const {
      startDate,
      endDate,
    } = createLeaveDto;

    if (endDate < startDate) {
      throw new BadRequestException(
        'End date cannot be before start date',
      );
    }

    const overlappingLeave =
      await this.leavesRepository
        .createQueryBuilder('leave')
        .where(
          'leave.employeeId = :employeeId',
          {
            employeeId:
              createLeaveDto.employeeId,
          },
        )
        .andWhere(
          'leave.status IN (:...statuses)',
          {
            statuses: [
              LeaveStatus.PENDING,
              LeaveStatus.APPROVED,
            ],
          },
        )
        .andWhere(
          'leave.startDate <= :endDate',
          { endDate },
        )
        .andWhere(
          'leave.endDate >= :startDate',
          { startDate },
        )
        .getOne();

    if (overlappingLeave) {
      throw new BadRequestException(
        'Employee already has a pending or approved leave covering these dates',
      );
    }

    const leave =
      this.leavesRepository.create({
        ...createLeaveDto,
        status: LeaveStatus.PENDING,
        rejectionReason: null,
      });

    return this.leavesRepository.save(leave);
  }

  async findAll() {
    return this.leavesRepository.find({
      order: {
        startDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const leave =
      await this.leavesRepository.findOne({
        where: { id },
      });

    if (!leave) {
      throw new NotFoundException(
        'Leave request not found',
      );
    }

    return leave;
  }

  async findByEmployee(
    employeeId: number,
  ) {
    return this.leavesRepository.find({
      where: {
        employeeId,
      },
      order: {
        startDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(
    id: number,
    updateLeaveStatusDto: UpdateLeaveStatusDto,
  ) {
    const leave =
      await this.findOne(id);

    if (
      updateLeaveStatusDto.status ===
        LeaveStatus.REJECTED &&
      !updateLeaveStatusDto.rejectionReason?.trim()
    ) {
      throw new BadRequestException(
        'A rejection reason is required',
      );
    }

    leave.status =
      updateLeaveStatusDto.status;

    leave.rejectionReason =
      updateLeaveStatusDto.status ===
      LeaveStatus.REJECTED
        ? updateLeaveStatusDto.rejectionReason!.trim()
        : null;

    return this.leavesRepository.save(
      leave,
    );
  }

  async cancel(id: number) {
    const leave =
      await this.findOne(id);

    if (
      leave.status !==
      LeaveStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending leave requests can be cancelled',
      );
    }

    leave.status =
      LeaveStatus.CANCELLED;

    return this.leavesRepository.save(
      leave,
    );
  }

  async remove(id: number) {
    const leave =
      await this.findOne(id);

    await this.leavesRepository.remove(
      leave,
    );

    return {
      message: 'Leave request deleted successfully',
    };
  }
}
