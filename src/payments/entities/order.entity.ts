import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type OrderStatus =
  'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index('idx_order_user_id')
  userId?: string;

  @Column()
  @Index('idx_order_event_id')
  eventId: string;

  @Column({ unique: true })
  @Index('idx_order_cf_id')
  cfOrderId: string;

  @Column({ nullable: true })
  paymentSessionId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 1 })
  ticketQuantity: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: OrderStatus;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerEmail?: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ nullable: true })
  paymentId?: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ nullable: true })
  idempotencyKey?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
