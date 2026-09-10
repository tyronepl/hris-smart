import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ nullable: true, length: 100 })
  position: string;

  @Column({ nullable: true, length: 100 })
  department: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  skills: string;

  @Column({ nullable: true, type: 'text' })
  experience: string;

  @Column({ nullable: true, type: 'text' })
  education: string;

  @Column({ nullable: true, length: 255 })
  resumeOriginalName: string;

  @Column({ nullable: true, length: 500 })
  resumePath: string;

  @Column({ nullable: true, type: 'longtext' })
  resumeText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
