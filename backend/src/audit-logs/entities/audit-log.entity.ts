import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  userId: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  userName: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  action: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  module: string | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  recordId: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'longtext',
    nullable: true,
  })
  oldData: string | null;

  @Column({
    type: 'longtext',
    nullable: true,
  })
  newData: string | null;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
