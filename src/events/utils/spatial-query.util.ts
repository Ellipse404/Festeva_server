import { SelectQueryBuilder } from 'typeorm';
import { Event } from '../entities/event.entity';

export class SpatialQueryUtil {
  static applyNearbyFilter(
    queryBuilder: SelectQueryBuilder<Event>,
    latitude: number,
    longitude: number,
    radiusInMeters: number | undefined,
  ) {
    const origin = JSON.stringify({
      type: 'Point',
      coordinates: [longitude, latitude],
    });

    return queryBuilder
      .addSelect(
        'ST_Distance("event"."locationCoords"::geography, ST_GeomFromGeoJSON(:origin)::geography)',
        'distance_in_meters',
      )
      .where(
        'ST_DWithin("event"."locationCoords"::geography, ST_GeomFromGeoJSON(:origin)::geography, :radius)',
      )
      .orderBy('distance_in_meters', 'ASC')
      .setParameters({ origin, radius: radiusInMeters });
  }
}
