import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventsQueryDto } from './dto/find-events-query.dto';
import { Event } from './entities/event.entity';
import { SpatialQueryUtil } from './utils/spatial-query.util';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto) {
    // implement database insertion later
    return 'This action adds a new event';
  }

  findAll() {
    return this.eventRepository.find();
  }

  async findNearby(query: FindEventsQueryDto) {
    const { latitude, longitude, radiusInMeters } = query;

    // Start a standard query builder
    const baseQuery = this.eventRepository
      .createQueryBuilder('event')
      .select([
        'event.id',
        'event.title',
        'event.description',
        'event.locationCoords',
      ]);

    // Use our utility class to attach the complex PostGIS SQL
    const spatialQuery = SpatialQueryUtil.applyNearbyFilter(
      baseQuery,
      latitude,
      longitude,
      radiusInMeters,
    );

    // getRawAndEntities grabs both the TypeORM objects and the raw SQL distance output
    const { entities, raw } = await spatialQuery.getRawAndEntities();

    // Map the distance back onto the event objects for the frontend
    return entities.map((event, index) => ({
      ...event,
      distanceInMeters: Math.round(raw[index].distance_in_meters),
    }));
  }

  findOne(id: string) {
    return this.eventRepository.findOneBy({ id });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: string) {
    return `This action removes a #${id} event`;
  }
}
