import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50, default: 'others' })
  type!: string;

  @Column({ type: 'timestamptz' })
  eventDate!: Date;

  @Column({ type: 'varchar', length: 50, default: '18:00' })
  time!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  ticketPrice!: number;

  @Column({ type: 'text', nullable: true })
  locationAddress!: string;

  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({ type: 'int', default: 100 })
  totalSeats!: number;

  @Column({ type: 'int', default: 100 })
  availableSeats!: number;

  @Column({ type: 'text', nullable: true })
  posterUrl!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'Festeva Host',
  })
  hostName!: string;

  @Column({ type: 'text', nullable: true })
  hostAvatar!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hostEmail!: string;

  // The PostGIS Geometry column for calculating distance
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  locationCoords: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
