import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './events/entities/event.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventRepository = app.get<Repository<Event>>(getRepositoryToken(Event));

  const dummyEvents = [
    {
      title: 'Downtown Tech Meetup',
      description: 'Networking event in the city center.',
      eventDate: new Date('2026-08-15T18:00:00Z'),
      longitude: 77.5946,
      latitude: 12.9716,
    },
    {
      title: 'Coffee & Code - Outer Ring',
      description: 'Casual coding session at a cafe.',
      eventDate: new Date('2026-08-16T10:00:00Z'),
      longitude: 77.6412,
      latitude: 12.9352,
    },
    {
      title: 'Mountain Retreat Hackathon',
      description: 'Weekend long hackathon far from the city.',
      eventDate: new Date('2026-09-01T09:00:00Z'),
      longitude: 78.0123,
      latitude: 13.1234,
    },
  ];

  console.log('Seeding database with dummy events...');

  for (const event of dummyEvents) {
    const geoJsonPoint = {
      type: 'Point',
      coordinates: [event.longitude, event.latitude],
    };

    await eventRepository
      .createQueryBuilder()
      .insert()
      .into(Event)
      .values({
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        // Using locationCoords to match your entity
        locationCoords: () =>
          `ST_GeomFromGeoJSON('${JSON.stringify(geoJsonPoint)}')`,
      })
      .execute();
  }

  console.log('✅ Seeding complete!');
  await app.close();
}

bootstrap();
