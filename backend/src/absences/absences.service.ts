import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Absence,
} from './absence.entity';

import {
  CreateAbsenceDto,
} from './dto/create-absence.dto';

import {
  UpdateAbsenceDto,
} from './dto/update-absence.dto';

@Injectable()
export class AbsencesService {
  constructor(
    @InjectRepository(Absence)
    private readonly absencesRepository: Repository<Absence>,
  ) {}

  async create(
    createAbsenceDto: CreateAbsenceDto,
  ) {
    const existingAbsence =
      await this.absencesRepository.findOne({
        where: {
          employeeId:
            createAbsenceDto.employeeId,
          date: createAbsenceDto.date,
        },
      });

    if (existingAbsence) {
      throw new BadRequestException(
        'An absence record already exists for this employee on this date',
      );
    }

    const absence =
      this.absencesRepository.create({
        ...createAbsenceDto,
        notes:
          createAbsenceDto.notes?.trim() ||
          null,
      });

    return this.absencesRepository.save(
      absence,
    );
  }

  async findAll() {
    return this.absencesRepository.find({
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const absence =
      await this.absencesRepository.findOne({
        where: {
          id,
        },
      });

    if (!absence) {
      throw new NotFoundException(
        'Absence record not found',
      );
    }

    return absence;
  }

  async findByEmployee(
    employeeId: number,
  ) {
    return this.absencesRepository.find({
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
    updateAbsenceDto: UpdateAbsenceDto,
  ) {
    const absence =
      await this.findOne(id);

    if (
      updateAbsenceDto.employeeId !==
        undefined ||
      updateAbsenceDto.date !==
        undefined
    ) {
      const employeeId =
        updateAbsenceDto.employeeId ??
        absence.employeeId;

      const date =
        updateAbsenceDto.date ??
        absence.date;

      const existingAbsence =
        await this.absencesRepository.findOne({
          where: {
            employeeId,
            date,
          },
        });

      if (
        existingAbsence &&
        existingAbsence.id !== id
      ) {
        throw new BadRequestException(
          'An absence record already exists for this employee on this date',
        );
      }
    }

    Object.assign(
      absence,
      updateAbsenceDto,
    );

    if (
      updateAbsenceDto.notes !==
      undefined
    ) {
      absence.notes =
        updateAbsenceDto.notes?.trim() ||
        null;
    }

    return this.absencesRepository.save(
      absence,
    );
  }

  async remove(id: number) {
    const absence =
      await this.findOne(id);

    await this.absencesRepository.remove(
      absence,
    );

    return {
      message:
        'Absence record deleted successfully',
    };
  }
}
