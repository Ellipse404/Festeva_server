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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  ticketPrice!: number;

  @Column({ type: 'text', nullable: true })
  locationAddress!: string;

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
