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
      title: 'Aarav & Priya Grand Wedding Reception',
      description:
        'Join us to celebrate the union of Aarav and Priya! Evening filled with gourmet dining, live music, and dancing.',
      type: 'reception',
      eventDate: new Date('2026-08-15T19:00:00Z'),
      time: '19:00',
      ticketPrice: 50,
      locationAddress: 'The Grand Pavilion Hall, Downtown',
      longitude: 77.5946,
      latitude: 12.9716,
      totalSeats: 250,
      availableSeats: 180,
      posterUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      hostName: 'Sharma Family',
      hostAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      hostEmail: 'sharma.reception@festeva.com',
    },
    {
      title: "Reyansh's 1st Birthday Annaprashan (Rice Ceremony)",
      description:
        'Blessing baby Reyansh as he takes his first solid food bite! Traditional rituals followed by family feast.',
      type: 'rice_ceremony',
      eventDate: new Date('2026-08-18T11:00:00Z'),
      time: '11:00',
      ticketPrice: 0,
      locationAddress: 'Lotus Heritage Banquet, Indiranagar',
      longitude: 77.6412,
      latitude: 12.9352,
      totalSeats: 120,
      availableSeats: 45,
      posterUrl:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
      hostName: 'Mehta Family',
      hostAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      hostEmail: 'mehta.family@festeva.com',
    },
    {
      title: "Sanya's Neon Lights 21st Birthday Bash",
      description:
        'Music, DJ set, open mocktail bar, and neon glow dancefloor! Come celebrate Sanya turned 21!',
      type: 'birthday',
      eventDate: new Date('2026-08-20T20:00:00Z'),
      time: '20:00',
      ticketPrice: 25,
      locationAddress: 'Sky Lounge Rooftop, MG Road',
      longitude: 77.6,
      latitude: 12.975,
      totalSeats: 80,
      availableSeats: 22,
      posterUrl:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
      hostName: 'Sanya Malhotra',
      hostAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      hostEmail: 'sanya21@festeva.com',
    },
    {
      title: 'Vikram & Ananya 25th Silver Jubilee Anniversary',
      description:
        '25 years of togetherness! Join us for a royal dinner party with live orchestra and retrospective photo gallery.',
      type: 'anniversary',
      eventDate: new Date('2026-08-25T18:30:00Z'),
      time: '18:30',
      ticketPrice: 0,
      locationAddress: 'Imperial Manor Gardens, Koramangala',
      longitude: 77.62,
      latitude: 12.93,
      totalSeats: 150,
      availableSeats: 60,
      posterUrl:
        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1000&q=80',
      hostName: 'Vikram & Ananya Kapoor',
      hostAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      hostEmail: 'kapoor.anniversary@festeva.com',
    },
  ];

  console.log('Seeding database with dummy events...');

  for (const event of dummyEvents) {
    const geoJsonPoint = {
      type: 'Point',
      coordinates: [event.longitude, event.latitude],
    };

    try {
      await eventRepository
        .createQueryBuilder()
        .insert()
        .into(Event)
        .values({
          title: event.title,
          description: event.description,
          type: event.type,
          eventDate: event.eventDate,
          time: event.time,
          ticketPrice: event.ticketPrice,
          locationAddress: event.locationAddress,
          latitude: event.latitude,
          longitude: event.longitude,
          totalSeats: event.totalSeats,
          availableSeats: event.availableSeats,
          posterUrl: event.posterUrl,
          hostName: event.hostName,
          hostAvatar: event.hostAvatar,
          hostEmail: event.hostEmail,
          locationCoords: () =>
            `ST_GeomFromGeoJSON('${JSON.stringify(geoJsonPoint)}')`,
        })
        .execute();
    } catch (err) {
      // Fallback insert without PostGIS SQL if PostGIS isn't installed
      await eventRepository.save({
        title: event.title,
        description: event.description,
        type: event.type,
        eventDate: event.eventDate,
        time: event.time,
        ticketPrice: event.ticketPrice,
        locationAddress: event.locationAddress,
        latitude: event.latitude,
        longitude: event.longitude,
        totalSeats: event.totalSeats,
        availableSeats: event.availableSeats,
        posterUrl: event.posterUrl,
        hostName: event.hostName,
        hostAvatar: event.hostAvatar,
        hostEmail: event.hostEmail,
      });
    }
  }

  console.log('✅ Seeding complete!');
  await app.close();
}

bootstrap();
