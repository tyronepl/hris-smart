import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CalendarEventType {
  EVENT = 'EVENT',
  HOLIDAY = 'HOLIDAY',
}

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'date',
  })
  date: string;

  @Column({
    type: 'enum',
    enum: CalendarEventType,
    default: CalendarEventType.EVENT,
  })
  type: CalendarEventType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
