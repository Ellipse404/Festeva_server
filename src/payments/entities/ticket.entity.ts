import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('idx_ticket_order_id')
  orderId: string;

  @Column({ nullable: true })
  @Index('idx_ticket_user_id')
  userId?: string;

  @Column()
  @Index('idx_ticket_event_id')
  eventId: string;

  @Column({ unique: true })
  @Index('idx_ticket_code')
  ticketCode: string;

  @Column({ type: 'text', nullable: true })
  qrCodeDataUrl?: string;

  @Column({ type: 'varchar', default: 'VALID' })
  status: TicketStatus;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerEmail?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
