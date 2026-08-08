import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
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

  private mapToUiEvent(event: Event, distanceKm?: number) {
    const formattedDate = event.eventDate
      ? new Date(event.eventDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      id: event.id,
      title: event.title,
      category: event.type || 'others',
      description: event.description || '',
      posterUrl:
        event.posterUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      date: formattedDate,
      time: event.time || '18:00',
      locationName: event.locationAddress || 'Event Location',
      distanceKm:
        distanceKm ??
        (event.latitude ? Number((Math.random() * 4 + 0.5).toFixed(1)) : 2.5),
      ticketPrice: Number(event.ticketPrice || 0),
      availableSeats: event.availableSeats ?? 100,
      totalSeats: event.totalSeats ?? 100,
      hostName: event.hostName || 'Festeva Host',
      hostAvatar:
        event.hostAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      hostEmail: event.hostEmail || '',
      createdAt: event.createdAt
        ? new Date(event.createdAt).toISOString().split('T')[0]
        : formattedDate,
      latitude: event.latitude,
      longitude: event.longitude,
    };
  }

  async create(createEventDto: CreateEventDto) {
    try {
      const category =
        createEventDto.category || createEventDto.type || 'others';
      const locationAddress =
        createEventDto.locationAddress || createEventDto.locationName || '';
      const lat = createEventDto.latitude ?? 12.9716;
      const lng = createEventDto.longitude ?? 77.5946;

      const newEvent = this.eventRepository.create({
        title: createEventDto.title,
        description: createEventDto.description || '',
        type: category,
        eventDate: new Date(createEventDto.date),
        time: createEventDto.time || '18:00',
        ticketPrice: createEventDto.ticketPrice ?? 0,
        locationAddress: locationAddress,
        latitude: lat,
        longitude: lng,
        totalSeats: createEventDto.totalSeats ?? 100,
        availableSeats:
          createEventDto.availableSeats ?? createEventDto.totalSeats ?? 100,
        posterUrl:
          createEventDto.posterUrl ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
        hostName: createEventDto.hostName || 'Festeva Host',
        hostAvatar:
          createEventDto.hostAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        hostEmail: createEventDto.hostEmail || '',
      });

      const savedEvent = await this.eventRepository.save(newEvent);

      try {
        const geoJsonPoint = {
          type: 'Point',
          coordinates: [lng, lat],
        };
        await this.eventRepository
          .createQueryBuilder()
          .update(Event)
          .set({
            locationCoords: () =>
              `ST_GeomFromGeoJSON('${JSON.stringify(geoJsonPoint)}')`,
          })
          .where('id = :id', { id: savedEvent.id })
          .execute();
      } catch (err) {
        console.warn(
          'PostGIS update notice (skipped if PostGIS uninstalled):',
          (err as any)?.message || err,
        );
      }

      return this.mapToUiEvent(savedEvent);
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      console.error(
        'Database connection error in create:',
        err?.message || err,
      );
      throw new ServiceUnavailableException(
        'Database unavailable. Failed to save event to PostgreSQL database.',
      );
    }
  }

  async findAll(query?: { category?: string; searchQuery?: string }) {
    try {
      const qb = this.eventRepository.createQueryBuilder('event');

      if (query?.category && query.category !== 'all') {
        qb.andWhere('event.type = :category', { category: query.category });
      }

      if (query?.searchQuery) {
        qb.andWhere(
          '(LOWER(event.title) LIKE :search OR LOWER(event.locationAddress) LIKE :search OR LOWER(event.hostName) LIKE :search)',
          { search: `%${query.searchQuery.toLowerCase()}%` },
        );
      }

      qb.orderBy('event.createdAt', 'DESC');

      const events = await qb.getMany();
      return events.map((evt) => this.mapToUiEvent(evt));
    } catch (err: any) {
      console.error(
        'Database connection error in findAll:',
        err?.message || err,
      );
      throw new ServiceUnavailableException(
        'Database unavailable. Please verify PostgreSQL database connection.',
      );
    }
  }

  async findNearby(query: FindEventsQueryDto) {
    const { latitude, longitude, radiusInMeters } = query;

    try {
      const baseQuery = this.eventRepository.createQueryBuilder('event');
      const spatialQuery = SpatialQueryUtil.applyNearbyFilter(
        baseQuery,
        latitude,
        longitude,
        radiusInMeters,
      );

      const { entities, raw } = await spatialQuery.getRawAndEntities();

      return entities.map((event, index) => {
        const distMeters = raw[index]?.distance_in_meters ?? 2500;
        const distKm = Number((distMeters / 1000).toFixed(1));
        return this.mapToUiEvent(event, distKm);
      });
    } catch (err) {
      console.warn(
        'PostGIS spatial query fallback to standard query:',
        (err as any)?.message || err,
      );
      try {
        const events = await this.eventRepository.find({
          order: { createdAt: 'DESC' },
        });
        return events.map((evt) => this.mapToUiEvent(evt));
      } catch (dbErr: any) {
        throw new ServiceUnavailableException(
          'Database unavailable. Please verify PostgreSQL database connection.',
        );
      }
    }
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    return this.mapToUiEvent(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    Object.assign(event, updateEventDto);
    const updated = await this.eventRepository.save(event);
    return this.mapToUiEvent(updated);
  }

  async remove(id: string) {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    await this.eventRepository.remove(event);
    return { success: true, message: `Event #${id} deleted successfully` };
  }
}
