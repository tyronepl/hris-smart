import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AbsenceStatus {
  UNEXCUSED = 'UNEXCUSED',
  EXCUSED = 'EXCUSED',
}

@Entity('absences')
export class Absence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @Column({
    type: 'date',
  })
  date: string;

  @Column({
    type: 'enum',
    enum: AbsenceStatus,
    default: AbsenceStatus.UNEXCUSED,
  })
  status: AbsenceStatus;

  @Column()
  reason: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
